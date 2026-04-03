'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { TrendingUp, Search, MapPin, ChevronRight, Zap } from 'lucide-react'

export default function SimulatorIndexPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [topProperties, setTopProperties] = useState<any[]>([])
  const [allProperties, setAllProperties] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedProperty = localStorage.getItem('selectedProperty')
    const savedCriteria = sessionStorage.getItem('searchCriteria')
    if (savedProperty) {
      try {
        const property = JSON.parse(savedProperty)
        const criteria = savedCriteria ? JSON.parse(savedCriteria) : null
        const params = new URLSearchParams({
          income: criteria?.income?.toString() || '0',
          expense: criteria?.expense?.toString() || '0',
        })
        router.push(`/simulator/${property.id}?${params.toString()}`)
        return
      } catch {
        localStorage.removeItem('selectedProperty')
      }
    }
    setIsChecking(false)
  }, [router])

  useEffect(() => {
    if (isChecking) return
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => {
        const props: any[] = data.projects || []
        setAllProperties(props)
        const top3 = [...props].sort((a, b) => (b.rentalYield || 0) - (a.rentalYield || 0)).slice(0, 3)
        setTopProperties(top3)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isChecking])

  const handleSearch = (q: string) => {
    setSearchQuery(q)
    if (q.trim().length < 2) { setSearchResults([]); setShowDropdown(false); return }
    const results = allProperties
      .filter(p => p.name?.toLowerCase().includes(q.toLowerCase()) || p.location?.toLowerCase().includes(q.toLowerCase()) || p.district?.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 6)
    setSearchResults(results)
    setShowDropdown(true)
  }

  const handleSelect = (property: any) => {
    localStorage.setItem('selectedProperty', JSON.stringify(property))
    router.push(`/simulator/${property.id}?income=0&expense=0`)
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-24 max-w-md mx-auto px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Investment Simulator</h1>
          <p className="text-gray-500 text-sm mt-1">Select a project and see real numbers instantly</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search project name or location..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
            />
          </div>
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-lg border border-gray-100 z-10 overflow-hidden">
              {searchResults.map(p => (
                <button key={p.id} onMouseDown={() => handleSelect(p)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-lime-600">{p.rentalYield?.toFixed(1)}% yield</p>
                    <p className="text-xs text-gray-400">฿{(p.price / 1e6).toFixed(1)}M</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Top Picks */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-lime-500" />
            <span className="text-sm font-bold text-gray-800">Top ROI Picks — tap to start</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {topProperties.map((p, i) => (
                <button key={p.id} onClick={() => handleSelect(p)}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex hover:shadow-md transition-shadow text-left">
                  <div className="relative w-24 flex-shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                      ${i === 0 ? 'bg-violet-700' : i === 1 ? 'bg-violet-400' : 'bg-lime-500'}`}>
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 p-3">
                    <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{p.location}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-lime-600">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs font-bold">{p.rentalYield?.toFixed(1)}% yield</span>
                      </div>
                      <span className="text-xs text-gray-400">฿{(p.price / 1e6).toFixed(1)}M</span>
                    </div>
                  </div>
                  <div className="flex items-center pr-3">
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Preview of what you'll see</p>
          <p className="text-sm font-bold text-gray-800 mb-4">Once you select a project...</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'ROI / yr', value: '~6.2%', color: 'text-lime-600' },
              { label: 'Monthly payment', value: '~฿18K', color: 'text-violet-700' },
              { label: 'Cash flow', value: '+฿4K', color: 'text-violet-500' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="relative h-20 bg-gradient-to-br from-violet-50 to-white rounded-xl overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="previewGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6B00D7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6B00D7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0 70 Q 75 55, 150 40 T 300 15" fill="none" stroke="#6B00D7" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 0 70 Q 75 55, 150 40 T 300 15 L 300 80 L 0 80 Z" fill="url(#previewGrad)" />
              <circle cx="0" cy="70" r="3" fill="#6B00D7" />
              <circle cx="150" cy="40" r="3" fill="#6B00D7" />
              <circle cx="300" cy="15" r="3" fill="#6EE000" />
            </svg>
            <div className="absolute bottom-2 left-3 right-3 flex justify-between text-xs text-gray-400">
              <span>Now</span><span>5 yr</span><span>10 yr</span>
            </div>
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-xs text-gray-400 font-medium bg-white/80 px-3 py-1 rounded-full">Select a project to see real data</span>
            </div>
          </div>
        </div>

      </main>
      <BottomNav />
    </div>
  )
}
