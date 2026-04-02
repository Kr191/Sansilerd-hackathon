'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import AmortizationTable from './AmortizationTable'
import BreakEvenCalculator from './BreakEvenCalculator'
import TaxCalculator from './TaxCalculator'
import ScenarioStressTest from './ScenarioStressTest'
import VacancyRiskScore from './VacancyRiskScore'
import ComparableSales from './ComparableSales'

interface FinancialAnalysisProps {
  property: any
}

export default function FinancialAnalysis({ property }: FinancialAnalysisProps) {
  const [income, setIncome] = useState('50000')
  const [expense, setExpense] = useState('15000')
  const [downPayment, setDownPayment] = useState(property?.price ? String(property.price * 0.3) : '500000')
  const [interestRate, setInterestRate] = useState('6.5')
  const [tenure, setTenure] = useState('20')
  const [goal, setGoal] = useState<'rent' | 'flip'>('rent')
  
  const [loanAssessment, setLoanAssessment] = useState<any>(null)
  const [simulation, setSimulation] = useState<any>(null)
  const [verdict, setVerdict] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Fetch loan assessment
  const fetchLoanAssessment = async () => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: parseFloat(income),
          expense: parseFloat(expense),
          down_payment: parseFloat(downPayment)
        })
      })
      const data = await response.json()
      setLoanAssessment(data)
    } catch (error) {
      console.error('Error fetching loan assessment:', error)
    }
  }

  // Fetch investment simulation
  const fetchSimulation = async () => {
    if (!property) return
    
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          price: property.price,
          downPayment: parseFloat(downPayment),
          interestRate: parseFloat(interestRate),
          tenure: parseInt(tenure),
          goal
        })
      })
      const data = await response.json()
      setSimulation(data)
    } catch (error) {
      console.error('Error fetching simulation:', error)
    }
  }

  // Fetch AI verdict
  const fetchVerdict = async () => {
    if (!property || !simulation || !loanAssessment) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/verdict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          simulation,
          loanAssessment,
          criteria: { goal, budget_max: property.price }
        })
      })
      const data = await response.json()
      setVerdict(data)
    } catch (error) {
      console.error('Error fetching verdict:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLoanAssessment()
    fetchSimulation()
  }, [income, expense, downPayment, interestRate, tenure, goal])

  if (!property) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please select a property before running the analysis.</p>
        </div>
      </div>
    )
  }

  const trendData = property.capitalGainProjection ? [
    { year: '2024', value: 100 },
    { year: '2025', value: 100 + (property.capitalGainProjection.year3 / 3) },
    { year: '2026', value: 100 + (property.capitalGainProjection.year3 / 3) * 2 },
    { year: '2027', value: 100 + property.capitalGainProjection.year3 },
    { year: '2029', value: 100 + property.capitalGainProjection.year5 },
    { year: '2034', value: 100 + property.capitalGainProjection.year10 },
  ] : []

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Investment Lab</h1>
        <p className="text-gray-600 text-sm">Precision simulator for your next investing move.</p>
        
        {/* Property Summary */}
        <div className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-4">
          <div className="text-sm opacity-90 mb-1">ANALYZING</div>
          <div className="font-bold text-lg">{property.name}</div>
          <div className="text-sm opacity-90">{property.location}</div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{(property.price / 1000000).toFixed(2)}M THB</div>
              <div className="text-xs opacity-90">{property.size} sqm • {property.bedrooms} bed</div>
            </div>
            {property.nearBTS && (
              <div className="bg-white/20 px-3 py-1 rounded-full text-xs">
                🚇 {property.nearBTS}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Goal Selection */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">INVESTMENT GOAL</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setGoal('rent')}
            className={`px-4 py-3 rounded-lg font-medium transition ${
              goal === 'rent' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            🏠 Rent
          </button>
          <button
            onClick={() => setGoal('flip')}
            className={`px-4 py-3 rounded-lg font-medium transition ${
              goal === 'flip' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            💰 Flip
          </button>
        </div>
      </div>

      {/* Loan Assessment */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Loan Assessment</h3>
          {loanAssessment && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              loanAssessment.status === 'passed' ? 'bg-green-100 text-green-700' : 
              loanAssessment.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {loanAssessment.status === 'passed' ? '✓ Pre-Qualified' : 
               loanAssessment.status === 'warning' ? '⚠ Review Needed' :
               '✗ Not Qualified'}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">MONTHLY INCOME (THB)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">MONTHLY EXPENSES (THB)</label>
            <input
              type="number"
              value={expense}
              onChange={(e) => setExpense(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">DOWN PAYMENT (THB)</label>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:border-blue-500 focus:outline-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              Recommended: {((property.price * 0.3) / 1000).toFixed(0)}K ({((property.price * 0.3 / property.price) * 100).toFixed(0)}%)
            </div>
          </div>
        </div>

        {loanAssessment && (
          <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  fill="none" 
                  stroke={loanAssessment.status === 'passed' ? '#3b82f6' : '#f59e0b'}
                  strokeWidth="8"
                  strokeDasharray={`${Math.min((loanAssessment.maxLoan / property.price) * 251, 251)} 251`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-bold">{(loanAssessment.maxLoan / 1000000).toFixed(1)}M</div>
                <div className="text-xs text-gray-600">Max Loan</div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-700 mb-2">
              {loanAssessment.recommendation}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded">
                <div className="text-gray-600">DTI Ratio</div>
                <div className="font-bold">{(loanAssessment.dti * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-gray-600">Monthly Capacity</div>
                <div className="font-bold">{(loanAssessment.monthlyCapacity / 1000).toFixed(0)}K</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Investment Simulation */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <h3 className="font-bold mb-3">Investment Simulation</h3>
        
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">INTEREST RATE (%)</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">TENURE (YEARS)</label>
              <input
                type="number"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {simulation && (
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {simulation.monthlyPayment.toLocaleString()} ฿
              </div>
              <div className="text-sm text-gray-600">Monthly Payment</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white p-3 rounded-lg">
                <div className="text-xs text-gray-600">Est. ROI</div>
                <div className="text-xl font-bold text-green-600">{simulation.roi}%</div>
                <div className="text-xs text-gray-500">per year</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-xs text-gray-600">Payback Period</div>
                <div className="text-xl font-bold">{simulation.paybackPeriod}</div>
                <div className="text-xs text-gray-500">years</div>
              </div>
            </div>

            {goal === 'rent' && simulation.netMonthlyCashFlow !== undefined && (
              <div className={`p-3 rounded-lg ${
                simulation.netMonthlyCashFlow > 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <div className="text-xs text-gray-700 mb-1">Net Monthly Cash Flow</div>
                <div className={`text-lg font-bold ${
                  simulation.netMonthlyCashFlow > 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {simulation.netMonthlyCashFlow > 0 ? '+' : ''}{simulation.netMonthlyCashFlow.toLocaleString()} ฿
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Monthly Rent: {simulation.monthlyRent?.toLocaleString()} ฿
                </div>
              </div>
            )}

            {goal === 'flip' && simulation.projectedProfit !== undefined && (
              <div className="bg-purple-100 p-3 rounded-lg">
                <div className="text-xs text-gray-700 mb-1">Projected Profit (5 years)</div>
                <div className="text-lg font-bold text-purple-700">
                  +{(simulation.projectedProfit / 1000000).toFixed(2)}M ฿
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location Trend */}
      {trendData.length > 0 && (
        <div className="bg-white rounded-xl p-4 mb-4">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Location Trend Analytics
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Capital gain projection based on market analysis
          </p>
          
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center text-sm">
            <div className="bg-green-50 p-2 rounded border border-green-200">
              <div className="text-green-600 font-bold">+{property.capitalGainProjection.year3}%</div>
              <div className="text-xs text-gray-600">3-Year</div>
            </div>
            <div className="bg-green-50 p-2 rounded border border-green-200">
              <div className="text-green-600 font-bold">+{property.capitalGainProjection.year5}%</div>
              <div className="text-xs text-gray-600">5-Year</div>
            </div>
            <div className="bg-green-50 p-2 rounded border border-green-200">
              <div className="text-green-600 font-bold">+{property.capitalGainProjection.year10}%</div>
              <div className="text-xs text-gray-600">10-Year</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Verdict Button */}
      {!verdict ? (
        <button
          onClick={fetchVerdict}
          disabled={loading || !simulation || !loanAssessment}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing...
            </>
          ) : (
            <>🤖 Get AI Verdict</>
          )}
        </button>
      ) : (
        <div className={`rounded-xl p-6 border-2 ${
          verdict.decision === 'recommended' ? 'bg-gradient-to-br from-green-50 to-blue-50 border-green-200' :
          verdict.decision === 'consider' ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' :
          'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
        }`}>
          <div className="text-center mb-4">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-4xl bg-white shadow-lg">
              {verdict.decision === 'recommended' ? '✅' :
               verdict.decision === 'consider' ? '⚠️' :
               '❌'}
            </div>
            <h3 className="text-2xl font-bold mb-2">The AI Verdict</h3>
            <div className={`inline-block px-6 py-2 rounded-full font-bold text-white mb-3 ${
              verdict.decision === 'recommended' ? 'bg-green-500' :
              verdict.decision === 'consider' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}>
              {verdict.decision === 'recommended' ? '✅ Recommended' :
               verdict.decision === 'consider' ? '⚠️ Consider Carefully' :
               '❌ Not Recommended'}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Confidence: {verdict.confidence}%
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="font-semibold mb-2 text-gray-800">AI Analysis</div>
            <p className="text-sm text-gray-700 mb-3">{verdict.aiInsight}</p>
            
            <div className="text-sm font-semibold text-gray-700 mb-2">{verdict.summary}</div>
          </div>

          {verdict.pros.length > 0 && (
            <div className="bg-white rounded-lg p-4 mb-3">
              <div className="font-semibold mb-2 text-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Pros
              </div>
              <ul className="space-y-1">
                {verdict.pros.map((pro: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {verdict.cons.length > 0 && (
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="font-semibold mb-2 text-red-700 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Cons
              </div>
              <ul className="space-y-1">
                {verdict.cons.map((con: string, i: number) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setVerdict(null)}
              className="flex-1 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Recalculate
            </button>
            {verdict.decision === 'recommended' && (
              <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                Proceed to Purchase
              </button>
            )}
          </div>
        </div>
      )}

      {/* Advanced Tools */}
      {simulation && (
        <div className="space-y-4 mt-4">
          <VacancyRiskScore property={property} />

          <ComparableSales property={property} />

          <ScenarioStressTest
            property={property}
            baseMonthlyPayment={simulation.monthlyPayment}
            baseInterestRate={parseFloat(interestRate)}
            baseOccupancy={property.occupancyRate || 85}
            monthlyRent={simulation.monthlyRent || property.averageRent}
          />

          <AmortizationTable
            loanAmount={property.price - parseFloat(downPayment)}
            annualRate={parseFloat(interestRate)}
            tenureYears={parseInt(tenure)}
          />

          <BreakEvenCalculator
            propertyPrice={property.price}
            downPayment={parseFloat(downPayment)}
            monthlyPayment={simulation.monthlyPayment}
            monthlyRent={simulation.monthlyRent || property.averageRent}
            goal={goal}
            capitalGain5={property.capitalGainProjection?.year5 || 18}
            capitalGain10={property.capitalGainProjection?.year10 || 40}
          />

          <TaxCalculator
            propertyPrice={property.price}
            purchasePrice={property.price}
          />
        </div>
      )}
    </div>
  )
}
