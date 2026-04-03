'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, TrendingUp, AlertTriangle, Download, BookmarkPlus } from 'lucide-react'

interface AIVerdictProps {
  property: any
  investmentData: any
  verdictData: any
  onBack: () => void
}

export default function AIVerdict({ property, investmentData, verdictData, onBack }: AIVerdictProps) {
  const router = useRouter()
  const [addingToPortfolio, setAddingToPortfolio] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [portfolioAdded, setPortfolioAdded] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'success' } | null>(null)

  const showToast = (msg: string, type: 'info' | 'success' = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }
  
  const downPayment = investmentData?.downPayment || 0
  const tenure = investmentData?.tenure || 30
  const interestRate = investmentData?.interestRate || 4.2
  const loanAmount = property.price - downPayment
  const monthlyPayment = investmentData?.monthlyPayment || (() => {
    const monthlyRate = interestRate / 100 / 12
    const numPayments = tenure * 12
    if (loanAmount <= 0) return 0
    return Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                     (Math.pow(1 + monthlyRate, numPayments) - 1))
  })()

  const rentalYield = investmentData?.rentalYield ?? property.rentalYield ?? 5.5
  // roi shown = gross rental yield from property; cash-on-cash from simulation used for verdict scoring
  const roi = rentalYield
  const cashOnCashROI = investmentData?.roi ?? roi
  const averageRent = property.averageRent || Math.round((property.price * rentalYield) / 100 / 12)

  const locationScore = property.locationScore || 75
  const liquidityScore = property.liquidityScore || 75
  const avgScore = (locationScore + liquidityScore) / 2
  const propertyRisk = avgScore > 85 ? 'low' : avgScore > 70 ? 'medium' : 'high'

  const marketAvgROI = 6.5
  const roiDiff = (roi - marketAvgROI).toFixed(1)

  // Use the full verdict object from the API if available
  const apiVerdict = investmentData?.verdict
  const verdict = apiVerdict?.decision ? {
    decision: apiVerdict.decision,
    confidence: apiVerdict.confidence,
    roi,
    monthlyPayment,
    reasons: apiVerdict.pros?.length
      ? apiVerdict.pros
      : [
          roi > marketAvgROI ? `ROI above market average by ${roiDiff}%` : 'ROI near market average',
          downPayment >= property.price * 0.1 ? 'Fits your budget' : 'Needs higher down payment',
          locationScore > 80 ? 'Prime location with growth potential' : 'Moderate location',
          liquidityScore > 80 ? 'High liquidity' : 'Moderate liquidity',
        ],
  } : verdictData || {
    decision: (propertyRisk !== 'high' && roi > 5) ? 'recommended' : 'consider',
    confidence: Math.min(95, Math.round(avgScore)),
    roi,
    monthlyPayment,
    reasons: [
      roi > marketAvgROI ? `ROI above market average by ${roiDiff}%` : 'ROI near market average',
      downPayment >= property.price * 0.1 ? 'Fits your budget' : 'Needs higher down payment',
      locationScore > 80 ? 'Prime location with growth potential' : 'Moderate location',
      liquidityScore > 80 ? 'High liquidity' : 'Moderate liquidity',
    ],
  }

  // Risk level: scored from 4 factors (0 = best, 2 = worst each → 0–8 total)
  const netCashFlow = investmentData?.netMonthlyCashFlow ?? 0
  const dtiRaw: number = investmentData?.dti
    ?? (investmentData?.expense != null ? investmentData.expense / (investmentData.income || 1) : 0)
  const occupancyRate = property.occupancyRate || 85

  const cashFlowScore  = netCashFlow > 0 ? 0 : netCashFlow === 0 ? 1 : 2
  const dtiScore       = dtiRaw < 0.3 ? 0 : dtiRaw <= 0.5 ? 1 : 2
  const occupancyScore = occupancyRate > 90 ? 0 : occupancyRate >= 75 ? 1 : 2
  const verdictScore   = verdict.decision === 'recommended' ? 0 : verdict.decision === 'consider' ? 1 : 2

  const totalRiskScore = cashFlowScore + dtiScore + occupancyScore + verdictScore

  const riskLevel: 'low' | 'medium' | 'high' =
    totalRiskScore <= 2 ? 'low' : totalRiskScore <= 5 ? 'medium' : 'high'

  // ── Consistent color tokens keyed to verdict decision ──────────────────────
  const verdictColors = {
    recommended:     { bg: 'bg-emerald-50',  border: 'border-emerald-200', icon: 'bg-emerald-100', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', gauge: '#10b981' },
    consider:        { bg: 'bg-yellow-50',   border: 'border-yellow-200',  icon: 'bg-yellow-100',  text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700',  gauge: '#f59e0b' },
    'not-recommended': { bg: 'bg-red-50',    border: 'border-red-200',     icon: 'bg-red-100',     text: 'text-red-500',    badge: 'bg-red-100 text-red-700',        gauge: '#ef4444' },
  }
  const vc = verdictColors[verdict.decision as keyof typeof verdictColors] ?? verdictColors.consider

  // Risk level color tokens
  const riskColors = {
    low:    { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100 text-emerald-600' },
    medium: { bg: 'bg-yellow-50',  text: 'text-yellow-600',  icon: 'bg-yellow-100 text-yellow-600'  },
    high:   { bg: 'bg-red-50',     text: 'text-red-600',     icon: 'bg-red-100 text-red-500'        },
  }
  const rc = riskColors[riskLevel as keyof typeof riskColors] ?? riskColors.medium

  // 5-year cashflow: rent starts at property.averageRent, grows at rate implied by capitalGainProjection
  // expense starts at actual monthlyPayment, grows at 3% inflation
  const rentGrowthRate = property.capitalGainProjection?.year5
    ? (Math.pow(1 + property.capitalGainProjection.year5 / 100, 1 / 5) - 1)
    : 0.04  // fallback 4%/yr
  const expenseGrowthRate = 0.03  // 3% inflation

  const yearlyData = Array.from({ length: 5 }, (_, i) => {
    const year = i + 1
    return {
      year,
      rent: Math.round(averageRent * Math.pow(1 + rentGrowthRate, year)),
      expense: Math.round(monthlyPayment * Math.pow(1 + expenseGrowthRate, year)),
    }
  })
  
  const handleAddToPortfolio = () => {
    setAddingToPortfolio(true)
    try {
      const existingPortfolio = localStorage.getItem('portfolio')
      const portfolio = existingPortfolio ? JSON.parse(existingPortfolio) : []
      const exists = portfolio.some((item: any) => item.property.id === property.id)
      if (!exists) {
        portfolio.push({
          id: `${property.id}-${Date.now()}`,
          property,
          investment: { downPayment, monthlyPayment, roi, riskLevel },
          verdict,
          addedAt: new Date().toISOString(),
        })
        localStorage.setItem('portfolio', JSON.stringify(portfolio))
        window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio' }))
        setPortfolioAdded(true)
        showToast('Redirecting to your portfolio…', 'success')
        setTimeout(() => router.push('/portfolio'), 1800)
      } else {
        showToast('This property is already in your portfolio.', 'info')
      }
    } catch (error) {
      console.error('Error adding to portfolio:', error)
      alert('❌ Failed to add to portfolio')
    } finally {
      setAddingToPortfolio(false)
    }
  }
  
  const handleDownloadPDF = () => {
    setDownloadingPDF(true)

    const rentGrowth = yearlyData.length > 1
      ? ((Math.pow(yearlyData[4].rent / yearlyData[0].rent, 1 / 4) - 1) * 100).toFixed(1)
      : '—'
    const expenseGrowth = yearlyData.length > 1
      ? ((Math.pow(yearlyData[4].expense / yearlyData[0].expense, 1 / 4) - 1) * 100).toFixed(1)
      : '—'

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Investment Analysis — ${property.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #111827; background: #fff; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 22px; color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 8px; margin-bottom: 6px; }
    .meta { font-size: 12px; color: #6b7280; margin-bottom: 24px; }
    h2 { font-size: 14px; font-weight: bold; color: #374151; margin: 20px 0 8px; text-transform: uppercase; letter-spacing: .05em; }
    .section { margin-bottom: 20px; padding: 16px; background: #f9fafb; border-radius: 8px; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .row:last-child { border-bottom: none; }
    .label { color: #6b7280; }
    .value { font-weight: bold; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: bold; text-transform: capitalize; }
    .recommended { background: #d1fae5; color: #065f46; }
    .consider { background: #fef3c7; color: #92400e; }
    .not-recommended { background: #fee2e2; color: #991b1b; }
    .risk-low { color: #059669; } .risk-medium { color: #d97706; } .risk-high { color: #dc2626; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f3f4f6; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #6b7280; }
    td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
    .pos { color: #059669; } .neg { color: #dc2626; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Investment Analysis Report</h1>
  <p class="meta">Generated: ${new Date().toLocaleString('en-US')} &nbsp;|&nbsp; ${property.name}</p>

  <div class="section">
    <h2>Property</h2>
    <div class="row"><span class="label">Name</span><span class="value">${property.name}</span></div>
    <div class="row"><span class="label">Location</span><span class="value">${property.location}, ${property.district}</span></div>
    <div class="row"><span class="label">Type</span><span class="value">${property.type}</span></div>
    <div class="row"><span class="label">Price</span><span class="value">฿${property.price.toLocaleString()}</span></div>
    <div class="row"><span class="label">Size</span><span class="value">${property.size} sqm &nbsp;|&nbsp; ${property.bedrooms} bed / ${property.bathrooms} bath</span></div>
  </div>

  <div class="section">
    <h2>AI Verdict</h2>
    <div class="row"><span class="label">Decision</span><span class="value"><span class="badge ${verdict.decision}">${verdict.decision.replace('-', ' ')}</span></span></div>
    <div class="row"><span class="label">Risk Level</span><span class="value risk-${riskLevel}">${riskLevel.toUpperCase()}</span></div>
    <div class="row"><span class="label">Confidence</span><span class="value">${verdict.confidence ?? '—'}%</span></div>
    ${verdict.reasons.map((r: string) => `<div class="row"><span class="label">•</span><span>${r}</span></div>`).join('')}
  </div>

  <div class="section">
    <h2>Investment Metrics</h2>
    <div class="row"><span class="label">Expected ROI</span><span class="value">${roi.toFixed(1)}%</span></div>
    <div class="row"><span class="label">Monthly Payment</span><span class="value">฿${monthlyPayment.toLocaleString()}</span></div>
    <div class="row"><span class="label">Down Payment</span><span class="value">฿${downPayment.toLocaleString()}</span></div>
    <div class="row"><span class="label">Net Cash Flow</span><span class="value ${netCashFlow >= 0 ? 'pos' : 'neg'}">${netCashFlow >= 0 ? '+' : ''}฿${netCashFlow.toLocaleString()}/mo</span></div>
    <div class="row"><span class="label">DTI Ratio</span><span class="value">${(dtiRaw * 100).toFixed(1)}%</span></div>
    <div class="row"><span class="label">Occupancy Rate</span><span class="value">${occupancyRate}%</span></div>
  </div>

  <div class="section">
    <h2>5-Year Cashflow Projection</h2>
    <table>
      <thead><tr><th>Year</th><th>Rental Income</th><th>Expenses</th><th>Net</th></tr></thead>
      <tbody>
        ${yearlyData.map(d => `<tr>
          <td>Year ${d.year}</td>
          <td>฿${d.rent.toLocaleString()}</td>
          <td>฿${d.expense.toLocaleString()}</td>
          <td class="${d.rent - d.expense >= 0 ? 'pos' : 'neg'}">${d.rent - d.expense >= 0 ? '+' : ''}฿${(d.rent - d.expense).toLocaleString()}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div style="margin-top:10px;font-size:12px;color:#6b7280;">
      Rental income avg growth: <strong>${rentGrowth}%/yr</strong> &nbsp;|&nbsp; Expenses avg growth: <strong>${expenseGrowth}%/yr</strong>
    </div>
  </div>

  <div class="section">
    <h2>Recommended Rent Range</h2>
    <div class="row"><span class="label">Recommended</span><span class="value">฿${Math.round(averageRent * (occupancyRate / 100)).toLocaleString()}/mo</span></div>
    <div class="row"><span class="label">Min Range</span><span class="value">฿${Math.round(averageRent * 0.85).toLocaleString()}/mo</span></div>
    <div class="row"><span class="label">Max Range</span><span class="value">฿${Math.round(averageRent * 1.15).toLocaleString()}/mo</span></div>
    <div class="row"><span class="label">Target Occupancy</span><span class="value">${occupancyRate}%</span></div>
  </div>

  <div class="footer">
    Generated by Sovereign AI Investment Simulator &nbsp;|&nbsp; For informational purposes only. Not financial advice.
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
    setDownloadingPDF(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border-2 text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-white border-emerald-400 text-gray-900'
            : 'bg-white border-gray-200 text-gray-700'
        }`}>
          {toast.type === 'success' ? (
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          ) : (
            <span className="text-base">🏠</span>
          )}
          <div>
            <p className="font-semibold text-gray-900">
              {toast.type === 'success' ? 'Added to Portfolio' : 'Already saved'}
            </p>
            <p className="text-xs text-gray-500 font-normal">{toast.msg}</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* AI Verdict Card */}
      <div className={`bg-gradient-to-br ${vc.bg} to-white rounded-3xl p-8 mb-6 shadow-lg border-2 ${vc.border}`}>
        <p className="text-xs text-gray-500 uppercase mb-2">Investment Analysis</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">The AI Verdict</h1>

        <div className="flex items-center justify-center mb-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${vc.icon}`}>
            {verdict.decision === 'recommended'
              ? <CheckCircle2 className={`w-12 h-12 ${vc.text}`} />
              : <AlertTriangle className={`w-12 h-12 ${vc.text}`} />
            }
          </div>
        </div>

        <div className="text-center mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${vc.badge}`}>
            {verdict.decision === 'recommended'
              ? <CheckCircle2 className="w-4 h-4" />
              : <AlertTriangle className="w-4 h-4" />
            }
            <span className="font-semibold text-sm capitalize">{verdict.decision.replace('-', ' ')}</span>
          </div>
          
          <p className="text-gray-900 text-lg leading-relaxed">
            {verdict.reasons.map((reason: string, index: number) => (
              <span key={index}>
                {index === 0 && <span className="font-bold">{reason}</span>}
                {index > 0 && reason}
                {index < verdict.reasons.length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>

      </div>


      {/* Investment Metrics */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <p className="text-xs text-gray-500 uppercase mb-4">Investment Metrics</p>
        
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-1">
            <p className={`text-3xl font-bold ${vc.text}`}>{roi.toFixed(1)}%</p>
            <span className={`text-sm flex items-center gap-1 ${
              parseFloat(roiDiff) > 0 ? vc.text : 'text-gray-500'
            }`}>
              <TrendingUp className="w-4 h-4" />
              {parseFloat(roiDiff) > 0 ? '+' : ''}{roiDiff}% vs Market
            </span>
          </div>
          <p className="text-sm text-gray-600">Expected ROI</p>
        </div>

        <div className="mb-6">
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {monthlyPayment.toLocaleString()} THB
          </p>
          <p className="text-sm text-gray-600">Monthly Payment</p>
        </div>

        <div className="space-y-2 mb-3">
          {/* Cash Flow */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">Net Cash Flow</span>
            <span className={`text-sm font-bold ${netCashFlow > 0 ? 'text-emerald-600' : netCashFlow < 0 ? 'text-red-500' : 'text-gray-500'}`}>
              {netCashFlow > 0 ? '+' : ''}{netCashFlow.toLocaleString()} THB/mo
            </span>
          </div>
          {/* DTI */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">DTI Ratio</span>
            <span className={`text-sm font-bold ${dtiRaw < 0.3 ? 'text-emerald-600' : dtiRaw <= 0.5 ? 'text-yellow-600' : 'text-red-500'}`}>
              {(dtiRaw * 100).toFixed(1)}%
            </span>
          </div>
          {/* Occupancy */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-600">Occupancy Rate</span>
            <span className={`text-sm font-bold ${occupancyRate > 90 ? 'text-emerald-600' : occupancyRate >= 75 ? 'text-yellow-600' : 'text-red-500'}`}>
              {occupancyRate}%
            </span>
          </div>
        </div>

        <div className={`flex items-center justify-between p-4 ${rc.bg} rounded-xl`}>
          <span className="text-sm text-gray-700">Risk Level</span>
          <div className="flex items-center gap-2">
            <span className={`font-bold capitalize ${rc.text}`}>{riskLevel}</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${rc.icon}`}>
              {riskLevel === 'low'
                ? <CheckCircle2 className="w-5 h-5" />
                : <AlertTriangle className="w-5 h-5" />
              }
            </div>
          </div>
        </div>
      </div>

      {/* 5-Year Cashflow Projection */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-900">5-YEAR CASHFLOW PROJECTION</p>
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-gray-600">RENT</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-gray-600">EXPENSES</span>
            </div>
          </div>
        </div>

        {/* Interactive Bar Chart with Line */}
        {(() => {
          const chartW = 500
          const chartH = 160
          const padLeft = 10
          const padRight = 10
          const padTop = 10
          const padBottom = 10
          const maxValue = Math.max(...yearlyData.map(d => d.rent)) * 1.15
          // Round up to nearest 10K for y-axis
          const yMax = Math.ceil(maxValue / 10000) * 10000
          const toY = (v: number) => padTop + (1 - v / yMax) * (chartH - padTop - padBottom)
          const xs = yearlyData.map((_, i) =>
            padLeft + (i / (yearlyData.length - 1)) * (chartW - padLeft - padRight)
          )
          const rentPoints = yearlyData.map((d, i) => `${xs[i]},${toY(d.rent)}`).join(' ')
          const expensePoints = yearlyData.map((d, i) => `${xs[i]},${toY(d.expense)}`).join(' ')
          const yLabels = [yMax, yMax * 0.67, yMax * 0.33, 0]

          return (
            <div className="h-48 relative mb-2">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-400 pr-2 w-12">
                {yLabels.map((v, i) => (
                  <span key={i}>{v >= 1000 ? `${Math.round(v / 1000)}K` : '0'}</span>
                ))}
              </div>

              {/* Chart area */}
              <div className="absolute left-12 right-0 top-0 bottom-8">
                <svg className="w-full h-full" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0.33, 0.67, 1].map((t, i) => (
                    <line key={i}
                      x1="0" y1={toY(yMax * t)}
                      x2={chartW} y2={toY(yMax * t)}
                      stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5"
                    />
                  ))}

                  {/* Rent line */}
                  <polyline
                    points={rentPoints}
                    fill="none" stroke="#3b82f6" strokeWidth="3"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                  {yearlyData.map((d, i) => (
                    <circle key={`r${i}`} cx={xs[i]} cy={toY(d.rent)} r="4" fill="#3b82f6" />
                  ))}

                  {/* Expense line */}
                  <polyline
                    points={expensePoints}
                    fill="none" stroke="#ef4444" strokeWidth="3"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                  {yearlyData.map((d, i) => (
                    <circle key={`e${i}`} cx={xs[i]} cy={toY(d.expense)} r="4" fill="#ef4444" />
                  ))}
                </svg>

                {/* Hover areas */}
                <div className="absolute inset-0 flex justify-around">
                  {yearlyData.map((data, i) => (
                    <div key={data.year} className="flex-1 relative cursor-pointer group flex items-center justify-center">
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-lg pointer-events-none">
                        <div className="font-semibold mb-1">Year {data.year}</div>
                        <div className="text-blue-300">Rent: {data.rent.toLocaleString()} THB</div>
                        <div className="text-red-300">Expense: {data.expense.toLocaleString()} THB</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}
        
        <div className="flex justify-around text-xs text-gray-400 px-1 ml-12">
          <span>Y1</span>
          <span>Y2</span>
          <span>Y3</span>
          <span>Y4</span>
          <span>Y5</span>
        </div>
        
          <div className="mt-4 grid grid-cols-2 gap-3">
          <div className={`p-3 ${vc.bg} rounded-xl`}>
            <p className="text-xs text-gray-600">
              Rental income grows avg <span className={`font-semibold ${vc.text}`}>
                {(() => {
                  const firstYearRent = yearlyData[0].rent
                  const lastYearRent = yearlyData[yearlyData.length - 1].rent
                  const avgGrowth = ((Math.pow(lastYearRent / firstYearRent, 1 / (yearlyData.length - 1)) - 1) * 100).toFixed(1)
                  return avgGrowth
                })()}%
              </span> per year
            </p>
          </div>
          <div className="p-3 bg-gray-100 rounded-xl">
            <p className="text-xs text-gray-600">
              Expenses grow avg <span className="font-semibold text-gray-700">
                {(() => {
                  const firstYearExpense = yearlyData[0].expense
                  const lastYearExpense = yearlyData[yearlyData.length - 1].expense
                  const avgGrowth = ((Math.pow(lastYearExpense / firstYearExpense, 1 / (yearlyData.length - 1)) - 1) * 100).toFixed(1)
                  return avgGrowth
                })()}%
              </span> per year
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Next Range */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <p className="text-xs text-gray-500 uppercase mb-4">Recommended Rent Range</p>

        {(() => {
          // Recommended = averageRent adjusted for occupancy
          const recommendedRent = Math.round(averageRent * (occupancyRate / 100))
          // Range: ±15% of averageRent
          const minRent = Math.round(averageRent * 0.85)
          const maxRent = Math.round(averageRent * 1.15)
          // Gauge fill: where recommendedRent sits between min and max
          const circumference = 2 * Math.PI * 80
          const pct = Math.min(1, Math.max(0, (recommendedRent - minRent) / (maxRent - minRent)))
          const offset = circumference * (1 - (0.25 + pct * 0.7))

          return (
            <>
              <div className="relative mb-6">
                <div className="w-48 h-48 mx-auto relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="80" fill="none" stroke="#e5e7eb" strokeWidth="16" />
                    <circle cx="96" cy="96" r="80"
                      fill="none" stroke={vc.gauge} strokeWidth="16"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className={`text-4xl font-bold ${vc.text}`}>
                      {(recommendedRent / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-gray-500 mt-1">THB/mo</p>
                    <p className="text-xs text-gray-500">RECOMMENDED RENT</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Min Range</p>
                  <p className="text-lg font-bold text-gray-900">{minRent.toLocaleString()} THB</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Max Range</p>
                  <p className="text-lg font-bold text-gray-900">{maxRent.toLocaleString()} THB</p>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600">
                Optimized for <span className={`font-semibold ${vc.text}`}>{occupancyRate}% Occupancy Rate</span>
              </p>
            </>
          )
        })()}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button 
          onClick={handleAddToPortfolio}
          disabled={addingToPortfolio || portfolioAdded}
          className={`w-full border-2 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors ${
            portfolioAdded 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default'
              : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
          }`}
        >
          <BookmarkPlus className="w-5 h-5" />
          {portfolioAdded ? 'Added to Portfolio ✓' : addingToPortfolio ? 'Adding...' : 'Add to Portfolio'}
        </button>

        <button 
          onClick={handleDownloadPDF}
          disabled={downloadingPDF}
          className="w-full bg-white border-2 border-gray-200 text-gray-900 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          {downloadingPDF ? 'Generating...' : 'Download Analysis Report'}
        </button>
      </div>
    </div>
  )
}