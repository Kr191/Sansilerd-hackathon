'use client'

import { useState, useEffect } from 'react'
import { MapPin, TrendingUp, Home, Bed, Bath, AlertCircle, ArrowLeft, GitCompare } from 'lucide-react'
import CompareMode from './CompareMode'
import { WatchlistButton } from './Watchlist'

interface PropertyMatchesProps {
  criteria: any
  onSelectProperty: (property: any) => void
  onBack: () => void
}

export default function PropertyMatches({ criteria, onSelectProperty, onBack }: PropertyMatchesProps) {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [exactLocationMatch, setExactLocationMatch] = useState(true)
  const [compareOpen, setCompareOpen] = useState(false)

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(criteria),
        })
        const data = await response.json()
        setMatches(data.recommendations || [])
        setMessage(data.message || '')
        setExactLocationMatch(data.exactLocationMatch !== false)
      } catch (error) {
        console.error('Error fetching matches:', error)
      }
      setLoading(false)
    }
    fetchMatches()
  }, [criteria])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Finding properties that match you...</p>
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <button onClick={onBack} className="text-violet-700 mb-4">← Back</button>
        <div className="bg-white rounded-xl p-6 text-center">
          <p className="text-gray-600">No properties found matching your criteria.</p>
          <button onClick={onBack} className="mt-4 px-6 py-2 bg-violet-700 text-white rounded-lg">Search Again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5" /><span>Edit Criteria</span>
        </button>

        <div className="bg-violet-50 rounded-lg p-4 mb-4">
          <div className="text-sm text-gray-600 mb-2 font-semibold">ACTIVE SEARCH CRITERIA</div>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium">
              💰 Budget: {(criteria.budget_min / 1000000).toFixed(1)}–{(criteria.budget_max / 1000000).toFixed(1)}M
            </span>
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium">
              📈 Goal: {criteria.goal === 'rent' ? 'Rent' : 'Flip'}
            </span>
          </div>
          {criteria.location && (
            <div className="flex items-center gap-2 text-sm mb-2">
              <MapPin className="w-4 h-4" /><span>{criteria.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>💵 Income: {(criteria.income / 1000).toFixed(0)}K</span>
            <span>•</span>
            <span>💳 Expense: {(criteria.expense / 1000).toFixed(0)}K</span>
          </div>
          <button onClick={onBack}
            className="w-full mt-3 py-2 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-200 transition">
            ⚙️ Refine Search
          </button>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 font-medium">{message}</p>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-2">Top {matches.length} Matches for You</h2>
        <p className="text-gray-600 text-sm">Based on your portfolio goals and market volatility.</p>

        {matches.length >= 2 && (
          <button onClick={() => setCompareOpen(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-violet-700 text-white rounded-xl text-sm font-semibold hover:bg-violet-800 transition">
            <GitCompare className="w-4 h-4" />
            Compare All Properties Side-by-Side
          </button>
        )}
      </div>

      <div className="space-y-4">
        {matches.map((property, index) => (
          <div key={property.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => onSelectProperty(property)}>
            <div className="relative">
              <div className="absolute top-3 left-3 w-10 h-10 bg-violet-700 text-white rounded-full flex items-center justify-center font-bold text-lg z-10">
                {index + 1}
              </div>
              {property.premium && (
                <div className="absolute top-3 right-3 px-3 py-1 bg-lime-500 text-white text-xs rounded-full font-semibold z-10">
                  PREMIUM
                </div>
              )}
              <img src={property.image} alt={property.name} className="w-full h-48 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800' }} />
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{property.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />{property.location}, {property.district}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Home className="w-3 h-3" />{property.size} sqm</span>
                    <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{property.bedrooms} bed</span>
                    <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{property.bathrooms} bath</span>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-violet-700 font-bold text-lg">{(property.price / 1000000).toFixed(2)}M</div>
                  <div className="text-xs text-gray-500">THB</div>
                  <div className="text-xs text-lime-600 font-medium">Starting price</div>
                </div>
              </div>

              {property.nearBTS && (
                <div className="mb-3 px-3 py-1 bg-violet-50 text-violet-700 text-xs rounded-full inline-block">
                  🚇 Near BTS {property.nearBTS}
                </div>
              )}

              <div className="bg-violet-50 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700 font-medium">{property.short_reason}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14">
                    <svg className="w-14 h-14 transform -rotate-90">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#6B00D7" strokeWidth="4"
                        strokeDasharray={`${(property.match_score / 100) * 150.8} 150.8`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                      {Math.round(property.match_score)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">MATCH SCORE</div>
                    <div className="text-sm font-semibold text-violet-700">
                      {property.match_score > 85 ? 'High Affinity' : property.match_score > 70 ? 'Good Match' : 'Consider'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600">Est. Yield</div>
                  <div className="text-lg font-bold text-lime-600">{property.roi?.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">per year</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-600">Risk Level:</span>
                    <span className={`font-semibold ${property.riskLevel === 'low' ? 'text-lime-600' : property.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {property.riskLevel === 'low' ? '🟢 Low' : property.riskLevel === 'medium' ? '🟡 Medium' : '🔴 High'}
                    </span>
                  </div>
                  <WatchlistButton property={property} size="sm" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {matches.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-violet-50 to-lime-50 rounded-xl p-4 border border-violet-100">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-600" />AI Insight
          </h3>
          <p className="text-sm text-gray-700">
            Found {matches.length} projects for you. Top match score: {matches[0].match_score.toFixed(1)}%
            {criteria.goal === 'rent' ? ' — suitable for rental.' : ' — suitable for flipping.'}
            {!exactLocationMatch && ' (Showing nearest suitable projects)'}
          </p>
          {matches.length === 5 && (
            <p className="text-xs text-gray-600 mt-2">💡 Showing Top 5 AI-analyzed projects</p>
          )}
        </div>
      )}

      {compareOpen && (
        <CompareMode
          properties={matches}
          onClose={() => setCompareOpen(false)}
          onSelectProperty={onSelectProperty}
        />
      )}
    </div>
  )
}
