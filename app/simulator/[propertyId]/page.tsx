'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import SimulatorView from '@/components/SimulatorView'
import InvestmentLab from '@/components/InvestmentLab'
import AIVerdict from '@/components/AIVerdict'

export default function SimulatorPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const propertyId = params.propertyId as string
  
  const [step, setStep] = useState<'simulator' | 'lab' | 'verdict'>('simulator')
  const [property, setProperty] = useState<any>(null)
  const [userCriteria, setUserCriteria] = useState<any>(null)
  const [investmentData, setInvestmentData] = useState<any>(null)
  const [verdictData, setVerdictData] = useState<any>(null)

  useEffect(() => {
    // ดึงข้อมูล property
    fetch(`/api/projects?id=${propertyId}`)
      .then(res => res.json())
      .then(data => setProperty(data))
    
    // ดึงข้อมูล user criteria จาก query params
    const income = searchParams.get('income')
    const expense = searchParams.get('expense')
    if (income && expense) {
      setUserCriteria({
        income: parseFloat(income),
        expense: parseFloat(expense)
      })
    }
  }, [propertyId, searchParams])

  if (!property) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {step === 'simulator' && (
        <SimulatorView 
          property={property}
          onSimulate={() => setStep('lab')}
          onBack={() => router.push('/')}
        />
      )}

      {step === 'lab' && (
        <InvestmentLab
          property={property}
          userCriteria={userCriteria}
          onGetVerdict={(data) => {
            setInvestmentData(data)
            setStep('verdict')
          }}
          onBack={() => setStep('simulator')}
        />
      )}

      {step === 'verdict' && (
        <AIVerdict
          property={property}
          investmentData={investmentData}
          verdictData={verdictData}
          onBack={() => setStep('lab')}
        />
      )}

      <BottomNav />
    </div>
  )
}
