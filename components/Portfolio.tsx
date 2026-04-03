'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertTriangle, CheckCircle2, Trash2, MapPin, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PortfolioItem {
  id: string
  property: any
  investment: { downPayment: number; monthlyPayment: number; roi: number; riskLevel: string }
  verdict: any
  addedAt: string
}

function loadPortfolio(): PortfolioItem[] {
  try { return JSON.parse(localStorage.getItem('portfolio') || '[]') } catch { return [] }
}
function removeItem(id: string) {
  const next = loadPortfolio().filter(i => i.id !== id)
  localStorage.setItem('portfolio', JSON.stringify(next))
  window.dispatchEvent(new StorageEvent('storage', { key: 'portfolio' }))
}

export default function Portfolio() {
  const router = useRouter()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [topProperty, setTopProperty] = useState<any>(null)
  const [alertDismissed, setAlertDismissed] = useState(false)

  const refresh = useCallback(() => setItems(loadPortfolio()), [])
  useEffect(() => {
    refresh()
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [refresh])

  // Fetch the highest-profit Sansiri property (by capitalGainProjection.year5)
  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => {
        const all: any[] = data.projects || []
        const best = all.reduce((top: any, p: any) =>
          (p.capitalGainProjection?.year5 || 0) > (top?.capitalGainProjection?.year5 || 0) ? p : top
        , null)
        setTopProperty(best)
      })
      .catch(() => {})
  }, [])

  // ── Metrics ────────────────────────────────────────────────────────────────
  const totalValue = items.reduce((s, i) => s + (i.property.price || 0), 0)
  const totalDownPaid = items.reduce((s, i) => s + (i.investment.downPayment || 0), 0)
  const avgYield = items.length
    ? items.reduce((s, i) => s + (i.property.rentalYield || 0), 0) / items.length : 0
  const grossMonthlyRent = items.reduce((s, i) => s + (i.property.averageRent || 0), 0)

  const itemCashFlows = items.map(i => Math.round(
    (i.property.averageRent || 0) * ((i.property.occupancyRate || 85) / 100)
    - (i.investment.monthlyPayment || 0)
    - (i.property.price * 0.015) / 12
  ))
  const totalNetCF = itemCashFlows.reduce((s, v) => s + v, 0)

  // Portfolio growth chart: project value forward using avg capitalGain year5
  const avgGain5 = items.length
    ? items.reduce((s, i) => s + (i.property.capitalGainProjection?.year5 || 18), 0) / items.length
    : 18
  const now = new Date()
  const growthData = [-24, -12, 0, 6].map(monthOffset => {
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
    const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
    const factor = 1 + (avgGain5 / 100) * (monthOffset / 60) // linear interpolation over 5yr
    return { month: label, value: Math.round((totalValue * factor) / 1_000_000 * 10) / 10 }
  })

  // ── Empty state ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold mb-1">Portfolio Hub</h1>
        <p className="text-gray-500 text-sm mb-6">Track and manage your investment properties</p>

        {/* Smart Alert even when empty — shows best Sansiri opportunity */}
        {topProperty && !alertDismissed && (
          <SmartAlert property={topProperty} onDismiss={() => setAlertDismissed(true)} onAnalyze={() => {
            localStorage.setItem('selectedProperty', JSON.stringify(topProperty))
            router.push(`/simulator/${topProperty.id}?income=0&expense=0`)
          }} />
        )}

        <div className="bg-white rounded-2xl p-10 text-center shadow-sm mt-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">No properties yet</p>
          <p className="text-sm text-gray-400 mb-5">Run a simulation and tap "Add to Portfolio".</p>
          <button onClick={() => router.push('/simulator')}
            className="px-6 py-2.5 bg-violet-700 text-white rounded-xl text-sm font-semibold hover:bg-violet-800 transition">
            Go to Simulator
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <div className="mb-5">
        <h1 className="text-2xl font-bold mb-0.5">Portfolio Hub</h1>
        <p className="text-gray-500 text-sm">Real-time performance · {items.length} propert{items.length === 1 ? 'y' : 'ies'}</p>
      </div>

      {/* ── Smart Selling Alert ── */}
      {topProperty && !alertDismissed && (
        <SmartAlert property={topProperty} onDismiss={() => setAlertDismissed(true)} onAnalyze={() => {
          localStorage.setItem('selectedProperty', JSON.stringify(topProperty))
          router.push(`/simulator/${topProperty.id}?income=0&expense=0`)
        }} />
      )}

      {/* ── Summary Card ── */}
      <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
        <div className="text-xs text-gray-500 uppercase mb-1">Portfolio Value</div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold">฿{(totalValue / 1_000_000).toFixed(1)}M</span>
          <span className="text-emerald-600 text-sm flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" />+{avgGain5.toFixed(1)}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Overall ROI</div>
            <div className="text-2xl font-bold">{avgYield.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">Annualized</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Monthly Cash Flow</div>
            <div className="text-2xl font-bold">฿{grossMonthlyRent.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Gross Income</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-500 font-medium">Portfolio Growth</span>
          <span className="text-blue-600 font-semibold">Projection Active</span>
        </div>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={growthData} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              formatter={(v: any) => [`฿${v}M`, 'Value']}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Net CF summary ── */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-0.5">Net CF / mo</div>
          <div className={`text-xl font-bold ${totalNetCF >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {totalNetCF >= 0 ? '+' : ''}฿{totalNetCF.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-0.5">Capital Deployed</div>
          <div className="text-xl font-bold text-gray-800">฿{(totalDownPaid / 1_000_000).toFixed(2)}M</div>
        </div>
      </div>

      {/* ── Asset List ── */}
      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Active Assets</p>
      <div className="space-y-3">
        {items.map((item, idx) => {
          const cf = itemCashFlows[idx]
          const riskColor = item.investment.riskLevel === 'low' ? 'text-emerald-600'
            : item.investment.riskLevel === 'high' ? 'text-red-500' : 'text-yellow-600'
          return (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-28">
                <img src={item.property.image} alt={item.property.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800' }} />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${cf >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {cf >= 0 ? '+' : ''}฿{cf.toLocaleString()}/mo
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900 leading-tight">{item.property.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{item.property.location}, {item.property.district}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <div className="bg-gray-50 rounded-xl p-2">
                    <div className="text-gray-500 mb-0.5">Price</div>
                    <div className="font-bold">฿{(item.property.price / 1_000_000).toFixed(2)}M</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <div className="text-gray-500 mb-0.5">Yield</div>
                    <div className="font-bold text-emerald-600">{item.property.rentalYield}%</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <div className="text-gray-500 mb-0.5">Risk</div>
                    <div className={`font-bold capitalize ${riskColor}`}>{item.investment.riskLevel}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Down ฿{(item.investment.downPayment / 1_000_000).toFixed(2)}M</span>
                  <span>Mortgage ฿{item.investment.monthlyPayment.toLocaleString()}/mo</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  {item.verdict?.decision === 'recommended'
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    : <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />}
                  <span className="text-gray-500 capitalize">{item.verdict?.decision?.replace('-', ' ') ?? '—'}</span>
                  <span className="text-gray-300 ml-auto">
                    {new Date(item.addedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Smart Selling Alert card ───────────────────────────────────────────────
function SmartAlert({ property, onDismiss, onAnalyze }: { property: any; onDismiss: () => void; onAnalyze: () => void }) {
  const gain5 = property.capitalGainProjection?.year5 || 0
  const gain3 = property.capitalGainProjection?.year3 || 0
  return (
    <div className="bg-gradient-to-br from-green-900 to-green-700 text-white rounded-2xl overflow-hidden shadow-lg mb-4">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Bell className="w-4 h-4" />
        </div>
        <span className="font-bold text-sm">Smart Selling Alert</span>
        <span className="ml-auto px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-semibold">TARGET MET</span>
      </div>

      <div className="relative h-36 mx-4 rounded-xl overflow-hidden mb-3">
        <img src={property.image} alt={property.name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3">
          <p className="font-bold text-sm">{property.name}</p>
          <p className="text-xs text-white/70">{property.location}, {property.district}</p>
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className="bg-green-800/60 rounded-xl p-3 mb-3 text-xs text-green-100">
          Target profit of +{gain3}% (3yr) reached. Projected 5-year gain: +{gain5}%. Local supply may increase — optimal exit window now.
        </div>
        <div className="text-sm font-semibold mb-3">AI Verdict: Sell now for peak ROI.</div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="bg-green-800/60 rounded-xl p-2">
            <div className="text-green-300">Current Value</div>
            <div className="font-bold">฿{(property.price / 1_000_000).toFixed(1)}M</div>
          </div>
          <div className="bg-green-800/60 rounded-xl p-2">
            <div className="text-green-300">5-Year Gain</div>
            <div className="font-bold text-green-400">+{gain5}%</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onDismiss}
            className="flex-1 py-2.5 bg-green-800/60 hover:bg-green-800 rounded-xl text-sm font-medium transition">
            Dismiss
          </button>
          <button onClick={onAnalyze}
            className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 rounded-xl text-sm font-semibold transition">
            Analyze This →
          </button>
        </div>
      </div>
    </div>
  )
}
