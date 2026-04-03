'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, MapPin, Building2, ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SimulatorViewProps {
  property: any
  onSimulate: () => void
  onBack?: () => void
}

// Generate a set of Unsplash property images for the gallery
function getGalleryImages(mainImage: string, type: string): string[] {
  const condoImages = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
  ]
  const houseImages = [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  ]
  const pool = type === 'condo' ? condoImages : houseImages
  const all = [mainImage, ...pool.filter(img => img !== mainImage)].slice(0, 6)
  return all
}

export default function SimulatorView({ property, onSimulate, onBack }: SimulatorViewProps) {
  const router = useRouter()
  const [forecast, setForecast] = useState<any>(null)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const images = getGalleryImages(property.image, property.type)

  useEffect(() => {
    const capitalGain = property.capitalGainProjection || { year3: 10, year5: 18, year10: 40 }
    const currentValue = property.price
    setForecast({
      current: currentValue,
      year5: currentValue * (1 + capitalGain.year5 / 100),
      year10: currentValue * (1 + capitalGain.year10 / 100),
      growth5: capitalGain.year5,
      growth10: capitalGain.year10,
    })
  }, [property])

  if (!forecast) return null

  const prevImage = () => setGalleryIndex(i => (i - 1 + images.length) % images.length)
  const nextImage = () => setGalleryIndex(i => (i + 1) % images.length)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <button onClick={onBack || (() => router.push('/'))}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
        <ArrowLeft className="w-5 h-5" /><span>Back</span>
      </button>

      {/* Property Header */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <img src={property.image} alt={property.name} className="w-full h-48 object-cover" />
        <div className="absolute top-4 left-4">
          <span className="bg-violet-700 text-white px-3 py-1 rounded-full text-xs font-semibold">PREMIUM LISTING</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h1 className="text-white text-2xl font-bold">{property.name}</h1>
          <p className="text-white/90 text-sm flex items-center gap-1">
            <MapPin className="w-4 h-4" />{property.location}, {property.province}
          </p>
        </div>
      </div>

      {/* Valuation Range */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <p className="text-gray-500 text-xs uppercase mb-2">Valuation Range</p>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">฿{(property.price / 1000000).toFixed(1)}M</h2>
        <div className="flex items-center gap-2 text-lime-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-semibold">+{forecast.growth5}% 5-Year Growth</span>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-3 gap-1.5 mb-6">
        {images.slice(0, 5).map((img, i) => (
          <div key={i}
            className={`relative rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition ${i === 0 ? 'col-span-2 row-span-2 h-44' : 'h-20'}`}
            onClick={() => { setGalleryIndex(i); setGalleryOpen(true) }}>
            <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
            {i === 4 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-sm">
                +{images.length - 5} more
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {galleryOpen && (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center"
          onClick={() => setGalleryOpen(false)}>
          <button onClick={e => { e.stopPropagation(); prevImage() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/40 transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img src={images[galleryIndex]} alt={`Photo ${galleryIndex + 1}`}
            className="max-w-full max-h-[80vh] rounded-xl object-contain"
            onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); nextImage() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/40 transition">
            <ChevronRight className="w-6 h-6" />
          </button>
          <button onClick={() => setGalleryOpen(false)}
            className="absolute top-4 right-4 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/40 transition">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setGalleryIndex(i) }}
                className={`w-2 h-2 rounded-full transition ${i === galleryIndex ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
          <div className="absolute top-4 left-4 text-white/70 text-sm">
            {galleryIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Location Trend Analytics */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Location Trend Analytics</h3>
        <p className="text-gray-600 text-sm mb-4">
          Proprietary AI forecast based on transit expansion, zoning changes, and historical volatility.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-500 text-xs mb-1">5-YEAR GAIN</p>
            <p className="text-violet-700 text-2xl font-bold">+{forecast.growth5}%</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">10-YEAR GAIN</p>
            <p className="text-lime-600 text-2xl font-bold">+{forecast.growth10}%</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Projected Market Value (10Y)</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-violet-600"></span>Growth Forecast
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-4">฿{(forecast.year10 / 1000000).toFixed(1)}M</p>

          <div className="relative h-40 bg-gradient-to-br from-violet-50 to-white rounded-xl p-4">
            <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6B00D7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6B00D7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="30" x2="400" y2="30" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="0" y1="90" x2="400" y2="90" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
              <path d={`M 0 100 Q 100 90, 200 80 T 400 60`} fill="none" stroke="#6B00D7" strokeWidth="3" strokeLinecap="round" />
              <path d={`M 0 100 Q 100 90, 200 80 T 400 60 L 400 120 L 0 120 Z`} fill="url(#gradient)" />
              <g onMouseEnter={() => setHoveredPoint(0)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer">
                <circle cx="0" cy="100" r={hoveredPoint === 0 ? "6" : "4"} fill="#6B00D7" className="transition-all" />
                {hoveredPoint === 0 && <text x="10" y="95" fill="#6B00D7" fontSize="12" fontWeight="bold">฿{(forecast.current / 1000000).toFixed(1)}M</text>}
              </g>
              <g onMouseEnter={() => setHoveredPoint(1)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer">
                <circle cx="200" cy="80" r={hoveredPoint === 1 ? "6" : "4"} fill="#6B00D7" className="transition-all" />
                {hoveredPoint === 1 && <text x="210" y="75" fill="#6B00D7" fontSize="12" fontWeight="bold">฿{(forecast.year5 / 1000000).toFixed(1)}M</text>}
              </g>
              <g onMouseEnter={() => setHoveredPoint(2)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer">
                <circle cx="400" cy="60" r={hoveredPoint === 2 ? "6" : "4"} fill="#6EE000" className="transition-all" />
                {hoveredPoint === 2 && <text x="340" y="55" fill="#6EE000" fontSize="12" fontWeight="bold">฿{(forecast.year10 / 1000000).toFixed(1)}M</text>}
              </g>
            </svg>
            <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-gray-400">
              <span className={hoveredPoint === 0 ? 'text-violet-700 font-semibold' : ''}>CURRENT</span>
              <span className={hoveredPoint === 1 ? 'text-violet-700 font-semibold' : ''}>5 YEAR</span>
              <span className={hoveredPoint === 2 ? 'text-lime-600 font-semibold' : ''}>10 YEAR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Area Highlights */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Area Highlights</h3>
        {property.nearBTS && (
          <div className="flex gap-3 mb-4 p-3 bg-violet-50 rounded-xl">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-violet-700" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">BTS {property.nearBTS}</p>
              <p className="text-sm text-gray-600">Major transit hub with direct links to CBD and Sukhumvit main line.</p>
            </div>
          </div>
        )}
        <div className="flex gap-3 mb-4 p-3 bg-violet-50 rounded-xl">
          <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">The Commons & EmQuartier</p>
            <p className="text-sm text-gray-600">Walking distance to premium lifestyle malls and high-end dining districts.</p>
          </div>
        </div>
        <div className="flex gap-3 p-3 bg-lime-50 rounded-xl">
          <div className="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-lime-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Samitivej Hospital</p>
            <p className="text-sm text-gray-600">International standard healthcare within 1.2km, boosting rental demand from expats.</p>
          </div>
        </div>
      </div>

      {/* Investment Blueprint */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Investment Blueprint</h3>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-700">Yield Analysis</p>
          <span className="px-3 py-1 bg-lime-100 text-lime-700 text-xs font-semibold rounded-full">STABLE</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Gross Rental Yield</span>
            <span className="font-bold text-gray-900">{property.rentalYield ?? '—'}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Net Monthly Cashflow</span>
            <span className="font-bold text-gray-900">฿{(property.averageRent ?? 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Occupancy Rate (Ideal)</span>
            <span className="font-bold text-gray-900">{property.occupancyRate ?? '—'}%</span>
          </div>
        </div>
      </div>

      <button onClick={onSimulate}
        className="w-full bg-gradient-to-r from-violet-700 to-lime-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:from-violet-800 hover:to-lime-600 transition-colors flex items-center justify-center gap-2">
        <TrendingUp className="w-5 h-5" />Simulate This Investment
      </button>
    </div>
  )
}
