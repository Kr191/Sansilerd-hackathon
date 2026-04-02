'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export default function SimulatorIndexPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // ตรวจสอบว่ามี property ที่เลือกไว้ใน localStorage หรือไม่
    const savedProperty = localStorage.getItem('selectedProperty')
    const savedCriteria = sessionStorage.getItem('searchCriteria')
    
    if (savedProperty) {
      try {
        const property = JSON.parse(savedProperty)
        const criteria = savedCriteria ? JSON.parse(savedCriteria) : null
        
        // Redirect ไปที่ property ที่เลือกไว้
        const params = new URLSearchParams({
          income: criteria?.income?.toString() || '0',
          expense: criteria?.expense?.toString() || '0'
        })
        router.push(`/simulator/${property.id}?${params.toString()}`)
        return
      } catch (e) {
        console.error('Failed to parse saved property:', e)
        localStorage.removeItem('selectedProperty')
      }
    }
    
    setIsChecking(false)
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pb-20">
        <div className="max-w-md mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4">Investment Simulator</h1>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <p className="text-gray-600 mb-4">
              Select a property from Discover to start simulating your investment.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Discover
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
