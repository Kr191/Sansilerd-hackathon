import { Property } from './sansiriData'
import { aiAgent } from './aiAgent'

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[len1][len2]
}

// Check if two district names match exactly or are close enough
function isDistrictMatch(district1: string, district2: string, maxDistance: number = 2): boolean {
  const d1 = district1.toLowerCase().trim()
  const d2 = district2.toLowerCase().trim()
  
  // Exact match
  if (d1 === d2) return true
  
  // One contains the other
  if (d1.includes(d2) || d2.includes(d1)) return true
  
  // Use Levenshtein distance
  const distance = levenshteinDistance(d1, d2)
  
  // Accept if within maxDistance characters
  return distance <= maxDistance
}

// Get nearby provinces for fallback matching
function getNearbyProvinces(province: string): string[] {
  const provinceMap: Record<string, string[]> = {
    'Bangkok': ['Samut Prakan', 'Nonthaburi', 'Pathum Thani', 'Samut Sakhon'],
    'Samut Prakan': ['Bangkok', 'Chachoengsao'],
    'Pathum Thani': ['Bangkok', 'Nonthaburi', 'Ayutthaya'],
    'Nonthaburi': ['Bangkok', 'Pathum Thani'],
    'Chonburi': ['Rayong', 'Chachoengsao'],
    'Rayong': ['Chonburi', 'Chanthaburi'],
  }
  
  const normalized = province.trim()
  return provinceMap[normalized] || []
}

export function calculateMatchScore(property: Property, criteria: any): number {
  const match = aiAgent.calculateMatchScore(property, criteria)
  return match.score
}

export function getTopMatches(properties: Property[], criteria: any) {
  const targetCount = 5
  
  // 1. Filter by budget (with 10% flexibility)
  const budgetMargin = (criteria.budget_max - criteria.budget_min) * 0.1
  const budgetFiltered = properties.filter(p => 
    p.price >= (criteria.budget_min - budgetMargin) && 
    p.price <= (criteria.budget_max + budgetMargin)
  )

  if (budgetFiltered.length === 0) {
    return []
  }

  // 2. Filter by province first (strict)
  let provinceFiltered = budgetFiltered
  let targetProvince = ''
  
  if (criteria.province) {
    targetProvince = criteria.province
    provinceFiltered = budgetFiltered.filter(p => 
      p.province.toLowerCase() === targetProvince.toLowerCase() ||
      p.province.toLowerCase().includes(targetProvince.toLowerCase())
    )
    
    // If no match in selected province, use all
    if (provinceFiltered.length === 0) {
      console.warn(`No properties found in province: ${targetProvince}, using all properties`)
      provinceFiltered = budgetFiltered
      targetProvince = ''
    }
  }

  // 3. Filter by district/area (within same province)
  let locationFiltered = provinceFiltered
  let isStrictLocation = false
  
  if (criteria.district || criteria.location) {
    const searchLocation = (criteria.district || criteria.location || '').toLowerCase().trim()
    
    // Try strict district match first using fuzzy matching
    const strictMatches = provinceFiltered.filter(p => {
      const distMatch = isDistrictMatch(p.district, searchLocation, 2)
      const locMatch = isDistrictMatch(p.location, searchLocation, 2)
      const distIncludes = p.district.toLowerCase().includes(searchLocation)
      const locIncludes = p.location.toLowerCase().includes(searchLocation)
      return distMatch || locMatch || distIncludes || locIncludes
    })
    
    if (strictMatches.length >= 3) {
      locationFiltered = strictMatches
      isStrictLocation = true
    } else if (strictMatches.length > 0) {
      locationFiltered = strictMatches
      isStrictLocation = true
    } else {
      // Fall back to broader fuzzy matching within same province
      const searchTerms = searchLocation.split(/[\s,]+/).filter((t: string) => t.length > 2)
      
      if (searchTerms.length > 0) {
        const fuzzyMatches = provinceFiltered.filter(p => {
          return searchTerms.some((term: string) => {
            const distMatch = isDistrictMatch(p.district, term, 2)
            const locMatch = isDistrictMatch(p.location, term, 2)
            const btsMatch = p.nearBTS && isDistrictMatch(p.nearBTS, term, 2)
            const mrtMatch = p.nearMRT && isDistrictMatch(p.nearMRT, term, 2)
            return distMatch || locMatch || btsMatch || mrtMatch ||
              p.location.toLowerCase().includes(term) ||
              p.district.toLowerCase().includes(term) ||
              (p.nearBTS && p.nearBTS.toLowerCase().includes(term)) ||
              (p.nearMRT && p.nearMRT.toLowerCase().includes(term))
          })
        })
        if (fuzzyMatches.length > 0) {
          locationFiltered = fuzzyMatches
        }
      }
    }
  }

  // 4. Score all properties
  const scoredProperties = locationFiltered.map(property => {
    const match = aiAgent.calculateMatchScore(property, criteria)
    let adjustedScore = match.score
    
    if (criteria.goal === 'rent') {
      // Boost rental yield and occupancy
      const rentBonus = (property.rentalYield - 4) * 2
      const occupancyBonus = (property.occupancyRate - 80) * 0.5
      adjustedScore += rentBonus + occupancyBonus
    } else if (criteria.goal === 'flip') {
      // Boost capital gain and liquidity
      const gainBonus = (property.capitalGainProjection.year3 - 10) * 1.5
      const liquidityBonus = (property.liquidityScore - 70) * 0.3
      adjustedScore += gainBonus + liquidityBonus
    }
    
    // Province match bonus
    if (targetProvince && property.province.toLowerCase() === targetProvince.toLowerCase()) {
      adjustedScore += 8
    }
    
    // District match bonus
    if (isStrictLocation) {
      adjustedScore += 5
    }
    
    // High location score bonus
    if (property.locationScore > 85) {
      adjustedScore += 3
    }
    
    // Transit proximity bonus
    if (property.nearBTS || property.nearMRT) {
      adjustedScore += 4
    }
    
    // Budget fit penalty if far from midpoint
    const budgetMid = (criteria.budget_min + criteria.budget_max) / 2
    const budgetRange = criteria.budget_max - criteria.budget_min
    const budgetDeviation = Math.abs(property.price - budgetMid) / budgetRange
    const budgetPenalty = budgetDeviation > 0.4 ? -3 : 0
    adjustedScore += budgetPenalty
    
    return {
      property,
      score: Math.min(100, Math.max(0, adjustedScore)),
      originalMatch: match
    }
  })

  // 5. Sort and take top 5
  scoredProperties.sort((a, b) => b.score - a.score)
  let topMatches = scoredProperties.slice(0, targetCount)

  // 6. Fill to 5 from same province if needed
  if (topMatches.length < targetCount) {
    const existingIds = new Set(topMatches.map(m => m.property.id))
    
    const sameProvinceRemaining = provinceFiltered
      .filter(p => !existingIds.has(p.id))
      .map(property => {
        const match = aiAgent.calculateMatchScore(property, criteria)
        return {
          property,
          score: match.score * 0.9,
          originalMatch: match
        }
      })
      .sort((a, b) => b.score - a.score)
    
    const needed = targetCount - topMatches.length
    topMatches = [...topMatches, ...sameProvinceRemaining.slice(0, needed)]
    
    // Fill remaining from nearby provinces
    if (topMatches.length < targetCount && targetProvince) {
      const stillNeeded = targetCount - topMatches.length
      const existingIdsUpdated = new Set(topMatches.map(m => m.property.id))
      const nearbyProvinces = getNearbyProvinces(targetProvince)
      const nearbyProperties = budgetFiltered
        .filter(p => 
          !existingIdsUpdated.has(p.id) && 
          nearbyProvinces.some(np => p.province.toLowerCase().includes(np.toLowerCase()))
        )
        .map(property => {
          const match = aiAgent.calculateMatchScore(property, criteria)
          return {
            property,
            score: match.score * 0.75,
            originalMatch: match
          }
        })
        .sort((a, b) => b.score - a.score)
      topMatches = [...topMatches, ...nearbyProperties.slice(0, stillNeeded)]
    }
  }

  // 7. Format for frontend
  return topMatches.map((match) => {
    const reasons = match.originalMatch.reasons || []
    
    if (criteria.goal === 'rent' && match.property.rentalYield > 5.5) {
      reasons.push(`High rental yield ${match.property.rentalYield.toFixed(1)}%`)
    }
    if (criteria.goal === 'flip' && match.property.capitalGainProjection.year3 > 12) {
      reasons.push(`Projected gain ${match.property.capitalGainProjection.year3}% in 3 years`)
    }
    if (match.property.nearBTS) {
      reasons.push(`Near ${match.property.nearBTS}`)
    }
    if (match.property.locationScore > 90) {
      reasons.push('Prime location')
    }
    
    const isInTargetProvince = targetProvince && 
      match.property.province.toLowerCase() === targetProvince.toLowerCase()
    
    if (!isInTargetProvince && targetProvince) {
      reasons.push(`Nearby province: ${match.property.province}`)
    }
    
    return {
      ...match.property,
      match_score: Math.round(match.score),
      short_reason: reasons.slice(0, 3).join(' • '),
      premium: match.score > 85,
      riskLevel: match.originalMatch.riskLevel || 'medium'
    }
  })
}
