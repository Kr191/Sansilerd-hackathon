import { NextResponse } from 'next/server'
import { aiAgent } from '@/lib/aiAgent'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { income, expense, down_payment } = body
    
    if (!income || income <= 0) {
      return NextResponse.json(
        { error: 'Invalid income value' },
        { status: 400 }
      )
    }

    const result = aiAgent.calculateLoanAssessment(
      income,
      expense || 0,
      down_payment || 0
    )
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in analyze API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
