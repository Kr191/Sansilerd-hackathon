import { NextResponse } from 'next/server'
import { sansiriProperties } from '@/lib/sansiriData'
import { aiAgent } from '@/lib/aiAgent'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { property_id, price, downPayment, interestRate, tenure, goal } = body
    
    // Find property
    let property = sansiriProperties.find(p => p.id === property_id)
    
    // If property not found but price provided, create mock property
    if (!property && price) {
      property = {
        id: 'custom',
        name: 'Custom Property',
        price: price,
        averageRent: price * 0.004, // Estimate 0.4% of price per month
        rentalYield: 4.8,
        capitalGainProjection: { year3: 10, year5: 20, year10: 40 }
      } as any
    }

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const simulation = aiAgent.simulateInvestment(
      property,
      downPayment || property.price * 0.3,
      interestRate || 6.5,
      tenure || 20,
      goal || 'rent'
    )
    
    return NextResponse.json(simulation)
  } catch (error) {
    console.error('Error in simulate API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
