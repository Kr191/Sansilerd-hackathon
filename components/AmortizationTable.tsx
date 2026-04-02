'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface AmortizationTableProps {
  loanAmount: number
  annualRate: number
  tenureYears: number
}

export default function AmortizationTable({ loanAmount, annualRate, tenureYears }: AmortizationTableProps) {
  const [expanded, setExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly')

  const schedule = useMemo(() => {
    if (!loanAmount || loanAmount <= 0) return []
    const monthlyRate = annualRate / 100 / 12
    const months = tenureYears * 12
    const monthlyPayment = monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
      : loanAmount / months

    let balance = loanAmount
    const rows: any[] = []

    for (let m = 1; m <= months; m++) {
      const interest = balance * monthlyRate
      const principal = monthlyPayment - interest
      balance = Math.max(0, balance - principal)

      rows.push({
        month: m,
        year: Math.ceil(m / 12),
        payment: monthlyPayment,
        principal,
        interest,
        balance,
      })
    }
    return rows
  }, [loanAmount, annualRate, tenureYears])

  const yearly = useMemo(() => {
    const map: Record<number, any> = {}
    for (const r of schedule) {
      if (!map[r.year]) map[r.year] = { year: r.year, principal: 0, interest: 0, payment: 0, balance: 0 }
      map[r.year].principal += r.principal
      map[r.year].interest += r.interest
      map[r.year].payment += r.payment
      map[r.year].balance = r.balance
    }
    return Object.values(map)
  }, [schedule])

  const totalInterest = schedule.reduce((s, r) => s + r.interest, 0)
  const totalPayment = schedule.reduce((s, r) => s + r.payment, 0)

  const rows = viewMode === 'yearly' ? yearly : schedule.slice(0, 24) // monthly: show first 2 years
  const displayRows = expanded ? rows : rows.slice(0, viewMode === 'yearly' ? 5 : 12)

  if (!loanAmount || loanAmount <= 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-4 border-b">
        <h3 className="font-bold text-gray-900 mb-1">Amortization Schedule</h3>
        <p className="text-xs text-gray-500">Year-by-year breakdown of principal vs interest</p>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Loan Amount</div>
            <div className="font-bold text-blue-700 text-sm">฿{(loanAmount / 1e6).toFixed(2)}M</div>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Total Interest</div>
            <div className="font-bold text-red-600 text-sm">฿{(totalInterest / 1e6).toFixed(2)}M</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Total Paid</div>
            <div className="font-bold text-gray-800 text-sm">฿{(totalPayment / 1e6).toFixed(2)}M</div>
          </div>
        </div>

        {/* Interest ratio bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Principal {((loanAmount / totalPayment) * 100).toFixed(0)}%</span>
            <span>Interest {((totalInterest / totalPayment) * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-red-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(loanAmount / totalPayment) * 100}%` }} />
          </div>
        </div>

        {/* View toggle */}
        <div className="flex gap-2 mt-3">
          {(['yearly', 'monthly'] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                viewMode === m ? 'bg-violet-700 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
              {m === 'yearly' ? 'Yearly' : 'Monthly (2yr)'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-gray-500">{viewMode === 'yearly' ? 'Year' : 'Month'}</th>
              <th className="px-3 py-2 text-right text-gray-500">Payment</th>
              <th className="px-3 py-2 text-right text-blue-600">Principal</th>
              <th className="px-3 py-2 text-right text-red-500">Interest</th>
              <th className="px-3 py-2 text-right text-gray-500">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayRows.map((r: any, i: number) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                <td className="px-3 py-2 font-medium text-gray-700">
                  {viewMode === 'yearly' ? `Y${r.year}` : `M${r.month}`}
                </td>
                <td className="px-3 py-2 text-right text-gray-700">
                  {(r.payment / 1000).toFixed(1)}K
                </td>
                <td className="px-3 py-2 text-right text-blue-600 font-medium">
                  {(r.principal / 1000).toFixed(1)}K
                </td>
                <td className="px-3 py-2 text-right text-red-500">
                  {(r.interest / 1000).toFixed(1)}K
                </td>
                <td className="px-3 py-2 text-right text-gray-600">
                  {(r.balance / 1e6).toFixed(2)}M
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > (viewMode === 'yearly' ? 5 : 12) && (
        <button onClick={() => setExpanded(!expanded)}
          className="w-full py-3 flex items-center justify-center gap-1 text-sm text-violet-700 font-medium border-t hover:bg-violet-50 transition">
          {expanded ? <><ChevronUp className="w-4 h-4" />Show Less</> : <><ChevronDown className="w-4 h-4" />Show All {rows.length} {viewMode === 'yearly' ? 'Years' : 'Months'}</>}
        </button>
      )}
    </div>
  )
}
