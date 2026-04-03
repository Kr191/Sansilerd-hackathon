'use client'

import { useState } from 'react'
import { X, TrendingUp, Home, Bed, Bath, MapPin, CheckCircle, XCircle } from 'lucide-react'

interface CompareModeProps {
  properties: any[]
  onClose: () => void
  onSelectProperty: (property: any) => void
}

const METRICS = [
  { key: 'price', label: 'Price', format: (v: number) => `฿${(v / 1000000).toFixed(2)}M` },
  { key: 'rentalYield', label: 'Rental Yield', format: (v: number) => `${v}%` },
  { key: 'capitalGainProjection.year5', label: '5-Year Capital Gain', format: (v: number) => `+${v}%` },
  { key: 'capitalGainProjection.year10', label: '10-Year Capital Gain', format: (v: number) => `+${v}%` },
  { key: 'averageRent', label: 'Est. Monthly Rent', format: (v: number) => `฿${v.toLocaleString()}` },
  { key: 'occupancyRate', label: 'Occupancy Rate', format: (v: number) => `${v}%` },
  { key: 'locationScore', label: 'Location Score', format: (v: number) => `${v}/100` },
  { key: 'liquidityScore', label: 'Liquidity Score', format: (v: number) => `${v}/100` },
  { key: 'size', label: 'Size', format: (v: number) => `${v} sqm` },
  { key: 'pricePerSqm', label: 'Price/sqm', format: (v: number) => `฿${v.toLocaleString()}` },
]

function getNestedValue(obj: any, path: string): number {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? 0
}

function getBestIndex(values: number[], higherIsBetter = true): number {
  if (values.every(v => v === values[0])) return -1
  return higherIsBetter
    ? values.indexOf(Math.max(...values))
    : values.indexOf(Math.min(...values))
}

export default function CompareMode({ properties, onClose, onSelectProperty }: CompareModeProps) {
  const [selected, setSelected] = useState<string[]>(
    properties.slice(0, 3).map(p => p.id)
  )

  // Enrich properties — fill any missing computed fields
  const enriched = properties.map(p => ({
    ...p,
    pricePerSqm: p.pricePerSqm || (p.price && p.size ? Math.round(p.price / p.size) : 0),
    locationScore: p.locationScore || 0,
    liquidityScore: p.liquidityScore || 0,
  }))

  const compared = enriched.filter(p => selected.includes(p.id))

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 3 ? [...prev, id] : prev
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] overflow-y-auto">
      <div className="min-h-screen px-2 py-4 pb-24">
        <div className="max-w-2xl mx-auto bg-gray-50 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-violet-700 text-white px-4 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Compare Properties</h2>
              <p className="text-violet-200 text-xs">Select up to 3 properties</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Property selector pills */}
          <div className="px-4 py-3 bg-white border-b flex flex-wrap gap-2">
            {enriched.map(p => (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                  selected.includes(p.id)
                    ? 'bg-violet-700 text-white border-violet-700'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                {selected.includes(p.id) ? '✓ ' : ''}{p.name.split(' ').slice(0, 3).join(' ')}
              </button>
            ))}
          </div>

          {compared.length < 2 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Select at least 2 properties to compare</p>
            </div>
          ) : (
            <>
              {/* Property header cards */}
              <div className={`grid gap-2 p-3 bg-white border-b`}
                style={{ gridTemplateColumns: `repeat(${compared.length}, 1fr)` }}>
                {compared.map(p => (
                  <div key={p.id} className="text-center">
                    <img src={p.image} alt={p.name}
                      className="w-full h-24 object-cover rounded-xl mb-2"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400' }} />
                    <p className="text-xs font-bold text-gray-900 leading-tight">{p.name}</p>
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-0.5 mt-0.5">
                      <MapPin className="w-3 h-3" />{p.district}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" />{p.bedrooms}</span>
                      <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" />{p.bathrooms}</span>
                      <span className="flex items-center gap-0.5"><Home className="w-3 h-3" />{p.size}m²</span>
                    </div>
                    {p.nearBTS && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full">
                        🚇 {p.nearBTS}
                      </span>
                    )}
                    {/* Match score */}
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 -rotate-90">
                          <circle cx="20" cy="20" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                          <circle cx="20" cy="20" r="16" fill="none" stroke="#6B00D7" strokeWidth="3"
                            strokeDasharray={`${(p.match_score / 100) * 100.5} 100.5`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                          {Math.round(p.match_score || 0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Metrics table */}
              <div className="divide-y">
                {METRICS.map(({ key, label, format }) => {
                  const values = compared.map(p => getNestedValue(p, key))
                  const lowerIsBetter = key === 'price' || key === 'pricePerSqm'
                  const bestIdx = getBestIndex(values, !lowerIsBetter)

                  return (
                    <div key={key} className="px-4 py-3 bg-white">
                      <p className="text-xs text-gray-500 uppercase mb-2">{label}</p>
                      <div className={`grid gap-2`}
                        style={{ gridTemplateColumns: `repeat(${compared.length}, 1fr)` }}>
                        {values.map((val, i) => (
                          <div key={i} className={`text-center p-2 rounded-lg ${
                            bestIdx === i ? 'bg-lime-50 border border-lime-300' : 'bg-gray-50'
                          }`}>
                            <span className={`text-sm font-bold ${bestIdx === i ? 'text-lime-700' : 'text-gray-800'}`}>
                              {format(val)}
                            </span>
                            {bestIdx === i && (
                              <div className="text-xs text-lime-600 mt-0.5">★ Best</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Risk level row */}
              <div className="px-4 py-3 bg-white border-t">
                <p className="text-xs text-gray-500 uppercase mb-2">Risk Level</p>
                <div className={`grid gap-2`}
                  style={{ gridTemplateColumns: `repeat(${compared.length}, 1fr)` }}>
                  {compared.map(p => (
                    <div key={p.id} className="text-center p-2 bg-gray-50 rounded-lg">
                      <span className={`text-sm font-bold ${
                        p.riskLevel === 'low' ? 'text-lime-600' :
                        p.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {p.riskLevel === 'low' ? '🟢 Low' : p.riskLevel === 'medium' ? '🟡 Medium' : '🔴 High'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="p-4 bg-white border-t">
                <div className={`grid gap-2`}
                  style={{ gridTemplateColumns: `repeat(${compared.length}, 1fr)` }}>
                  {compared.map(p => (
                    <button key={p.id}
                      onClick={() => { onSelectProperty(p); onClose() }}
                      className="py-3 bg-violet-700 text-white text-xs font-bold rounded-xl hover:bg-violet-800 transition">
                      Analyze →
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
