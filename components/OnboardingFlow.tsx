'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, TrendingUp, Home, DollarSign, BarChart2 } from 'lucide-react'

const STEPS = [
  {
    icon: <TrendingUp className="w-10 h-10 text-violet-600" />,
    title: 'What is ROI?',
    body: 'Return on Investment (ROI) measures how much profit you make relative to what you invested. A 6% ROI means for every ฿100 invested, you earn ฿6 per year.',
    example: 'Property ฿3M → Rent ฿15,000/mo → ROI ≈ 6%',
    color: 'from-violet-50 to-white',
  },
  {
    icon: <BarChart2 className="w-10 h-10 text-blue-600" />,
    title: 'What is DTI?',
    body: 'Debt-to-Income ratio (DTI) is your monthly debt payments divided by your monthly income. Thai banks typically require DTI below 40% to approve a mortgage.',
    example: 'Income ฿50K, Expenses ฿15K → DTI = 30% ✓',
    color: 'from-blue-50 to-white',
  },
  {
    icon: <DollarSign className="w-10 h-10 text-lime-600" />,
    title: 'What is Capital Gain?',
    body: 'Capital gain is the increase in property value over time. If you buy at ฿3M and sell at ฿3.6M after 5 years, your capital gain is 20%.',
    example: 'Buy ฿3M → Sell ฿3.6M (5yr) → +20% gain',
    color: 'from-lime-50 to-white',
  },
  {
    icon: <Home className="w-10 h-10 text-emerald-600" />,
    title: 'Rent vs Flip',
    body: 'Rent: Buy and hold — earn monthly rental income. Best for stable cash flow.\n\nFlip: Buy and sell — profit from price appreciation. Best for short-term capital gain.',
    example: 'Rent = steady income. Flip = lump-sum profit.',
    color: 'from-emerald-50 to-white',
  },
]

export default function OnboardingFlow() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem('onboarding_done')
    if (!seen) setVisible(true)
  }, [])

  const finish = () => {
    localStorage.setItem('onboarding_done', '1')
    setVisible(false)
  }

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-5 pb-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${
              i === step ? 'w-6 bg-violet-600' : 'w-1.5 bg-gray-200'
            }`} />
          ))}
        </div>

        {/* Content */}
        <div className={`bg-gradient-to-b ${current.color} px-6 py-6`}>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center">
              {current.icon}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-3">{current.title}</h2>
          <p className="text-sm text-gray-600 text-center leading-relaxed whitespace-pre-line mb-4">
            {current.body}
          </p>
          <div className="bg-white rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Example</p>
            <p className="text-sm font-semibold text-gray-800">{current.example}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex gap-3">
          <button onClick={finish}
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
            Skip
          </button>
          <button onClick={() => isLast ? finish() : setStep(s => s + 1)}
            className="flex-1 py-3 bg-violet-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1 hover:bg-violet-800 transition">
            {isLast ? 'Get Started' : 'Next'}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
