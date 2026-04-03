'use client'

import { useState } from 'react'
import { ArrowLeft, TrendingUp, AlertCircle } from 'lucide-react'
import React from 'react'

interface InvestmentLabProps {
  property: any
  userCriteria: any
  onGetVerdict: (data: any) => void
  onBack: () => void
}

export default function InvestmentLab({ property, userCriteria, onGetVerdict, onBack }: InvestmentLabProps) {
  const [downPayment, setDownPayment] = useState('')
  const [tenure, setTenure] = useState(30)
  const [loanData, setLoanData] = useState<any>(null)
  const [lastCalculatedDownPayment, setLastCalculatedDownPayment] = useState('')
  const [simulation, setSimulation] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  
  const [monthlyIncome, setMonthlyIncome] = useState(userCriteria?.income || 0)
  const [monthlyExpense, setMonthlyExpense] = useState(userCriteria?.expense || 0)

  const calculateLoan = async () => {
    const down = parseFloat(downPayment)
    if (!down || down <= 0 || isNaN(down)) {
      setLoanData(null)
      setSimulation(null)
      return
    }

    setCalculating(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: monthlyIncome,
          expense: monthlyExpense,
          down_payment: down,
          property_price: property.price,
          interest_rate: 4.2,
          tenure: tenure,
        })
      })
      
      const data = await response.json()
      setLoanData(data)
      setLastCalculatedDownPayment(downPayment)

      const simResponse = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          down_payment: down,
          interest_rate: 4.2,
          tenure: tenure,
          goal: 'rent',
          monthly_income: monthlyIncome,
          monthly_expense: monthlyExpense
        })
      })
      
      const simData = await simResponse.json()
      setSimulation(simData)
    } catch (error) {
      console.error('Error calculating loan:', error)
    } finally {
      setCalculating(false)
    }
  }

  const handleDownPaymentBlur = () => {
  }

  const handleDownPaymentKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      calculateLoan()
    }
  }


  const handleGetVerdict = async () => {
    if (!simulation) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/verdict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          simulation: simulation,
          user_profile: {
            income: monthlyIncome,
            expense: monthlyExpense,
            down_payment: parseFloat(downPayment)
          }
        })
      })
      
      const verdict = await response.json()
      onGetVerdict({
        ...simulation,
        verdict,
        downPayment: parseFloat(downPayment),
        dti: loanData?.dti ?? 0,
        income: monthlyIncome,
        expense: monthlyExpense,
      })
    } catch (error) {
      console.error('Error getting verdict:', error)
    } finally {
      setLoading(false)
    }
  }

  const minDownPayment = property.price * 0.1 // 10% minimum

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Investment Lab</h1>
        <p className="text-gray-600 text-sm">Precision simulation for your next sovereign move.</p>
      </div>

      {/* Loan Assessment */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Loan Assessment</h2>
          {loanData?.qualified && (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
              PASSED/QUALIFIED
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase mb-2 block">Monthly Income</label>
            <div className="relative">
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 rounded-xl p-4 pr-12 text-xl font-bold text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-500">฿</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase mb-2 block">Monthly Expenses</label>
            <div className="relative">
              <input
                type="number"
                value={monthlyExpense}
                onChange={(e) => setMonthlyExpense(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-50 rounded-xl p-4 pr-12 text-xl font-bold text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-500">฿</span>
            </div>
          </div>


          <div>
            <label className="text-xs text-gray-500 uppercase mb-2 block">Available Down Payment</label>
            <div className="relative">
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                onBlur={handleDownPaymentBlur}
                onKeyPress={handleDownPaymentKeyPress}
                placeholder={`Min ${minDownPayment.toLocaleString()}`}
                className="w-full bg-gray-50 rounded-xl p-4 pr-12 text-xl font-bold text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-500">฿</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Minimum 10% down payment required ({minDownPayment.toLocaleString()} ฿)
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase mb-2 block">Tenure (Years)</label>
            <div className="flex gap-2">
              <select
                value={tenure}
                onChange={(e) => setTenure(parseInt(e.target.value))}
                className="flex-1 bg-gray-50 rounded-xl p-4 text-xl font-bold text-gray-900 border-2 border-gray-200 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
              >
                <option value={5}>5 Years</option>
                <option value={10}>10 Years</option>
                <option value={15}>15 Years</option>
                <option value={20}>20 Years</option>
                <option value={25}>25 Years</option>
                <option value={30}>30 Years</option>
              </select>
              <button
                onClick={calculateLoan}
                disabled={!downPayment || parseFloat(downPayment) <= 0 || calculating}
                className="px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {calculating ? '...' : 'Calculate'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select loan tenure period
            </p>
          </div>

          {calculating && (
            <div className="flex items-center justify-center p-6">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Calculating...</span>
            </div>
          )}

          {loanData && !calculating && (
            <div key={`loan-${loanData.maxLoan}-${lastCalculatedDownPayment}-${loanData.dti}`} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
              <div className="relative w-64 h-40 mx-auto mb-4">
                {/* Semi-circle gauge */}
                <svg className="w-full h-full" viewBox="0 0 200 110">
                  {/* Background semi-circle */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  {/* Filled semi-circle based on DTI percentage */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={`${(() => {
                      const dtiPercent = (loanData.dti || 0) * 100
                      const fillAmount = (dtiPercent / 100) * 251.2
                      return fillAmount
                    })()} 251.2`}
                    style={{
                      animation: 'fillGauge 1.5s ease-out forwards'
                    }}
                  />
                  {/* Center text with fade-in animation */}
                  <text 
                    x="100" 
                    y="75" 
                    textAnchor="middle" 
                    className="text-4xl font-bold fill-blue-600"
                    style={{
                      animation: 'fadeIn 0.8s ease-out 0.5s both'
                    }}
                  >
                    {loanData.maxLoan ? `${(loanData.maxLoan / 1000000).toFixed(1)}M` : '0'}
                  </text>
                  <text 
                    x="100" 
                    y="95" 
                    textAnchor="middle" 
                    className="text-xs fill-gray-600 uppercase"
                    style={{
                      animation: 'fadeIn 0.8s ease-out 0.5s both'
                    }}
                  >
                    MAX LOAN AMOUNT
                  </text>
                </svg>
              </div>
              <p className="text-sm text-gray-600 animate-fadeIn">
                Based on your debt-to-income ratio of <span className="font-semibold">{loanData.dti ? (loanData.dti * 100).toFixed(1) : '0'}%</span>
              </p>
              
              <style jsx>{`
                @keyframes fillGauge {
                  from {
                    stroke-dasharray: 0 251.2;
                  }
                  to {
                    stroke-dasharray: ${(() => {
                      const dtiPercent = (loanData.dti || 0) * 100
                      const fillAmount = (dtiPercent / 100) * 251.2
                      return fillAmount
                    })()} 251.2;
                  }
                }
                
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                
                .animate-fadeIn {
                  animation: fadeIn 0.8s ease-out 0.5s both;
                }
              `}</style>
            </div>
          )}
        </div>
      </div>

      {/* Get AI Verdict Button */}
      {loanData && (
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6 mb-6 text-white">
          <p className="text-sm mb-2">Ready for a deeper dive?</p>
          <p className="text-xs text-blue-200 mb-4">
            Our AI analyzes over 45 variables to give you an institutional-grade verdict.
          </p>
          <button
            onClick={handleGetVerdict}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Get AI Verdict'}
          </button>
        </div>
      )}


      {/* Investment Simulation */}
      {simulation && (
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Investment Simulation</h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Property Price</span>
              <span className="font-bold text-gray-900">
                {(property.price / 1000000).toFixed(1)}M ฿
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Down Payment ({((parseFloat(downPayment) / property.price) * 100).toFixed(0)}%)</span>
              <span className="font-bold text-blue-600">
                {(parseFloat(downPayment) / 1000000).toFixed(2)}M ฿
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Interest Rate</span>
              <span className="font-bold text-gray-900">4.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Tenure (Years)</span>
              <span className="font-bold text-gray-900">{tenure} Years</span>            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
            <p className="text-xs text-gray-500 uppercase mb-2">Estimated Monthly Payment</p>
            <p className="text-4xl font-bold text-gray-900 mb-4">
              {(() => {
                const loanAmount = property.price - parseFloat(downPayment)
                const annualRate = 0.042
                const monthlyRate = annualRate / 12
                const numPayments = tenure * 12
                
                if (loanAmount <= 0) return '0'
                
                const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                                      (Math.pow(1 + monthlyRate, numPayments) - 1)
                
                return Math.round(monthlyPayment).toLocaleString()
              })()} ฿
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">ROI Estimate</p>
                <p className="text-emerald-600 font-bold text-lg">
                  {simulation.roi_estimate ? `${simulation.roi_estimate.toFixed(1)}%` : `${property.rentalYield?.toFixed(1) || '5.5'}%`}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Payback Period</p>
                <p className="text-gray-900 font-bold text-lg">
                  {(() => {
                    const rentalYield = property.rentalYield || 5.5
                    const downPaymentAmount = parseFloat(downPayment)
                    const annualReturn = (property.price * rentalYield) / 100
                    const paybackYears = Math.round(downPaymentAmount / annualReturn)
                    return simulation.payback_years || paybackYears
                  })()} Years
                </p>
              </div>
            </div>
          </div>

          {/* Market Sentiment */}
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Market Sentiment</p>
                <p className="text-xs text-gray-600">
                  {simulation.market_sentiment || `This property has a location score of ${property.locationScore || 75}/100 and liquidity score of ${property.liquidityScore || 75}/100.`}
                </p>
              </div>
            </div>
          </div>

          {/* Scenarios */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Conservative (4.5%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">
                  {(() => {
                    const loanAmount = property.price - parseFloat(downPayment)
                    const monthlyRate = 0.045 / 12
                    const numPayments = tenure * 12
                    const payment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                                   (Math.pow(1 + monthlyRate, numPayments) - 1)
                    return Math.round(payment).toLocaleString()
                  })()} ฿
                </span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Optimistic (3.8%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">
                  {(() => {
                    const loanAmount = property.price - parseFloat(downPayment)
                    const monthlyRate = 0.038 / 12
                    const numPayments = tenure * 12
                    const payment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                                   (Math.pow(1 + monthlyRate, numPayments) - 1)
                    return Math.round(payment).toLocaleString()
                  })()} ฿
                </span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Insights */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm font-semibold text-gray-900 mb-2">Property Insights</p>
            <p className="text-xs text-gray-600 mb-3">
              {(() => {
                const rentalYield = property.rentalYield || 5.5
                const capitalGain = property.capitalGainProjection?.year5 || 18
                const avgGrowth = (capitalGain / 5).toFixed(1)
                const netReturn = (rentalYield - 1.5).toFixed(1)
                return `Historical growth in this sector has averaged ${avgGrowth}% annually. With rental yield of ${rentalYield.toFixed(1)}%, your real return is projected at ${netReturn}% net of all costs.`
              })()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}