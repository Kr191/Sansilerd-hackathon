import { NextResponse } from 'next/server'
import { sansiriProperties } from '@/lib/sansiriData'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  // ถ้ามี id ให้ return โครงการเดี่ยว
  if (id) {
    const property = sansiriProperties.find(p => p.id === id)
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }
    return NextResponse.json(property)
  }
  
  // ถ้าไม่มี id ให้ return ทั้งหมด
  return NextResponse.json({ 
    projects: sansiriProperties,
    total: sansiriProperties.length 
  })
}
