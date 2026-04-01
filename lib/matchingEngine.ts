import { Property } from './sansiriData'
import { aiAgent } from './aiAgent'

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
  const targetCount = 5 // ต้องการ 5 โครงการ
  
  // กรองตามงบประมาณ
  const budgetFiltered = properties.filter(p => 
    p.price >= criteria.budget_min && p.price <= criteria.budget_max
  )

  if (budgetFiltered.length === 0) {
    return []
  }


  // กรองตามพื้นที่ที่เลือก (ถ้ามี)
  let locationFiltered = budgetFiltered
  if (criteria.location) {
    const locationLower = criteria.location.toLowerCase()
    locationFiltered = budgetFiltered.filter(p => 
      p.location.toLowerCase().includes(locationLower) ||
      p.district.toLowerCase().includes(locationLower) ||
      p.province.toLowerCase().includes(locationLower)
    )
  }

  // ใช้ AI agent หาโครงการที่ตรงที่สุด
  let topMatches = aiAgent.getTopMatches(locationFiltered, criteria, targetCount)

  // ถ้าไม่ถึง 5 โครงการ ให้เติมโครงการใกล้เคียง
  if (topMatches.length < targetCount && topMatches.length > 0) {
    const existingIds = new Set(topMatches.map(m => m.property.id))
    const referenceProperty = topMatches[0].property
    
    // หาโครงการที่ใกล้เคียงที่สุด
    const nearbyProperties = budgetFiltered
      .filter(p => !existingIds.has(p.id))
      .map(p => {
        let distance = Infinity
        
        // คำนวณระยะทางถ้ามี coordinates
        if (referenceProperty.coordinates && p.coordinates) {
          distance = calculateDistance(
            referenceProperty.coordinates.lat,
            referenceProperty.coordinates.lng,
            p.coordinates.lat,
            p.coordinates.lng
          )
        }
        
        // คะแนนความใกล้เคียง (province > district > location)
        let proximityScore = 0
        if (p.province === referenceProperty.province) proximityScore += 30
        if (p.district === referenceProperty.district) proximityScore += 40
        if (p.location === referenceProperty.location) proximityScore += 30
        
        return { property: p, distance, proximityScore }
      })
      .sort((a, b) => {
        // เรียงตามคะแนนความใกล้เคียงก่อน แล้วค่อยระยะทาง
        if (b.proximityScore !== a.proximityScore) {
          return b.proximityScore - a.proximityScore
        }
        return a.distance - b.distance
      })
    
    // เติมโครงการให้ครบ 5
    const needed = targetCount - topMatches.length
    const additionalProperties = nearbyProperties.slice(0, needed)
    
    // คำนวณ match score สำหรับโครงการเพิ่มเติม
    const additionalMatches = additionalProperties.map((item, index) => {
      const match = aiAgent.calculateMatchScore(item.property, criteria)
      return {
        property: item.property,
        score: match.score * 0.9, // ลดคะแนนเล็กน้อยเพราะเป็นโครงการเติมเต็ม
        rank: topMatches.length + index + 1,
        reasons: [...match.reasons, 'โครงการใกล้เคียงพื้นที่ที่เลือก'],
        budgetFit: match.budgetFit,
        roiFit: match.roiFit,
        locationFit: match.locationFit * 0.9, // ลดคะแนน location เพราะไม่ตรงพื้นที่ที่เลือก
        riskLevel: match.riskLevel
      }
    })
    
    topMatches = [...topMatches, ...additionalMatches]
  }

  // ถ้ายังไม่มีเลย ให้ใช้ทั้งหมดที่กรองตามงบประมาณ
  if (topMatches.length === 0) {
    topMatches = aiAgent.getTopMatches(budgetFiltered, criteria, targetCount)
  }

  // Format สำหรับ frontend
  return topMatches.map(match => ({
    ...match.property,
    match_score: match.score,
    short_reason: match.reasons.join(' • '),
    premium: match.score > 85,
    riskLevel: match.riskLevel
  }))
}
