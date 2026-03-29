import { NextResponse } from 'next/server'
import { sansiriProperties } from '@/lib/sansiriData'
import { aiAgent } from '@/lib/aiAgent'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.budget_min || !body.budget_max || !body.goal) {
      return NextResponse.json(
        { error: 'Missing required fields: budget_min, budget_max, goal' },
        { status: 400 }
      )
    }

    // Validate income and expense
    if (!body.income || body.income <= 0) {
      return NextResponse.json(
        { error: 'Invalid income value' },
        { status: 400 }
      )
    }

    if (body.expense === undefined || body.expense < 0) {
      return NextResponse.json(
        { error: 'Invalid expense value' },
        { status: 400 }
      )
    }

    // Search properties based on budget
    let budgetFilteredProperties = sansiriProperties.filter(p => 
      p.price >= body.budget_min && p.price <= body.budget_max
    )

    // If no properties in budget, expand by 20%
    if (budgetFilteredProperties.length === 0) {
      const expandedMax = body.budget_max * 1.2
      budgetFilteredProperties = sansiriProperties.filter(p => 
        p.price >= body.budget_min && p.price <= expandedMax
      )
    }

    // If still no properties, use all properties
    if (budgetFilteredProperties.length === 0) {
      budgetFilteredProperties = sansiriProperties
    }

    // Try to match by exact location
    let exactLocationMatches: any[] = []
    let exactLocationMatch = false
    
    if (body.province || body.district || body.location) {
      exactLocationMatches = budgetFilteredProperties.filter(property => {
        if (body.province === 'Bangkok' && body.district) {
          // Match Bangkok district
          return property.province === 'Bangkok' && 
                 property.district.toLowerCase().includes(body.district.toLowerCase())
        } else if (body.province) {
          // Match province
          return property.province === body.province
        } else if (body.location) {
          // Match general location
          const locationLower = body.location.toLowerCase()
          return property.location.toLowerCase().includes(locationLower) ||
                 property.district.toLowerCase().includes(locationLower) ||
                 property.province.toLowerCase().includes(locationLower)
        }
        return false
      })

      if (exactLocationMatches.length > 0) {
        exactLocationMatch = true
      }
    }

    // Determine which properties to use for matching
    let propertiesToMatch = budgetFilteredProperties
    let needsNearbyFill = false
    let message = ''

    if (exactLocationMatch && exactLocationMatches.length > 0) {
      // If we have exact matches but less than 5, we'll fill with nearby
      if (exactLocationMatches.length < 5) {
        needsNearbyFill = true
        propertiesToMatch = budgetFilteredProperties // Use all for AI to pick best
        message = `พบ ${exactLocationMatches.length} โครงการใน ${body.district || body.province} เติมโครงการใกล้เคียงให้ครบ Top 5`
      } else {
        // We have 5 or more exact matches
        propertiesToMatch = exactLocationMatches
      }
    } else if ((body.province || body.district) && exactLocationMatches.length === 0) {
      // No exact matches found
      message = `ไม่พบโครงการใน ${body.district || body.province} แสดงโครงการใกล้เคียงแทน`
      exactLocationMatch = false
    }

    // Use AI agent to get top 5 matches
    const topMatches = aiAgent.getTopMatches(propertiesToMatch, body, 5)

    // If we need to fill with nearby properties
    if (needsNearbyFill && exactLocationMatches.length > 0) {
      // Prioritize exact location matches first
      const exactMatchIds = new Set(exactLocationMatches.map(p => p.id))
      const sortedMatches = [
        ...topMatches.filter(m => exactMatchIds.has(m.property.id)),
        ...topMatches.filter(m => !exactMatchIds.has(m.property.id))
      ].slice(0, 5)
      
      // Re-rank
      sortedMatches.forEach((match, index) => {
        match.rank = index + 1
      })
      
      // Format response
      const recommendations = sortedMatches.map(match => ({
        rank: match.rank,
        id: match.property.id,
        name: match.property.name,
        price: match.property.price,
        location: match.property.location,
        district: match.property.district,
        province: match.property.province,
        image: match.property.image,
        match_score: match.score,
        short_reason: match.reasons.join(' • '),
        roi: match.property.rentalYield,
        type: match.property.type,
        size: match.property.size,
        bedrooms: match.property.bedrooms,
        bathrooms: match.property.bathrooms,
        nearBTS: match.property.nearBTS,
        nearMRT: match.property.nearMRT,
        amenities: match.property.amenities,
        riskLevel: match.riskLevel,
        premium: match.score > 85,
        locationMatch: exactMatchIds.has(match.property.id)
      }))

      return NextResponse.json({ 
        recommendations,
        total: propertiesToMatch.length,
        criteria: body,
        exactLocationMatch: false,
        partialLocationMatch: true,
        message
      })
    }

    // Format response for normal cases
    const recommendations = topMatches.map(match => ({
      rank: match.rank,
      id: match.property.id,
      name: match.property.name,
      price: match.property.price,
      location: match.property.location,
      district: match.property.district,
      province: match.property.province,
      image: match.property.image,
      match_score: match.score,
      short_reason: match.reasons.join(' • '),
      roi: match.property.rentalYield,
      type: match.property.type,
      size: match.property.size,
      bedrooms: match.property.bedrooms,
      bathrooms: match.property.bathrooms,
      nearBTS: match.property.nearBTS,
      nearMRT: match.property.nearMRT,
      amenities: match.property.amenities,
      riskLevel: match.riskLevel,
      premium: match.score > 85,
      locationMatch: exactLocationMatch
    }))

    return NextResponse.json({ 
      recommendations,
      total: propertiesToMatch.length,
      criteria: body,
      exactLocationMatch,
      message: message || undefined
    })
  } catch (error) {
    console.error('Error in recommend API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
