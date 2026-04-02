'use client'

import { Bell, BookmarkCheck, X, TrendingUp, MapPin, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useWatchlist } from './Watchlist'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { watchlist, remove } = useWatchlist()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const router = useRouter()

  return (
    <>
      {/* ── Header bar ── */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-14 w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-violet-800 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">Sovereign AI</span>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-0.5">
            {/* Saved properties */}
            <button onClick={() => setOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              aria-label="Saved properties">
              <BookmarkCheck className="w-5 h-5 text-gray-600" />
              {watchlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {watchlist.length}
                </span>
              )}
            </button>
            {/* Notifications */}
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              aria-label="Notifications">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Saved Properties panel ── */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end"
          onClick={() => { setOpen(false); setSelected(null) }}>
          <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}>

            {/* Panel header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b flex-shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Saved Properties</h3>
                <p className="text-xs text-gray-400 mt-0.5">{watchlist.length} saved</p>
              </div>
              <button onClick={() => { setOpen(false); setSelected(null) }}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 pb-6">
              {watchlist.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <BookmarkCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Nothing saved yet</p>
                  <p className="text-xs mt-1 text-gray-300">Tap Save on any property card</p>
                </div>
              ) : watchlist.map((p: any) => (
                <div key={p.id}>
                  {/* Card row */}
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => setSelected(selected?.id === p.id ? null : p)}>
                    <img src={p.image} alt={p.name}
                      className="w-16 h-14 object-cover rounded-xl flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200' }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{p.location}, {p.district}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-violet-700">฿{(p.price / 1e6).toFixed(2)}M</span>
                        <span className="text-xs text-lime-600 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />{p.rentalYield}% yield
                        </span>
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); remove(p.id) }}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 text-gray-400 transition flex-shrink-0"
                      aria-label="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {selected?.id === p.id && (
                    <div className="mx-4 mb-3 bg-violet-50 rounded-2xl p-4 border border-violet-100">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-white rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-0.5">Price</p>
                          <p className="font-bold text-gray-900">฿{(p.price / 1e6).toFixed(2)}M</p>
                        </div>
                        <div className="bg-white rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-0.5">Rental Yield</p>
                          <p className="font-bold text-lime-600">{p.rentalYield}%</p>
                        </div>
                        <div className="bg-white rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-0.5">Est. Monthly Rent</p>
                          <p className="font-bold text-gray-900">฿{(p.averageRent ?? 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-0.5">5-Year Gain</p>
                          <p className="font-bold text-violet-700">+{p.capitalGainProjection?.year5 ?? '—'}%</p>
                        </div>
                        <div className="bg-white rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-0.5">Size</p>
                          <p className="font-bold text-gray-900">{p.size} sqm</p>
                        </div>
                        <div className="bg-white rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-0.5">Risk</p>
                          <p className={`font-bold ${p.riskLevel === 'low' ? 'text-lime-600' : p.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                            {p.riskLevel === 'low' ? '🟢 Low' : p.riskLevel === 'medium' ? '🟡 Medium' : '🔴 High'}
                          </p>
                        </div>
                      </div>
                      {p.nearBTS && (
                        <p className="text-xs text-violet-700 mb-3">🚇 Near BTS {p.nearBTS}</p>
                      )}
                      <button
                        onClick={() => {
                          setOpen(false)
                          setSelected(null)
                          localStorage.setItem('selectedProperty', JSON.stringify(p))
                          router.push(`/simulator/${p.id}`)
                        }}
                        className="w-full py-2.5 bg-violet-700 text-white rounded-xl text-sm font-semibold hover:bg-violet-800 transition">
                        Analyze This Property →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
