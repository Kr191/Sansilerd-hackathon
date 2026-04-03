'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { BarChart2, FlaskConical, ShieldCheck } from 'lucide-react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import SimulatorView from '@/components/SimulatorView'
import InvestmentLab from '@/components/InvestmentLab'
import AIVerdict from '@/components/AIVerdict'

const STEPS = [
  { id: 'simulator' as const, label: 'Simulator', icon: BarChart2 },
  { id: 'lab'       as const, label: 'Lab',       icon: FlaskConical },
  { id: 'verdict'   as const, label: 'Verdict',   icon: ShieldCheck },
]

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

  // Persist step state — versioned so stale shapes are ignored
  useEffect(() => {
    if (!property) return
    localStorage.setItem('simulatorState', JSON.stringify({ v: 4, propertyId, step, investmentData, verdictData }))
  }, [step, propertyId, property, investmentData, verdictData])

  useEffect(() => {
    fetch(`/api/projects?id=${propertyId}`)
      .then(res => res.json())
      .then(data => {
        setProperty({
          ...data,
          capitalGainProjection: data.capitalGainProjection || { year3: 10, year5: 18, year10: 40 },
          rentalYield:    data.rentalYield    || 5.0,
          occupancyRate:  data.occupancyRate  || 85,
          locationScore:  data.locationScore  || 75,
          liquidityScore: data.liquidityScore || 75,
        })
        // Restore previous step if same property
        try {
          const saved = localStorage.getItem('simulatorState')
          if (saved) {
            const state = JSON.parse(saved)
            // Only restore if same property AND same schema version
            if (state.v === 4 && state.propertyId === propertyId) {
              setStep(state.step || 'simulator')
              setInvestmentData(state.investmentData || null)
              setVerdictData(state.verdictData || null)
            } else {
              // Stale — clear it
              localStorage.removeItem('simulatorState')
            }
          }
        } catch {}
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem('selectedProperty')
          if (saved) {
            const data = JSON.parse(saved)
            if (data.id === propertyId) setProperty(data)
          }
        } catch {}
      })

    const income = searchParams.get('income')
    const expense = searchParams.get('expense')
    if (income && expense) {
      setUserCriteria({ income: parseFloat(income), expense: parseFloat(expense) })
    }
  }, [propertyId, searchParams])

  const stepIndex = STEPS.findIndex(s => s.id === step)

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
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
          onGetVerdict={(data) => { setInvestmentData(data); setStep('verdict') }}
          onBack={() => { setInvestmentData(null); setStep('simulator') }}
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
