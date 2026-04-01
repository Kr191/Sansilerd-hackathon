import { NextResponse } from 'next/server'
import { fetchSansiriProperties } from '@/lib/sansiriData'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  // Fetch live properties (falls back to hardcoded if API fails)
  const properties = await fetchSansiriProperties()

  // If id provided, return single property
  if (id) {
    const property = properties.find(p => p.id === id)
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }
    return NextResponse.json(property)
  }

  // Optional filters
  const province = searchParams.get('province')
  const category = searchParams.get('category') // condo | house | townhouse
  let filtered = properties
  if (province) filtered = filtered.filter(p => p.province.toLowerCase().includes(province.toLowerCase()))
  if (category) filtered = filtered.filter(p => p.type === category)

  return NextResponse.json({
    projects: filtered,
    total: filtered.length,
    source: 'live'
  })
}
