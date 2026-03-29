'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import DiscoveryForm from '@/components/DiscoveryForm'
import PropertyMatches from '@/components/PropertyMatches'

export default function Home() {
  const router = useRouter()
  const [searchCriteria, setSearchCriteria] = useState<any>(null)

  const handleSelectProperty = (property: any) => {
    // นำทางไปหน้า simulator พร้อมส่งข้อมูล
    const params = new URLSearchParams({
      income: searchCriteria?.income?.toString() || '0',
      expense: searchCriteria?.expense?.toString() || '0'
    })
    router.push(`/simulator/${property.id}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pb-20">
        {!searchCriteria && (
          <DiscoveryForm onSubmit={setSearchCriteria} />
        )}
        
        {searchCriteria && (
          <PropertyMatches 
            criteria={searchCriteria} 
            onSelectProperty={handleSelectProperty}
            onBack={() => setSearchCriteria(null)}
          />
        )}
      </main>

      <BottomNav />
    </div>
  )
}
