'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, MapPin, Building2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SimulatorViewProps {
  property: any
  onSimulate: () => void
  onBack?: () => void
}

export default function SimulatorView({ property, onSimulate, onBack }: SimulatorViewProps) {
  const router = useRouter()
  const [forecast, setForecast] = useState<any>(null)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  useEffect(() => {
    // คำนวณ forecast
    const currentValue = property.price
    const year5Value = currentValue * (1 + property.capitalGainProjection.year5 / 100)
    const year10Value = currentValue * (1 + property.capitalGainProjection.year10 / 100)
    
    setForecast({
      current: currentValue,
      year5: year5Value,
      year10: year10Value,
      growth5: property.capitalGainProjection.year5,
      growth10: property.capitalGainProjection.year10
    })
  }, [property])

  if (!forecast) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Back Button */}
      <button 
        onClick={onBack || (() => router.push('/'))}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Property Header */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <img 
          src={property.image} 
          alt={property.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-emerald-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
            PREMIUM LISTING
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h1 className="text-white text-2xl font-bold">{property.name}</h1>
          <p className="text-white/90 text-sm flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {property.location}, {property.province}
          </p>
        </div>
      </div>

      {/* Valuation Range */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <p className="text-gray-500 text-xs uppercase mb-2">Valuation Range</p>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ฿{(property.price / 1000000).toFixed(1)}M
        </h2>
        <div className="flex items-center gap-2 text-emerald-500">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-semibold">+{forecast.growth5}% 5-Year Growth</span>
        </div>
      </div>

      {/* Property Images */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl overflow-hidden h-32">
          <img src={property.image} alt="Pool" className="w-full h-full object-cover" />
        </div>
        <div className="rounded-xl overflow-hidden h-32 bg-gray-900 relative">
          <img src={property.image} alt="Interior" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
            +12 Photos
          </div>
        </div>
      </div>

      {/* Location Trend Analytics */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Location Trend Analytics</h3>
        <p className="text-gray-600 text-sm mb-4">
          Proprietary AI forecast based on transit expansion, zoning changes, and historical volatility.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-500 text-xs mb-1">5-YEAR GAIN</p>
            <p className="text-emerald-500 text-2xl font-bold">+{forecast.growth5}%</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">10-YEAR GAIN</p>
            <p className="text-emerald-500 text-2xl font-bold">+{forecast.growth10}%</p>
          </div>
        </div>

        {/* Market Value Chart */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Projected Market Value (10Y)</span>
            <div className="flex gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Growth Forecast
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-4">
            ฿{(forecast.year10 / 1000000).toFixed(1)}M
          </p>
          
          {/* Interactive Growth Chart */}
          <div className="relative h-40 bg-gradient-to-br from-emerald-50 to-white rounded-xl p-4">
            <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              <line x1="0" y1="30" x2="400" y2="30" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="0" y1="90" x2="400" y2="90" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
              
              {/* Growth curve with animation */}
              <path
                d={`M 0 ${100 - (0)} 
                    Q 100 ${100 - (10)}, 200 ${100 - (20)} 
                    T 400 ${100 - (40)}`}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                className="animate-[draw_2s_ease-in-out]"
              />
              
              {/* Fill area */}
              <path
                d={`M 0 ${100 - (0)} 
                    Q 100 ${100 - (10)}, 200 ${100 - (20)} 
                    T 400 ${100 - (40)} 
                    L 400 120 L 0 120 Z`}
                fill="url(#gradient)"
                className="animate-[fadeIn_1.5s_ease-in]"
              />
              
              {/* Interactive data points */}
              <g 
                onMouseEnter={() => setHoveredPoint(0)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                <circle 
                  cx="0" 
                  cy={100 - 0} 
                  r={hoveredPoint === 0 ? "6" : "4"} 
                  fill="#10b981"
                  className="transition-all"
                />
                {hoveredPoint === 0 && (
                  <text x="10" y={100 - 5} fill="#10b981" fontSize="12" fontWeight="bold">
                    ฿{(forecast.current / 1000000).toFixed(1)}M
                  </text>
                )}
              </g>
              
              <g 
                onMouseEnter={() => setHoveredPoint(1)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                <circle 
                  cx="200" 
                  cy={100 - 20} 
                  r={hoveredPoint === 1 ? "6" : "4"} 
                  fill="#10b981"
                  className="transition-all"
                />
                {hoveredPoint === 1 && (
                  <text x="210" y={100 - 25} fill="#10b981" fontSize="12" fontWeight="bold">
                    ฿{(forecast.year5 / 1000000).toFixed(1)}M
                  </text>
                )}
              </g>
              
              <g 
                onMouseEnter={() => setHoveredPoint(2)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                <circle 
                  cx="400" 
                  cy={100 - 40} 
                  r={hoveredPoint === 2 ? "6" : "4"} 
                  fill="#10b981"
                  className="transition-all"
                />
                {hoveredPoint === 2 && (
                  <text x="340" y={100 - 45} fill="#10b981" fontSize="12" fontWeight="bold">
                    ฿{(forecast.year10 / 1000000).toFixed(1)}M
                  </text>
                )}
              </g>
            </svg>
            
            <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-gray-400">
              <span className={hoveredPoint === 0 ? 'text-emerald-600 font-semibold' : ''}>CURRENT</span>
              <span className={hoveredPoint === 1 ? 'text-emerald-600 font-semibold' : ''}>5 YEAR</span>
              <span className={hoveredPoint === 2 ? 'text-emerald-600 font-semibold' : ''}>10 YEAR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Area Highlights */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Area Highlights</h3>
        
        {property.nearBTS && (
          <div className="flex gap-3 mb-4 p-3 bg-blue-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">BTS {property.nearBTS}</p>
              <p className="text-sm text-gray-600">
                450m (6 min walk). Major transit hub with direct links to CBD and Sukhumvit main line.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-4 p-3 bg-purple-50 rounded-xl">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">The Commons & EmQuartier</p>
            <p className="text-sm text-gray-600">
              Walking distance to premium lifestyle malls and high-end dining districts.
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-3 bg-green-50 rounded-xl">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Samitivej Hospital</p>
            <p className="text-sm text-gray-600">
              International standard healthcare within 1.2km radius, boosting rental demand from expats.
            </p>
          </div>
        </div>
      </div>

      {/* Investment Blueprint */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Investment Blueprint</h3>
        
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-700">Yield Analysis</p>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
            STABLE
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Gross Rental Yield</span>
            <span className="font-bold text-gray-900">{property.rentalYield}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Net Monthly Cashflow</span>
            <span className="font-bold text-gray-900">฿{property.averageRent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Occupancy Rate (Ideal)</span>
            <span className="font-bold text-gray-900">{property.occupancyRate}%</span>
          </div>
        </div>
      </div>

      {/* Simulate Button */}
      <button
        onClick={onSimulate}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-5 h-5" />
        Simulate This Investment
      </button>
    </div>
  )
}
