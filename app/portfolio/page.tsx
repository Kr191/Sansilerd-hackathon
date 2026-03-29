'use client'

import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Portfolio from '@/components/Portfolio'

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Portfolio />
      <BottomNav />
    </div>
  )
}
