'use client'

import { Bell } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            S
          </div>
          <h1 className="text-lg font-semibold">Sansilerd AI</h1>
        </div>
        <button className="p-2">
          <Bell className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </header>
  )
}
