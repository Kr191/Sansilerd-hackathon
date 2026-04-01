'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { TrendingUp, AlertTriangle, Bell, DollarSign, Home } from 'lucide-react'
import { Property } from '@/lib/sansiriData'

export default function AlertsPage() {
  const [mockAlerts, setMockAlerts] = useState<any[]>([])

  useEffect(() => {
    // Fetch live properties, then use them for demo alerts
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => {
        const all: Property[] = data.projects || []
        if (all.length < 4) return

        const mid = Math.floor(all.length / 2)
        const alerts = [
          {
            id: 1,
            type: 'selling',
            property: all[1],
            title: 'Target Profit Reached',
            message: 'Your property has reached +15% profit target. Market conditions are optimal for selling.',
            priority: 'high',
            date: '2 hours ago',
            action: 'Sell Now'
          },
          {
            id: 2,
            type: 'rental',
            property: all[mid],
            title: 'Lease Expiring Soon',
            message: 'Current lease expires in 30 days. Recommended rent increase: +8%',
            priority: 'medium',
            date: '1 day ago',
            action: 'Review Terms'
          },
          {
            id: 3,
            type: 'market',
            property: all[0],
            title: 'Market Opportunity',
            message: 'Similar properties in area increased by 12%. Consider price adjustment.',
            priority: 'low',
            date: '3 days ago',
            action: 'View Analysis'
          },
          {
            id: 4,
            type: 'maintenance',
            property: all[mid + 1] || all[2],
            title: 'Maintenance Due',
            message: 'Annual property inspection recommended. Schedule within 14 days.',
            priority: 'medium',
            date: '5 days ago',
            action: 'Schedule'
          }
        ]
        setMockAlerts(alerts)
      })
      .catch(() => setMockAlerts([]))
  }, [])


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'selling': return <TrendingUp className="w-5 h-5" />
      case 'rental': return <Home className="w-5 h-5" />
      case 'market': return <DollarSign className="w-5 h-5" />
      case 'maintenance': return <AlertTriangle className="w-5 h-5" />
      default: return <Bell className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pb-20">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Smart Alerts</h1>
            <p className="text-gray-600 text-sm">AI-powered notifications for your portfolio</p>
          </div>

          {/* Alert Summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-xs text-gray-600 mt-1">High Priority</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">2</div>
              <div className="text-xs text-gray-600 mt-1">Medium</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600">1</div>
              <div className="text-xs text-gray-600 mt-1">Low Priority</div>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {mockAlerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-xl overflow-hidden shadow-sm border-l-4 border-l-blue-600">
                {/* Property Image */}
                <div className="relative h-32">
                  <img 
                    src={alert.property.image} 
                    alt={alert.property.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
                    }}
                  />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold border ${getPriorityColor(alert.priority)}`}>
                    {alert.priority.toUpperCase()}
                  </div>
                </div>

                {/* Alert Content */}
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{alert.title}</h3>
                      <p className="text-sm text-gray-600 mb-1">{alert.property.name}</p>
                      <p className="text-xs text-gray-500">{alert.property.location}, {alert.property.district}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">{alert.message}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{alert.date}</span>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                      {alert.action}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No More Alerts */}
          <div className="mt-6 text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">You're all caught up!</p>
            <p className="text-gray-400 text-xs mt-1">No more alerts at this time</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
