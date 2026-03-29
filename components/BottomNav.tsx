'use client'

import { Home, TrendingUp, Briefcase, Bell } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { id: 'discover', label: 'DISCOVER', icon: Home, path: '/' },
    { id: 'simulator', label: 'SIMULATOR', icon: TrendingUp, path: '/simulator' },
    { id: 'portfolio', label: 'PORTFOLIO', icon: Briefcase, path: '/portfolio' },
    { id: 'alerts', label: 'ALERTS', icon: Bell, path: '/alerts' },
  ]

  const getCurrentView = () => {
    if (pathname === '/') return 'discover'
    if (pathname.startsWith('/simulator')) return 'simulator'
    if (pathname === '/portfolio') return 'portfolio'
    if (pathname === '/alerts') return 'alerts'
    return 'discover'
  }

  const currentView = getCurrentView()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
