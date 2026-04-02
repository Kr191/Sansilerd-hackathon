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

  // บันทึก step ลง localStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (property) {
      const simulatorState = {
        propertyId,
        step,
        investmentData,
        verdictData
      }
      localStorage.setItem('simulatorState', JSON.stringify(simulatorState))
    }
  }, [step, propertyId, property, investmentData, verdictData])

  useEffect(() => {
    // ดึงข้อมูล property
    fetch(`/api/projects?id=${propertyId}`)
      .then(res => res.json())
      .then(data => {
        // ตรวจสอบและเติมข้อมูลที่ขาดหาย
        const propertyData = {
          ...data,
          capitalGainProjection: data.capitalGainProjection || {
            year3: 10,
            year5: 18,
            year10: 40
          },
          rentalYield: data.rentalYield || 5.0,
          occupancyRate: data.occupancyRate || 85,
          locationScore: data.locationScore || 75,
          liquidityScore: data.liquidityScore || 75
        }
        
        setProperty(propertyData)
        
        // กู้คืน state จาก localStorage ถ้ามี
        const savedState = localStorage.getItem('simulatorState')
        if (savedState) {
          try {
            const state = JSON.parse(savedState)
            if (state.propertyId === propertyId) {
              setStep(state.step || 'simulator')
              setInvestmentData(state.investmentData || null)
              setVerdictData(state.verdictData || null)
            }
          } catch (e) {
            console.error('Failed to restore simulator state:', e)
          }
        }
      })
      .catch(err => {
        console.error('Failed to fetch property:', err)
        // ถ้า fetch ไม่ได้ ลองใช้ข้อมูลจาก localStorage
        const savedProperty = localStorage.getItem('selectedProperty')
        if (savedProperty) {
          try {
            const data = JSON.parse(savedProperty)
            if (data.id === propertyId) {
              setProperty(data)
            }
          } catch (e) {
            console.error('Failed to parse saved property:', e)
          }
        }
      })
    
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
