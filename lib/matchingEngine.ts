import { Property } from './sansiriData'
import { aiAgent } from './aiAgent'

// ฟังก์ชันคำนวณ Levenshtein distance (ระยะห่างระหว่างสตริง)
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

// ฟังก์ชันเช็คว่าชื่อเขตตรงกันหรือใกล้เคียงกัน
function isDistrictMatch(district1: string, district2: string, maxDistance: number = 2): boolean {
  const d1 = district1.toLowerCase().trim()
  const d2 = district2.toLowerCase().trim()
  
  // ตรงกันเป๊ะ
  if (d1 === d2) return true
  
  // มีคำที่ตรงกัน
  if (d1.includes(d2) || d2.includes(d1)) return true
  
  // ใช้ Levenshtein distance
  const distance = levenshteinDistance(d1, d2)
  
  // ยอมรับถ้าผิดไม่เกิน maxDistance ตัวอักษร
  return distance <= maxDistance
}

// ฟังก์ชันหาจังหวัดใกล้เคียง
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

// ฟังก์ชันคำนวณระยะทางระหว่าง 2 จุด (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // รัศมีโลกเป็น km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export function getTopMatches(properties: Property[], criteria: any) {
  const targetCount = 5
  
  // 1. กรองตามงบประมาณ (เพิ่มความยืดหยุ่น 10%)
  const budgetMargin = (criteria.budget_max - criteria.budget_min) * 0.1
  const budgetFiltered = properties.filter(p => 
    p.price >= (criteria.budget_min - budgetMargin) && 
    p.price <= (criteria.budget_max + budgetMargin)
  )

  if (budgetFiltered.length === 0) {
    return []
  }

  // 2. กรองตามจังหวัดก่อน (STRICT) - ต้องอยู่ในจังหวัดเดียวกัน
  let provinceFiltered = budgetFiltered
  let targetProvince = ''
  
  if (criteria.province) {
    targetProvince = criteria.province
    provinceFiltered = budgetFiltered.filter(p => 
      p.province.toLowerCase() === targetProvince.toLowerCase() ||
      p.province.toLowerCase().includes(targetProvince.toLowerCase())
    )
    
    // ถ้าไม่เจอเลยในจังหวัดที่เลือก ให้ใช้ทั้งหมด
    if (provinceFiltered.length === 0) {
      console.warn(`No properties found in province: ${targetProvince}, using all properties`)
      provinceFiltered = budgetFiltered
      targetProvince = '' // reset เพื่อไม่ให้มีโบนัสคะแนน
    }
  }

  // 3. กรองตามเขต/พื้นที่ (ถ้ามี) - ภายในจังหวัดเดียวกัน
  let locationFiltered = provinceFiltered
  let isStrictLocation = false
  
  if (criteria.district || criteria.location) {
    const searchLocation = (criteria.district || criteria.location || '').toLowerCase().trim()
    
    // ลองกรองแบบเข้มงวดก่อน (ต้องตรงเขต/district) โดยใช้ fuzzy matching
    const strictMatches = provinceFiltered.filter(p => {
      // ตรวจสอบด้วย fuzzy matching (ยอมรับผิด 1-2 ตัวอักษร)
      const distMatch = isDistrictMatch(p.district, searchLocation, 2)
      const locMatch = isDistrictMatch(p.location, searchLocation, 2)
      
      // หรือมีคำที่ตรงกัน
      const distIncludes = p.district.toLowerCase().includes(searchLocation)
      const locIncludes = p.location.toLowerCase().includes(searchLocation)
      
      return distMatch || locMatch || distIncludes || locIncludes
    })
    
    if (strictMatches.length >= 3) {
      locationFiltered = strictMatches
      isStrictLocation = true
    } else if (strictMatches.length > 0) {
      // มีบ้างแต่ไม่ถึง 3 ก็ใช้ที่มี
      locationFiltered = strictMatches
      isStrictLocation = true
    } else {
      // ถ้าไม่เจอเลย ให้ใช้การจับคู่แบบ fuzzy กว้างขึ้น (ภายในจังหวัดเดียวกัน)
      const searchTerms = searchLocation.split(/[\s,]+/).filter((t: string) => t.length > 2)
      
      if (searchTerms.length > 0) {
        const fuzzyMatches = provinceFiltered.filter(p => {
          return searchTerms.some((term: string) => {
            // ใช้ fuzzy matching กับแต่ละ term
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
        // ถ้ายังไม่เจอ ให้ใช้ทั้งหมดในจังหวัด
      }
    }
  }

  // 4. คำนวณ match score สำหรับทุกโครงการ
  const scoredProperties = locationFiltered.map(property => {
    const match = aiAgent.calculateMatchScore(property, criteria)
    
    // ปรับคะแนนตามเป้าหมาย
    let adjustedScore = match.score
    
    if (criteria.goal === 'rent') {
      // เน้น rental yield และ occupancy rate
      const rentBonus = (property.rentalYield - 4) * 2 // +2 คะแนนต่อ 1% yield
      const occupancyBonus = (property.occupancyRate - 80) * 0.5
      adjustedScore += rentBonus + occupancyBonus
    } else if (criteria.goal === 'flip') {
      // เน้น capital gain และ liquidity
      const gainBonus = (property.capitalGainProjection.year3 - 10) * 1.5
      const liquidityBonus = (property.liquidityScore - 70) * 0.3
      adjustedScore += gainBonus + liquidityBonus
    }
    
    // โบนัสสำหรับจังหวัดที่ตรงเป้าหมาย
    if (targetProvince && property.province.toLowerCase() === targetProvince.toLowerCase()) {
      adjustedScore += 8 // โบนัสสูงเพราะเป็นเงื่อนไขสำคัญ
    }
    
    // โบนัสสำหรับเขต/พื้นที่ที่ตรงเป้าหมาย
    if (isStrictLocation) {
      adjustedScore += 5
    }
    
    // โบนัสสำหรับ location score สูง
    if (property.locationScore > 85) {
      adjustedScore += 3
    }
    
    // โบนัสสำหรับใกล้ BTS/MRT
    if (property.nearBTS || property.nearMRT) {
      adjustedScore += 4
    }
    
    // ปรับคะแนนตามงบประมาณ (ยิ่งใกล้กลางช่วงยิ่งดี)
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

  // 5. เรียงตามคะแนนและเลือก top 5
  scoredProperties.sort((a, b) => b.score - a.score)
  let topMatches = scoredProperties.slice(0, targetCount)

  // 6. ถ้าไม่ครบ 5 ให้เติมจากโครงการในจังหวัดเดียวกันก่อน
  if (topMatches.length < targetCount) {
    const existingIds = new Set(topMatches.map(m => m.property.id))
    
    // ลองหาเพิ่มจากจังหวัดเดียวกันก่อน
    const sameProvinceRemaining = provinceFiltered
      .filter(p => !existingIds.has(p.id))
      .map(property => {
        const match = aiAgent.calculateMatchScore(property, criteria)
        return {
          property,
          score: match.score * 0.9, // ลดคะแนนเล็กน้อย
          originalMatch: match
        }
      })
      .sort((a, b) => b.score - a.score)
    
    const needed = targetCount - topMatches.length
    const additionalFromProvince = sameProvinceRemaining.slice(0, needed)
    topMatches = [...topMatches, ...additionalFromProvince]
    
    // ถ้ายังไม่ครบ และมีจังหวัดที่ระบุ ให้หาจากเขตใกล้เคียง
    if (topMatches.length < targetCount && targetProvince) {
      const stillNeeded = targetCount - topMatches.length
      const existingIdsUpdated = new Set(topMatches.map(m => m.property.id))
      
      // หาจากจังหวัดใกล้เคียง (เช่น กรุงเทพ -> ปริมณฑล)
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
            score: match.score * 0.75, // ลดคะแนนมากขึ้นเพราะต่างจังหวัด
            originalMatch: match
          }
        })
        .sort((a, b) => b.score - a.score)
      
      topMatches = [...topMatches, ...nearbyProperties.slice(0, stillNeeded)]
    }
  }

  // 7. Format สำหรับ frontend
  return topMatches.map((match, index) => {
    const reasons = match.originalMatch.reasons || []
    
    // เพิ่มเหตุผลเฉพาะตามเป้าหมาย
    if (criteria.goal === 'rent' && match.property.rentalYield > 5.5) {
      reasons.push(`ผลตอบแทนค่าเช่าสูง ${match.property.rentalYield.toFixed(1)}%`)
    }
    if (criteria.goal === 'flip' && match.property.capitalGainProjection.year3 > 12) {
      reasons.push(`มูลค่าเพิ่มคาดการณ์ ${match.property.capitalGainProjection.year3}% ใน 3 ปี`)
    }
    if (match.property.nearBTS) {
      reasons.push(`ใกล้ ${match.property.nearBTS}`)
    }
    if (match.property.locationScore > 90) {
      reasons.push('ทำเลเยี่ยม')
    }
    
    // แสดงว่าอยู่ในจังหวัดเดียวกันหรือไม่
    const isInTargetProvince = targetProvince && 
      match.property.province.toLowerCase() === targetProvince.toLowerCase()
    
    if (!isInTargetProvince && targetProvince) {
      reasons.push(`จังหวัดใกล้เคียง: ${match.property.province}`)
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
