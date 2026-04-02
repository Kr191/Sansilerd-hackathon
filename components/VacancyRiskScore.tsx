'use client'

import { useMemo } from 'react'

interface VacancyRiskProps {
  property: any
}

export default function VacancyRiskScore({ property }: VacancyRiskProps) {
  const analysis = useMemo(() => {
    const loc = property.locationScore || 75
    const liq = property.liquidityScore || 75
    const occ = property.occupancyRate || 85
    const hasBTS = !!property.nearBTS
    const hasMRT = !!property.nearMRT
    const type = property.type || 'condo'

    // Score factors (higher = lower vacancy risk)
    let score = 50
    score += (loc - 70) * 0.4       // location weight
    score += (liq - 70) * 0.3       // liquidity weight
    score += (occ - 80) * 0.3       // historical occupancy
    if (hasBTS) score += 10
    if (hasMRT) score += 8
    if (type === 'condo') score += 5 // condos easier to rent in Bangkok

    score = Math.max(10, Math.min(95, score))

    const vacancyProb = 100 - score

    let riskLabel: string
    let riskColor: string
    let riskBg: string
    if (vacancyProb < 15) { riskLabel = 'Very Low'; riskColor = 'text-lime-600'; riskBg = 'bg-lime-50 border-lime-200' }
    else if (vacancyProb < 25) { riskLabel = 'Low'; riskColor = 'text-green-600'; riskBg = 'bg-green-50 border-green-200' }
    else if (vacancyProb < 40) { riskLabel = 'Medium'; riskColor = 'text-yellow-600'; riskBg = 'bg-yellow-50 border-yellow-200' }
    else { riskLabel = 'High'; riskColor = 'text-red-600'; riskBg = 'bg-red-50 border-red-200' }

    const factors = [
      { label: 'Location Score', value: loc, max: 100, good: loc >= 80 },
      { label: 'Transit Access', value: hasBTS || hasMRT ? 'Yes' : 'No', good: hasBTS || hasMRT },
      { label: 'Historical Occupancy', value: `${occ}%`, good: occ >= 85 },
      { label: 'Market Liquidity', value: liq, max: 100, good: liq >= 80 },
      { label: 'Property Type', value: type, good: type === 'condo' },
    ]

    return { score, vacancyProb, riskLabel, riskColor, riskBg, factors }
  }, [property])

  return (
    <div className={`rounded-2xl border-2 p-4 ${analysis.riskBg}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-bold text-gray-900">Vacancy Risk Score</h4>
          <p className="text-xs text-gray-500">Probability of finding a tenant</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${analysis.riskColor}`}>{analysis.riskLabel}</div>
          <div className="text-xs text-gray-500">{analysis.vacancyProb.toFixed(0)}% vacancy risk</div>
        </div>
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Rentability Score</span>
          <span className={`font-bold ${analysis.riskColor}`}>{analysis.score.toFixed(0)}/100</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${
            analysis.score >= 75 ? 'bg-lime-500' : analysis.score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
          }`} style={{ width: `${analysis.score}%` }} />
        </div>
      </div>

      {/* Factors */}
      <div className="space-y-2">
        {analysis.factors.map(f => (
          <div key={f.label} className="flex items-center justify-between text-xs">
            <span className="text-gray-600">{f.label}</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-800">{f.value}</span>
              <span className={f.good ? 'text-lime-500' : 'text-red-400'}>{f.good ? '✓' : '✗'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
