'use client'

import { useState, useMemo } from 'react'
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react'

interface ScenarioStressTestProps {
  property: any
  baseMonthlyPayment: number
  baseInterestRate: number
  baseOccupancy: number
  monthlyRent: number
}

export default function ScenarioStressTest({
  property,
  baseMonthlyPayment,
  baseInterestRate,
  baseOccupancy,
  monthlyRent,
}: ScenarioStressTestProps) {
  const [rateShock, setRateShock] = useState(0)       // +/- % points
  const [occupancyDrop, setOccupancyDrop] = useState(0) // % points drop
  const [rentChange, setRentChange] = useState(0)      // % change

  const result = useMemo(() => {
    const loanAmount = property.price * 0.7 // assume 30% down
    const newRate = Math.max(0.1, baseInterestRate + rateShock)
    const months = 20 * 12
    const monthlyRate = newRate / 100 / 12
    const newPayment = loanAmount > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
      : baseMonthlyPayment

    const newOccupancy = Math.max(0, Math.min(100, baseOccupancy - occupancyDrop)) / 100
    const newRent = monthlyRent * (1 + rentChange / 100)
    const effectiveRent = newRent * newOccupancy

    const netCashFlow = effectiveRent - newPayment - (property.price * 0.01 / 12) // 1% maintenance/yr
    const annualROI = ((netCashFlow * 12) / property.price) * 100

    const paymentDelta = newPayment - baseMonthlyPayment
    const cashFlowDelta = netCashFlow - (monthlyRent * (baseOccupancy / 100) - baseMonthlyPayment)

    return { newPayment, newOccupancy, newRent, effectiveRent, netCashFlow, annualROI, paymentDelta, cashFlowDelta }
  }, [rateShock, occupancyDrop, rentChange, property, baseMonthlyPayment, baseInterestRate, baseOccupancy, monthlyRent])

  const presets = [
    { label: 'Rate +2%', action: () => { setRateShock(2); setOccupancyDrop(0); setRentChange(0) } },
    { label: 'Vacancy 70%', action: () => { setRateShock(0); setOccupancyDrop(baseOccupancy - 70); setRentChange(0) } },
    { label: 'Recession', action: () => { setRateShock(1.5); setOccupancyDrop(20); setRentChange(-15) } },
    { label: 'Reset', action: () => { setRateShock(0); setOccupancyDrop(0); setRentChange(0) } },
  ]

  const isStressed = rateShock !== 0 || occupancyDrop !== 0 || rentChange !== 0

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-4 border-b">
        <h3 className="font-bold text-gray-900 mb-1">Scenario Stress Test</h3>
        <p className="text-xs text-gray-500">Adjust sliders to see impact on cash flow</p>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {presets.map(p => (
            <button key={p.label} onClick={p.action}
              className="px-3 py-1.5 bg-gray-100 hover:bg-violet-100 hover:text-violet-700 text-gray-600 rounded-full text-xs font-medium transition">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Sliders */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Interest Rate Shock</span>
            <span className={`font-bold ${rateShock > 0 ? 'text-red-500' : rateShock < 0 ? 'text-lime-600' : 'text-gray-500'}`}>
              {rateShock > 0 ? '+' : ''}{rateShock}% → {(baseInterestRate + rateShock).toFixed(1)}%
            </span>
          </div>
          <input type="range" min={-2} max={5} step={0.5} value={rateShock}
            onChange={e => setRateShock(Number(e.target.value))}
            className="w-full accent-violet-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>-2%</span><span>0</span><span>+5%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Occupancy Drop</span>
            <span className={`font-bold ${occupancyDrop > 0 ? 'text-red-500' : 'text-gray-500'}`}>
              -{occupancyDrop}% → {Math.max(0, baseOccupancy - occupancyDrop)}%
            </span>
          </div>
          <input type="range" min={0} max={50} step={5} value={occupancyDrop}
            onChange={e => setOccupancyDrop(Number(e.target.value))}
            className="w-full accent-violet-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>0%</span><span>-25%</span><span>-50%</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Rent Change</span>
            <span className={`font-bold ${rentChange < 0 ? 'text-red-500' : rentChange > 0 ? 'text-lime-600' : 'text-gray-500'}`}>
              {rentChange > 0 ? '+' : ''}{rentChange}% → ฿{result.newRent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <input type="range" min={-30} max={20} step={5} value={rentChange}
            onChange={e => setRentChange(Number(e.target.value))}
            className="w-full accent-violet-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>-30%</span><span>0</span><span>+20%</span>
          </div>
        </div>

        {/* Results */}
        <div className={`rounded-xl p-4 border-2 ${
          result.netCashFlow >= 0 ? 'bg-lime-50 border-lime-200' : 'bg-red-50 border-red-200'
        }`}>
          {isStressed && (
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className={`w-4 h-4 ${result.netCashFlow < 0 ? 'text-red-500' : 'text-yellow-500'}`} />
              <span className="text-xs font-semibold text-gray-700">Stress Scenario Active</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Monthly Payment</div>
              <div className="font-bold text-gray-800">฿{result.newPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              {result.paymentDelta !== 0 && (
                <div className={`text-xs flex items-center gap-0.5 ${result.paymentDelta > 0 ? 'text-red-500' : 'text-lime-600'}`}>
                  {result.paymentDelta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {result.paymentDelta > 0 ? '+' : ''}฿{result.paymentDelta.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Effective Rent</div>
              <div className="font-bold text-gray-800">฿{result.effectiveRent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
              <div className="text-xs text-gray-400">{(result.newOccupancy * 100).toFixed(0)}% occupied</div>
            </div>
            <div className={`bg-white rounded-lg p-3 col-span-2`}>
              <div className="text-xs text-gray-500 mb-1">Net Monthly Cash Flow</div>
              <div className={`text-xl font-bold ${result.netCashFlow >= 0 ? 'text-lime-600' : 'text-red-600'}`}>
                {result.netCashFlow >= 0 ? '+' : ''}฿{result.netCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-gray-500">Annual ROI: {result.annualROI.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
