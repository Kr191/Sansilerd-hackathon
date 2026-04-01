'use client'

import { useState } from 'react'
import { ArrowLeft, CheckCircle2, TrendingUp, AlertTriangle, Download, BookmarkPlus } from 'lucide-react'

interface AIVerdictProps {
  property: any
  investmentData: any
  verdictData: any
  onBack: () => void
}

export default function AIVerdict({ property, investmentData, verdictData, onBack }: AIVerdictProps) {
  // Mock verdict data if not provided
  const verdict = verdictData || {
    decision: 'recommended',
    confidence: 85,
    roi: 8.4,
    monthlyPayment: 24500,
    riskLevel: 'low',
    reasons: [
      'ROI สูงกว่าค่าเฉลี่ยตลาด 1.5%',
      'เหมาะกับงบประมาณ',
      'ทำเลดีมีศักยภาพเติบโต',
      'คุณครอบคลุม 100%'
    ]
  }

  const isRecommended = verdict.decision === 'recommended'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* AI Verdict Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-8 mb-6 shadow-lg border-2 border-emerald-100">
        <p className="text-xs text-gray-500 uppercase mb-2">Investment Analysis</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">The AI Verdict</h1>

        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full mb-4">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold text-sm">Recommended</span>
          </div>
          
          <p className="text-gray-900 text-lg leading-relaxed">
            <span className="font-bold">ROI สูงกว่าค่าเฉลี่ยตลาด 1.5%</span> เหมาะกับงบประมาณ
            <br />
            ทำเลดีมีศักยภาพเติบโต วงเงินกู้ของ
            <br />
            คุณครอบคลุม <span className="font-bold">100%</span>
          </p>
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold text-lg transition-colors">
          Proceed to Purchase
        </button>
      </div>


      {/* Investment Metrics */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <p className="text-xs text-gray-500 uppercase mb-4">Investment Metrics</p>
        
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-3xl font-bold text-emerald-600">{verdict.roi}%</p>
            <span className="text-sm text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +1.5% vs Market
            </span>
          </div>
          <p className="text-sm text-gray-600">Expected ROI</p>
        </div>

        <div className="mb-6">
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {verdict.monthlyPayment.toLocaleString()} บาท
          </p>
          <p className="text-sm text-gray-600">Monthly Payment</p>
        </div>

        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
          <span className="text-sm text-gray-700">Risk Level</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-600 capitalize">{verdict.riskLevel}</span>
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 5-Year Cashflow Projection */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-900">5-YEAR CASHFLOW PROJECTION</p>
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-gray-600">RENT</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-gray-600">EXPENSES</span>
            </div>
          </div>
        </div>

        {/* Interactive Bar Chart with Line */}
        <div className="h-48 relative mb-2">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-400 pr-2 w-12">
            <span>30K</span>
            <span>20K</span>
            <span>10K</span>
            <span>0</span>
          </div>
          
          {/* Chart area */}
          <div className="absolute left-12 right-0 top-0 bottom-8">
            <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
              
              {/* Rent line (blue) - แสดงเสมอ */}
              <path
                d="M 50 96 L 150 90 L 250 84 L 350 76 L 450 68"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Rent data points */}
              <circle cx="50" cy="96" r="4" fill="#3b82f6" />
              <circle cx="150" cy="90" r="4" fill="#3b82f6" />
              <circle cx="250" cy="84" r="4" fill="#3b82f6" />
              <circle cx="350" cy="76" r="4" fill="#3b82f6" />
              <circle cx="450" cy="68" r="4" fill="#3b82f6" />
              
              {/* Expense line (red) - แสดงเสมอ */}
              <path
                d="M 50 133 L 150 129 L 250 125 L 350 121 L 450 117"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Expense data points */}
              <circle cx="50" cy="133" r="4" fill="#ef4444" />
              <circle cx="150" cy="129" r="4" fill="#ef4444" />
              <circle cx="250" cy="125" r="4" fill="#ef4444" />
              <circle cx="350" cy="121" r="4" fill="#ef4444" />
              <circle cx="450" cy="117" r="4" fill="#ef4444" />
            </svg>
            
            {/* Interactive hover areas */}
            <div className="absolute inset-0 flex items-end justify-around gap-2">
              {[
                { year: 1, rent: 18000, expense: 8000 },
                { year: 2, rent: 19500, expense: 8500 },
                { year: 3, rent: 21000, expense: 9000 },
                { year: 4, rent: 22800, expense: 9500 },
                { year: 5, rent: 24500, expense: 10000 }
              ].map((data) => {
                const maxValue = 30000
                const rentHeight = (data.rent / maxValue) * 100
                
                return (
                  <div key={data.year} className="flex-1 flex flex-col items-center gap-1 relative">
                    {/* Invisible hover area */}
                    <div 
                      className="w-full absolute bottom-0 cursor-pointer group" 
                      style={{ height: `${rentHeight}%` }}
                    >
                      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-lg">
                        <div className="font-semibold mb-1">Year {data.year}</div>
                        <div className="text-blue-300">Rent: {data.rent.toLocaleString()} บาท</div>
                        <div className="text-red-300">Expense: {data.expense.toLocaleString()} บาท</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        <div className="flex justify-around text-xs text-gray-400 px-1 ml-12">
          <span>Y1</span>
          <span>Y2</span>
          <span>Y3</span>
          <span>Y4</span>
          <span>Y5</span>
        </div>
        
        {/* Summary */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-gray-600">
              รายได้จากค่าเช่าเพิ่มขึ้นเฉลี่ย <span className="font-semibold text-blue-600">8.5%</span> ต่อปี
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl">
            <p className="text-xs text-gray-600">
              ค่าใช้จ่ายเพิ่มขึ้นเฉลี่ย <span className="font-semibold text-red-600">5.7%</span> ต่อปี
            </p>
          </div>
        </div>
      </div>

      {/* Exit Strategy & Wealth Alert */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 mb-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-1">EXIT STRATEGY & WEALTH ALERT</p>
            <p className="text-sm text-gray-700 mb-3">
              <span className="font-semibold">Target Selling Profit: +20% reached!</span>
              <br />
              <span className="text-xs text-gray-600">(Alert active - Market Liquidity High)</span>
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="flex-1 bg-white text-gray-700 py-2 px-4 rounded-xl text-sm font-semibold border border-gray-200">
            Modify Strategy
          </button>
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-xl text-sm font-semibold">
            Review Market
          </button>
        </div>
      </div>


      {/* Recommended Next Range */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <p className="text-xs text-gray-500 uppercase mb-4">Recommended Next Range</p>
        
        <div className="relative mb-6">
          <div className="w-48 h-48 mx-auto">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="16"
              />
              {/* Progress circle */}
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="none"
                stroke="#10b981"
                strokeWidth="16"
                strokeDasharray="502.65"
                strokeDashoffset="125.66"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold text-emerald-600">
                {property.averageRent ? `${(property.averageRent / 1000).toFixed(1)}K` : '16.5K'}
              </p>
              <p className="text-xs text-gray-500 mt-1">บาท</p>
              <p className="text-xs text-gray-500">RECOMMENDED RENT</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Min Range</p>
            <p className="text-lg font-bold text-gray-900">
              {property.averageRent ? (property.averageRent * 0.85).toLocaleString() : '14,000'} บาท
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Max Range</p>
            <p className="text-lg font-bold text-gray-900">
              {property.averageRent ? (property.averageRent * 1.15).toLocaleString() : '19,000'} บาท
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600">
          Optimized for <span className="font-semibold text-emerald-600">{property.occupancyRate || 95}% Occupancy Rate</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button className="w-full bg-white border-2 border-gray-200 text-gray-900 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
          <BookmarkPlus className="w-5 h-5" />
          Add to Portfolio
        </button>

        <button className="w-full bg-white border-2 border-gray-200 text-gray-900 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
          <Download className="w-5 h-5" />
          Download Analysis PDF
        </button>
      </div>
    </div>
  )
}
