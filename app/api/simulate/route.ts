import { NextResponse } from 'next/server'
import { fetchSansiriProperties } from '@/lib/sansiriData'
import { aiAgent } from '@/lib/aiAgent'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const {
      property_id,
      down_payment,
      interest_rate,
      tenure,
      goal,
      // legacy field names
      price, downPayment, interestRate,
    } = body

    const resolvedDownPayment = down_payment ?? downPayment
    const resolvedRate        = interest_rate ?? interestRate ?? 4.2
    const resolvedTenure      = tenure ?? 20
    const resolvedGoal        = goal ?? 'rent'

    // Find property from live data
    const properties = await fetchSansiriProperties()
    let property = properties.find(p => p.id === property_id)

    if (!property && price) {
      property = {
        id: 'custom',
        name: 'Custom Property',
        price: price,
        averageRent: price * 0.004,
        rentalYield: 4.8,
        capitalGainProjection: { year3: 10, year5: 20, year10: 40 }
      } as any
    }

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const simulation = aiAgent.simulateInvestment(
      property,
      resolvedDownPayment ?? property.price * 0.3,
      resolvedRate,
      resolvedTenure,
      resolvedGoal
    )

    return NextResponse.json({
      ...simulation,
      tenure: resolvedTenure,
      interestRate: resolvedRate,
      downPaymentUsed: resolvedDownPayment,
    })
  } catch (error) {
    console.error('Error in simulate API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
