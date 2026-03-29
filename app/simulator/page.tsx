'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

export default function SimulatorIndexPage() {
  const router = useRouter()

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
