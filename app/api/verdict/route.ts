import { NextResponse } from 'next/server'
import { fetchSansiriProperties } from '@/lib/sansiriData'
import { aiAgent } from '@/lib/aiAgent'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { 
      property_id, 
      simulation, 
      user_profile,
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

    // Build loanAssessment and criteria from user_profile if not provided directly
    const resolvedLoan = loanAssessment || {
      status: 'passed',
      dti: user_profile?.expense / (user_profile?.income || 1),
      maxLoan: 0,
      monthlyCapacity: (user_profile?.income || 0) * 0.35,
    }
    const resolvedCriteria = criteria || {
      budget_min: property.price * 0.8,
      budget_max: property.price * 1.2,
      goal: 'rent' as const,
      income: user_profile?.income,
      expense: user_profile?.expense,
    }

    const verdict = aiAgent.generateVerdict(
      property,
      simulation,
      resolvedLoan,
      resolvedCriteria
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
