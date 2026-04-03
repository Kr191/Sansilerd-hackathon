'use client'

import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'

interface BreakEvenProps {
  propertyPrice: number
  downPayment: number
  monthlyPayment: number
  monthlyRent: number
  goal: 'rent' | 'flip'
  capitalGain5: number
  capitalGain10: number
}

export default function BreakEvenCalculator({
  propertyPrice,
  downPayment,
  monthlyPayment,
  monthlyRent,
  goal,
  capitalGain5,
  capitalGain10,
}: BreakEvenProps) {
  // Thailand-specific transaction costs
  const TRANSFER_FEE = 0.02        // 2% of appraised value
  const SPECIFIC_BUSINESS_TAX = 0.033 // 3.3% if held < 5 years
  const WITHHOLDING_TAX = 0.01     // ~1% estimate
  const MAINTENANCE_ANNUAL = 0.01  // 1% of price per year
  const VACANCY_RATE = 0.1         // 10% vacancy assumption

  const analysis = useMemo(() => {
    const entryCosts = propertyPrice * TRANSFER_FEE
    const totalInitial = downPayment + entryCosts

    const years: any[] = []
    let cumulativeCost = totalInitial
    let breakEvenYear: number | null = null

    for (let y = 1; y <= 15; y++) {
      const gainPct = y <= 3
        ? (capitalGain5 / 5) * y
        : y <= 5
          ? capitalGain5
          : capitalGain5 + ((capitalGain10 - capitalGain5) / 5) * (y - 5)

      const marketValue = propertyPrice * (1 + gainPct / 100)

      // Exit costs (SBT only if < 5 years)
      const sbt = y < 5 ? marketValue * SPECIFIC_BUSINESS_TAX : 0
      const wht = marketValue * WITHHOLDING_TAX
      const exitCosts = sbt + wht

      // Cumulative mortgage paid
      const mortgagePaid = monthlyPayment * 12 * y
      const maintenance = propertyPrice * MAINTENANCE_ANNUAL * y

      let netProfit = 0
      if (goal === 'rent') {
        const grossRent = monthlyRent * 12 * y * (1 - VACANCY_RATE)
        netProfit = grossRent - mortgagePaid - maintenance - exitCosts - totalInitial
      } else {
        netProfit = marketValue - propertyPrice - exitCosts - maintenance - totalInitial
      }

      cumulativeCost = totalInitial + mortgagePaid + maintenance

      if (breakEvenYear === null && netProfit >= 0) {
        breakEvenYear = y
      }

      years.push({ year: y, netProfit, marketValue, gainPct, cumulativeCost })
    }

    return { years, breakEvenYear, entryCosts }
  }, [propertyPrice, downPayment, monthlyPayment, monthlyRent, goal, capitalGain5, capitalGain10])

  const maxAbsProfit = Math.max(...analysis.years.map(y => Math.abs(y.netProfit)), 1)

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-4 border-b">
        <h3 className="font-bold text-gray-900 mb-1">Break-Even Calculator</h3>
        <p className="text-xs text-gray-500">Includes transfer fees, taxes, maintenance & vacancy</p>

        {/* Thailand cost breakdown */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-orange-50 rounded-xl p-3">
            <div className="text-xs text-gray-500 mb-1">Entry Costs (Transfer Fee)</div>
            <div className="font-bold text-orange-600">฿{analysis.entryCosts.toLocaleString()}</div>
            <div className="text-xs text-gray-400">2% of property value</div>
          </div>
          <div className="bg-red-50 rounded-xl p-3">
            <div className="text-xs text-gray-500 mb-1">Exit Tax (if &lt;5yr)</div>
            <div className="font-bold text-red-600">3.3% SBT + 1% WHT</div>
            <div className="text-xs text-gray-400">Specific Business Tax</div>
          </div>
        </div>

        {analysis.breakEvenYear ? (
          <div className="mt-3 bg-lime-50 border border-lime-200 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lime-700">Break-Even: Year {analysis.breakEvenYear}</div>
              <div className="text-xs text-gray-600">After all costs including taxes</div>
            </div>
          </div>
        ) : (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="font-bold text-red-600">No break-even within 15 years</div>
            <div className="text-xs text-gray-600">Consider adjusting down payment or goal</div>
          </div>
        )}
      </div>

      {/* Timeline chart */}
      <div className="px-4 py-4">
        <p className="text-xs text-gray-500 uppercase mb-3">Net Profit Timeline</p>
        <div className="space-y-2">
          {analysis.years.map(({ year, netProfit, gainPct }) => {
            const isPositive = netProfit >= 0
            const barWidth = Math.min(100, (Math.abs(netProfit) / maxAbsProfit) * 100)
            const isBreakEven = analysis.breakEvenYear === year

            return (
              <div key={year} className={`flex items-center gap-2 ${isBreakEven ? 'bg-lime-50 rounded-lg px-2 py-1 -mx-2' : ''}`}>
                <div className="w-8 text-xs text-gray-500 text-right flex-shrink-0">Y{year}</div>
                <div className="flex-1 relative h-6 flex items-center">
                  {/* Zero line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300" />
                  {/* Bar */}
                  <div className={`absolute h-4 rounded-sm ${isPositive ? 'left-1/2' : 'right-1/2'} ${
                    isPositive ? 'bg-lime-400' : 'bg-red-300'
                  }`} style={{ width: `${barWidth / 2}%` }} />
                </div>
                <div className={`w-20 text-xs text-right font-medium flex-shrink-0 ${isPositive ? 'text-lime-600' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{(netProfit / 1e6).toFixed(2)}M
                </div>
                {isBreakEven && (
                  <span className="text-xs bg-lime-500 text-white px-1.5 py-0.5 rounded-full flex-shrink-0">✓</span>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2 px-10">
          <span>← Loss</span>
          <span>Profit →</span>
        </div>
      </div>
    </div>
  )
}
