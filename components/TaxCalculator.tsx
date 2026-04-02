'use client'

import { useState, useMemo } from 'react'
import { Info } from 'lucide-react'

interface TaxCalculatorProps {
  propertyPrice: number
  purchasePrice?: number
  yearsHeld?: number
}

export default function TaxCalculator({ propertyPrice, purchasePrice, yearsHeld = 3 }: TaxCalculatorProps) {
  const [salePrice, setSalePrice] = useState(propertyPrice)
  const [holdYears, setHoldYears] = useState(yearsHeld)
  const [isJuristic, setIsJuristic] = useState(false) // individual vs company

  const taxes = useMemo(() => {
    const appraised = salePrice // simplified: use sale price as appraised
    const gain = salePrice - (purchasePrice || propertyPrice)

    // 1. Transfer Fee: 2% of appraised value (split buyer/seller or seller pays)
    const transferFee = appraised * 0.02

    // 2. Specific Business Tax (SBT): 3.3% if held < 5 years
    const sbt = holdYears < 5 ? appraised * 0.033 : 0

    // 3. Stamp Duty: 0.5% — only applies if SBT is NOT charged
    const stampDuty = holdYears >= 5 ? appraised * 0.005 : 0

    // 4. Withholding Tax (WHT): progressive for individuals
    //    Simplified: (appraised / years held) * progressive rate
    const annualIncome = appraised / holdYears
    let whtRate = 0
    if (annualIncome <= 150000) whtRate = 0
    else if (annualIncome <= 300000) whtRate = 0.05
    else if (annualIncome <= 500000) whtRate = 0.10
    else if (annualIncome <= 750000) whtRate = 0.15
    else if (annualIncome <= 1000000) whtRate = 0.20
    else if (annualIncome <= 2000000) whtRate = 0.25
    else if (annualIncome <= 5000000) whtRate = 0.30
    else whtRate = 0.35

    const wht = isJuristic
      ? appraised * 0.01 // 1% flat for juristic
      : annualIncome * whtRate * holdYears * 0.5 // simplified individual WHT

    const totalTax = transferFee + sbt + stampDuty + wht
    const netProfit = gain - totalTax
    const effectiveTaxRate = salePrice > 0 ? (totalTax / salePrice) * 100 : 0

    return { transferFee, sbt, stampDuty, wht, totalTax, netProfit, gain, effectiveTaxRate }
  }, [salePrice, holdYears, isJuristic, propertyPrice, purchasePrice])

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-4 border-b">
        <h3 className="font-bold text-gray-900 mb-1">Thailand Exit Tax Calculator</h3>
        <p className="text-xs text-gray-500">Withholding tax, SBT, transfer fees on sale</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Inputs */}
        <div>
          <label className="text-xs text-gray-500 uppercase mb-1 block">Expected Sale Price (฿)</label>
          <input type="number" value={salePrice}
            onChange={e => setSalePrice(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-violet-500 focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 uppercase mb-1 block">Years Held</label>
            <input type="number" value={holdYears} min={1} max={30}
              onChange={e => setHoldYears(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-violet-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase mb-1 block">Seller Type</label>
            <div className="flex gap-2 mt-1">
              <button onClick={() => setIsJuristic(false)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${!isJuristic ? 'bg-violet-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                Individual
              </button>
              <button onClick={() => setIsJuristic(true)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${isJuristic ? 'bg-violet-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                Company
              </button>
            </div>
          </div>
        </div>

        {/* Tax breakdown */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-700 uppercase">Tax Breakdown</p>

          {[
            { label: 'Transfer Fee (2%)', value: taxes.transferFee, note: 'Paid at Land Dept.' },
            { label: `Specific Business Tax ${holdYears < 5 ? '(3.3%)' : '(waived ≥5yr)'}`, value: taxes.sbt, note: holdYears < 5 ? 'Held < 5 years' : 'Held ≥ 5 years — waived' },
            { label: `Stamp Duty ${holdYears >= 5 ? '(0.5%)' : '(waived)'}`, value: taxes.stampDuty, note: holdYears >= 5 ? 'Replaces SBT' : 'SBT applies instead' },
            { label: `Withholding Tax (${isJuristic ? '1% flat' : 'progressive'})`, value: taxes.wht, note: isJuristic ? 'Juristic rate' : 'Individual progressive' },
          ].map(({ label, value, note }) => (
            <div key={label} className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-700">{label}</div>
                <div className="text-xs text-gray-400">{note}</div>
              </div>
              <div className={`text-sm font-bold ${value > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {value > 0 ? `-฿${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '฿0'}
              </div>
            </div>
          ))}

          <div className="border-t pt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-gray-700">Total Tax Burden</span>
              <span className="text-sm font-bold text-red-600">
                -฿{taxes.totalTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Effective Tax Rate</span>
              <span className="text-xs font-medium text-gray-600">{taxes.effectiveTaxRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Net result */}
        <div className={`rounded-xl p-4 ${taxes.netProfit >= 0 ? 'bg-lime-50 border border-lime-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-semibold text-gray-700">Net Profit After Tax</div>
              <div className="text-xs text-gray-500">Sale price minus all taxes & purchase cost</div>
            </div>
            <div className={`text-xl font-bold ${taxes.netProfit >= 0 ? 'text-lime-700' : 'text-red-600'}`}>
              {taxes.netProfit >= 0 ? '+' : ''}฿{(taxes.netProfit / 1e6).toFixed(2)}M
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Estimates only. Actual WHT is calculated on appraised value by the Land Department. Consult a tax advisor for precise figures.</span>
        </div>
      </div>
    </div>
  )
}
