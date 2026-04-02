'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertTriangle } from 'lucide-react'
import { Property } from '@/lib/sansiriData'

export default function Portfolio() {
  const [mockAssets, setMockAssets] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch live properties and pick 3 for demo portfolio
    fetch('/api/projects?category=condo')
      .then(r => r.json())
      .then(data => {
        const all: Property[] = data.projects || []
        // Pick 3 spread across the list for variety
        const picks = [
          all[1],
          all[Math.floor(all.length / 2)],
          all[0],
        ].filter(Boolean)
        setMockAssets(picks)
      })
      .catch(() => setMockAssets([]))
      .finally(() => setLoading(false))
  }, [])


  const portfolioData = [
    { month: 'Aug 23', value: 35 },
    { month: 'Feb 24', value: 38 },
    { month: 'Aug 24', value: 42 },
    { month: 'Sep 11', value: 48 },
  ]

  // Calculate portfolio summary
  const totalValue = mockAssets.reduce((sum, asset) => sum + asset.price, 0)
  const totalMonthlyRent = mockAssets.reduce((sum, asset) => sum + asset.averageRent, 0)
  const avgROI = mockAssets.reduce((sum, asset) => sum + asset.rentalYield, 0) / (mockAssets.length || 1)

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Portfolio Hub</h1>
        <p className="text-gray-600 text-sm">Real-time asset performance and AI management</p>
        
        <div className="flex gap-2 mt-3">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
            Export Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
            Add New Asset
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">PORTFOLIO VALUE</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold">฿{(totalValue / 1000000).toFixed(1)}M</div>
            <div className="text-green-600 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12.4%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">OVERALL ROI</div>
            <div className="text-2xl font-bold">{avgROI.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Annualized</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">MONTHLY CASH FLOW</div>
            <div className="text-2xl font-bold">฿{totalMonthlyRent.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Gross Income</div>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">PORTFOLIO GROWTH</span>
            <span className="text-blue-600 font-medium">PROJECTION ACTIVE</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={portfolioData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Smart Selling Alert */}
      <div className="bg-gradient-to-br from-green-900 to-green-700 text-white rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold mb-3">Smart Selling Alerts</h3>
            
            <div className="bg-green-800 rounded-lg overflow-hidden mb-3">
              {/* Property Image */}
              <div className="relative h-32">
                <img 
                  src={mockAssets[0]?.image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'} 
                  alt={mockAssets[0]?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
                  }}
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded font-semibold">
                  TARGET MET
                </div>
              </div>
              
              {/* Alert Content */}
              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-white">{mockAssets[0]?.name || 'Property'}</div>
                    <div className="text-xs text-green-200 mt-1">
                      {mockAssets[0]?.location}, {mockAssets[0]?.district}
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-900 rounded-lg p-2 mb-2">
                  <div className="text-xs text-green-200 mb-1">
                    Target profit of +{mockAssets[0]?.capitalGainProjection.year3 || 22}% reached. Local supply is projected to increase by 10% next quarter.
                  </div>
                  <div className="text-sm font-semibold">AI Verdict: Sell now for peak ROI.</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div className="bg-green-900 rounded p-2">
                    <div className="text-green-300">Current Value</div>
                    <div className="font-bold">฿{((mockAssets[0]?.price || 0) / 1000000).toFixed(1)}M</div>
                  </div>
                  <div className="bg-green-900 rounded p-2">
                    <div className="text-green-300">Potential Gain</div>
                    <div className="font-bold text-green-400">+{mockAssets[0]?.capitalGainProjection.year3 || 22}%</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-green-800 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                Dismiss
              </button>
              <button className="flex-1 py-2 bg-green-500 rounded-lg text-sm font-medium hover:bg-green-400 transition-colors">
                Execute Exit Strategy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Portfolio Assets */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold mb-3">ACTIVE PORTFOLIO ASSETS</h3>
        
        <div className="space-y-3">
          {mockAssets.map((asset, index) => {
            const isOccupied = index !== 1
            const purchasePrice = asset.price * 0.9
            const profitPercent = ((asset.price - purchasePrice) / purchasePrice) * 100
            
            return (
              <div key={asset.id} className="border rounded-lg overflow-hidden">
                <div className="relative h-32 bg-gray-200">
                  <img 
                    src={asset.image} 
                    alt={asset.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
                    }}
                  />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                    isOccupied ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {isOccupied ? '🏠 Occupied' : '⚠️ Vacant'}
                  </div>
                </div>
                
                <div className="p-3">
                  <h4 className="font-bold mb-1">{asset.name}</h4>
                  <div className="text-xs text-gray-600 mb-2">{asset.location}, {asset.district}</div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-600">MARKET VALUE</div>
                      <div className="font-bold text-sm">฿{(asset.price / 1000000).toFixed(1)}M</div>
                      <div className="text-xs text-green-600">
                        +{profitPercent.toFixed(1)}% Profit
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-600">PURCHASE PRICE</div>
                      <div className="font-bold text-sm">฿{(purchasePrice / 1000000).toFixed(1)}M</div>
                      <div className="text-xs text-gray-500">
                        {index === 0 ? 'Jan 2023' : index === 1 ? 'Oct 2021' : 'Mar 2022'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                    <div>
                      <div className="text-xs text-gray-600">RENTAL INCOME</div>
                      <div className="font-bold">฿{asset.averageRent.toLocaleString()}/mo</div>
                      <div className="text-xs text-gray-500">Yield: {asset.rentalYield}%</div>
                    </div>
                    <button className="px-3 py-1 bg-gray-900 text-white text-xs rounded font-medium hover:bg-gray-800 transition-colors">
                      View Details
                    </button>
                  </div>

                  {isOccupied && (
                    <div className="mt-2 text-xs text-gray-600">
                      LEASE ENDS: {index === 0 ? '4 months left' : '11 months left'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
