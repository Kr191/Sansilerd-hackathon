'use client'

import { useState, useEffect, useMemo } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { TrendingUp, TrendingDown, Home, DollarSign, Zap, MapPin, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Priority = 'high' | 'medium' | 'low'
type InsightType = 'opportunity' | 'market' | 'yield' | 'risk'

interface Insight {
  id: string
  type: InsightType
  priority: Priority
  title: string
  body: string
  metric: string
  metricLabel: string
  positive: boolean
  property: any
  generatedAt: Date
  action: string
}

function generateInsights(properties: any[]): Insight[] {
  if (!properties.length) return []
  const now = new Date()
  const insights: Insight[] = []

  // Highest 5-year capital gain → sell signal
  const byGain = [...properties].sort((a, b) =>
    (b.capitalGainProjection?.year5 || 0) - (a.capitalGainProjection?.year5 || 0)
  )
  const topGain = byGain[0]
  if (topGain) {
    const gain5 = topGain.capitalGainProjection?.year5 || 0
    const gain3 = topGain.capitalGainProjection?.year3 || 0
    insights.push({
      id: 'opp-1',
      type: 'opportunity',
      priority: 'high',
      title: 'Optimal Exit Window — Act Now',
      body: `Our model flags ${topGain.name} as the strongest sell candidate in the current portfolio. At +${gain5}% projected over 5 years (${gain3}% already realised in year 3), holding beyond this quarter risks margin compression as new supply enters the ${topGain.district} corridor.`,
      metric: `+${gain5}%`,
      metricLabel: '5-Year Capital Gain',
      positive: true,
      property: topGain,
      generatedAt: new Date(now.getTime() - 1000 * 60 * 12),
      action: 'Run Simulation',
    })
  }

  // Highest rental yield → income play
  const byYield = [...properties].sort((a, b) => (b.rentalYield || 0) - (a.rentalYield || 0))
  const topYield = byYield[0]
  if (topYield) {
    const diff = (topYield.rentalYield - 5.5).toFixed(1)
    insights.push({
      id: 'yield-1',
      type: 'yield',
      priority: 'high',
      title: 'Above-Market Yield Identified',
      body: `${topYield.name} is generating ${topYield.rentalYield}% gross yield — ${diff}pp above the Bangkok condo average. At ${topYield.occupancyRate}% historical occupancy, net cash flow remains positive across most financing scenarios. Worth modelling before this window closes.`,
      metric: `${topYield.rentalYield}%`,
      metricLabel: 'Gross Rental Yield',
      positive: true,
      property: topYield,
      generatedAt: new Date(now.getTime() - 1000 * 60 * 38),
      action: 'Model Returns',
    })
  }

  // Best location score → appreciation play
  const byLocation = [...properties].sort((a, b) => (b.locationScore || 0) - (a.locationScore || 0))
  const topLocation = byLocation[0]
  if (topLocation) {
    insights.push({
      id: 'market-1',
      type: 'market',
      priority: 'medium',
      title: 'Transit Corridor Appreciation Signal',
      body: `${topLocation.name} scores ${topLocation.locationScore}/100 on our location index — driven by BTS proximity and commercial density. Historically, properties in this tier appreciate 8–12% within 18 months of infrastructure announcements. Current pricing may not yet reflect this upside.`,
      metric: `${topLocation.locationScore}/100`,
      metricLabel: 'Location Index',
      positive: true,
      property: topLocation,
      generatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
      action: 'View Property',
    })
  }

  // Lowest liquidity → risk advisory
  const byLiquidity = [...properties].sort((a, b) => (a.liquidityScore || 0) - (b.liquidityScore || 0))
  const lowLiquidity = byLiquidity[0]
  if (lowLiquidity && (lowLiquidity.liquidityScore || 0) < 80) {
    insights.push({
      id: 'risk-1',
      type: 'risk',
      priority: 'medium',
      title: 'Liquidity Constraint — Review Before Committing',
      body: `${lowLiquidity.name} carries a liquidity score of ${lowLiquidity.liquidityScore}/100. At this level, exit timelines typically extend to 6–12 months at fair market value. If your investment horizon is under 3 years, consider a higher-liquidity alternative before allocating capital.`,
      metric: `${lowLiquidity.liquidityScore}/100`,
      metricLabel: 'Liquidity Score',
      positive: false,
      property: lowLiquidity,
      generatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 6),
      action: 'Compare Options',
    })
  }

  // Lowest price → entry-level opportunity
  const byPrice = [...properties].sort((a, b) => (a.price || 0) - (b.price || 0))
  const cheapest = byPrice[0]
  if (cheapest) {
    insights.push({
      id: 'market-2',
      type: 'market',
      priority: 'low',
      title: 'Lowest Capital Requirement in Portfolio',
      body: `${cheapest.name} requires the smallest initial outlay at ฿${(cheapest.price / 1_000_000).toFixed(2)}M. With a ${cheapest.rentalYield}% yield and ${cheapest.occupancyRate}% occupancy, it offers a viable entry point for investors building their first position or diversifying across multiple assets.`,
      metric: `฿${(cheapest.price / 1_000_000).toFixed(1)}M`,
      metricLabel: 'Starting Price',
      positive: true,
      property: cheapest,
      generatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 20),
      action: 'Explore Entry',
    })
  }

  return insights.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
}

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const TYPE_CONFIG: Record<InsightType, { icon: any; iconBg: string; iconColor: string; border: string }> = {
  opportunity: { icon: TrendingUp,   iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', border: 'border-l-emerald-500' },
  yield:       { icon: DollarSign,   iconBg: 'bg-violet-100',  iconColor: 'text-violet-600',  border: 'border-l-violet-500'  },
  market:      { icon: Home,         iconBg: 'bg-blue-100',    iconColor: 'text-blue-600',    border: 'border-l-blue-500'    },
  risk:        { icon: TrendingDown, iconBg: 'bg-red-100',     iconColor: 'text-red-500',     border: 'border-l-red-500'     },
}

const PRIORITY_BADGE: Record<Priority, string> = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-blue-100 text-blue-700',
}

export default function InsightsPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [filter, setFilter] = useState<Priority | 'all'>('all')

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(d => setProperties(d.projects || []))
      .catch(() => {})
  }, [])

  const insights = useMemo(() => generateInsights(properties), [properties])

  const counts = useMemo(() => ({
    high:   insights.filter(i => i.priority === 'high').length,
    medium: insights.filter(i => i.priority === 'medium').length,
    low:    insights.filter(i => i.priority === 'low').length,
  }), [insights])

  const visible = filter === 'all' ? insights : insights.filter(i => i.priority === filter)

  const handleAction = (insight: Insight) => {
    localStorage.setItem('selectedProperty', JSON.stringify(insight.property))
    router.push(`/simulator/${insight.property.id}?income=0&expense=0`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-24">
        <div className="max-w-md mx-auto px-4 py-6">

          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-violet-600" />
              <h1 className="text-2xl font-bold">AI Insights</h1>
            </div>
            <p className="text-gray-500 text-sm">Sovereign AI scans the full Sansiri portfolio in real time and surfaces what matters to your investment strategy.</p>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2 mb-5">
            {(['high', 'medium', 'low'] as Priority[]).map(p => (
              <button key={p}
                onClick={() => setFilter(prev => prev === p ? 'all' : p)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                  filter === p
                    ? p === 'high' ? 'bg-red-600 text-white border-red-600'
                      : p === 'medium' ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                  filter === p ? 'bg-white/20' :
                  p === 'high' ? 'bg-red-100 text-red-700' :
                  p === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {counts[p]}
                </span>
                <span>{p === 'high' ? 'High' : p === 'medium' ? 'Medium' : 'Low'}</span>
              </button>
            ))}
          </div>

          {/* Insights list */}
          {properties.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <p className="text-gray-500 text-sm">No {filter} priority insights right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map(insight => {
                const cfg = TYPE_CONFIG[insight.type]
                const Icon = cfg.icon
                return (
                  <div key={insight.id}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm border-l-4 ${cfg.border}`}>
                    {/* Property image */}
                    <div className="relative h-28">
                      <img src={insight.property.image} alt={insight.property.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800' }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_BADGE[insight.priority]}`}>
                        {insight.priority.toUpperCase()}
                      </div>
                      <div className="absolute bottom-2 left-3">
                        <p className="text-white text-xs font-semibold">{insight.property.name}</p>
                        <p className="text-white/70 text-xs flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />{insight.property.location}
                        </p>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
                          <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="font-bold text-gray-900 text-sm">{insight.title}</p>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{timeAgo(insight.generatedAt)}</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{insight.body}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className={`px-3 py-1.5 rounded-xl ${insight.positive ? 'bg-emerald-50' : 'bg-red-50'}`}>
                          <p className="text-xs text-gray-500">{insight.metricLabel}</p>
                          <p className={`text-sm font-bold ${insight.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                            {insight.metric}
                          </p>
                        </div>
                        <button onClick={() => handleAction(insight)}
                          className="flex items-center gap-1 px-4 py-2 bg-violet-700 text-white text-xs font-semibold rounded-xl hover:bg-violet-800 transition">
                          {insight.action}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
