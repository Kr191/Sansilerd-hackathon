import { NextResponse } from 'next/server'
import { fetchSansiriProperties } from '@/lib/sansiriData'
import { aiAgent } from '@/lib/aiAgent'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { 
      property_id, 
      simulation, 
      loanAssessment, 
      criteria 
    } = body
    
    // Find property from live data
    const properties = await fetchSansiriProperties()
    const property = properties.find(p => p.id === property_id)

    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const verdict = aiAgent.generateVerdict(
      property,
      simulation,
      loanAssessment,
      criteria
    )
    
    return NextResponse.json(verdict)
  } catch (error) {
    console.error('Error in verdict API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
