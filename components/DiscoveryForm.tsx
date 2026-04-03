'use client'

import { useState } from 'react'
import { TrendingUp, MapPin } from 'lucide-react'

interface DiscoveryFormProps {
  onSubmit: (criteria: any) => void
}

// All provinces where Sansiri operates — sorted A–Z
const PROVINCES = [
  { value: 'Bangkok', label: 'Bangkok' },
  { value: 'Chachoengsao', label: 'Chachoengsao' },
  { value: 'Chiang Mai', label: 'Chiang Mai' },
  { value: 'Chiang Rai', label: 'Chiang Rai' },
  { value: 'Chonburi', label: 'Chonburi' },
  { value: 'Khon Kaen', label: 'Khon Kaen' },
  { value: 'Nakhon Ratchasima', label: 'Nakhon Ratchasima' },
  { value: 'Nonthaburi', label: 'Nonthaburi' },
  { value: 'Pathum Thani', label: 'Pathum Thani' },
  { value: 'Phuket', label: 'Phuket' },
  { value: 'Prachuap Khiri Khan', label: 'Prachuap Khiri Khan (Hua Hin)' },
  { value: 'Rayong', label: 'Rayong' },
  { value: 'Samut Prakan', label: 'Samut Prakan' },
  { value: 'Samut Sakhon', label: 'Samut Sakhon' },
]

// Districts per province — sorted A–Z
const DISTRICTS_BY_PROVINCE: Record<string, { value: string; label: string }[]> = {
  Bangkok: [
    { value: 'Bang Kapi', label: 'Bang Kapi' },
    { value: 'Bang Kho Laem', label: 'Bang Kho Laem' },
    { value: 'Bang Na', label: 'Bang Na' },
    { value: 'Bang Rak', label: 'Bang Rak' },
    { value: 'Bang Sue', label: 'Bang Sue' },
    { value: 'Chatuchak', label: 'Chatuchak' },
    { value: 'Din Daeng', label: 'Din Daeng' },
    { value: 'Don Mueang', label: 'Don Mueang' },
    { value: 'Huai Khwang', label: 'Huai Khwang' },
    { value: 'Khlong San', label: 'Khlong San' },
    { value: 'Khlong Toei', label: 'Khlong Toei' },
    { value: 'Lat Krabang', label: 'Lat Krabang' },
    { value: 'Lat Phrao', label: 'Lat Phrao' },
    { value: 'Min Buri', label: 'Min Buri' },
    { value: 'Pathum Wan', label: 'Pathum Wan' },
    { value: 'Phaya Thai', label: 'Phaya Thai' },
    { value: 'Phra Khanong', label: 'Phra Khanong' },
    { value: 'Phra Nakhon', label: 'Phra Nakhon' },
    { value: 'Prawet', label: 'Prawet' },
    { value: 'Ratchathewi', label: 'Ratchathewi' },
    { value: 'Sathon', label: 'Sathon' },
    { value: 'Saphan Sung', label: 'Saphan Sung' },
    { value: 'Suan Luang', label: 'Suan Luang' },
    { value: 'Sukhumvit', label: 'Sukhumvit Area' },
    { value: 'Thawi Watthana', label: 'Thawi Watthana' },
    { value: 'Thon Buri', label: 'Thon Buri' },
    { value: 'Wang Thonglang', label: 'Wang Thonglang' },
    { value: 'Watthana', label: 'Watthana' },
    { value: 'Yan Nawa', label: 'Yan Nawa' },
  ],
  Chachoengsao: [
    { value: 'Bang Nam Priao', label: 'Bang Nam Priao' },
    { value: 'Bang Pakong', label: 'Bang Pakong' },
    { value: 'Mueang Chachoengsao', label: 'Mueang Chachoengsao' },
  ],
  'Chiang Mai': [
    { value: 'Hang Dong', label: 'Hang Dong' },
    { value: 'Mae Rim', label: 'Mae Rim' },
    { value: 'Mueang Chiang Mai', label: 'Mueang Chiang Mai' },
    { value: 'San Kamphaeng', label: 'San Kamphaeng' },
    { value: 'San Sai', label: 'San Sai' },
    { value: 'Saraphi', label: 'Saraphi' },
  ],
  'Chiang Rai': [
    { value: 'Mueang Chiang Rai', label: 'Mueang Chiang Rai' },
  ],
  Chonburi: [
    { value: 'Bang Lamung', label: 'Bang Lamung (Pattaya)' },
    { value: 'Mueang Chonburi', label: 'Mueang Chonburi' },
    { value: 'Phan Thong', label: 'Phan Thong' },
    { value: 'Si Racha', label: 'Si Racha' },
  ],
  'Khon Kaen': [
    { value: 'Mueang Khon Kaen', label: 'Mueang Khon Kaen' },
  ],
  'Nakhon Ratchasima': [
    { value: 'Mueang Nakhon Ratchasima', label: 'Mueang Nakhon Ratchasima' },
    { value: 'Pak Chong', label: 'Pak Chong' },
  ],
  Nonthaburi: [
    { value: 'Bang Bua Thong', label: 'Bang Bua Thong' },
    { value: 'Bang Kruai', label: 'Bang Kruai' },
    { value: 'Mueang Nonthaburi', label: 'Mueang Nonthaburi' },
    { value: 'Pak Kret', label: 'Pak Kret' },
  ],
  'Pathum Thani': [
    { value: 'Khlong Luang', label: 'Khlong Luang' },
    { value: 'Lam Luk Ka', label: 'Lam Luk Ka' },
    { value: 'Mueang Pathum Thani', label: 'Mueang Pathum Thani' },
    { value: 'Sam Khok', label: 'Sam Khok' },
    { value: 'Thanyaburi', label: 'Thanyaburi' },
  ],
  Phuket: [
    { value: 'Kathu', label: 'Kathu' },
    { value: 'Mueang Phuket', label: 'Mueang Phuket' },
    { value: 'Thalang', label: 'Thalang' },
  ],
  'Prachuap Khiri Khan': [
    { value: 'Hua Hin', label: 'Hua Hin' },
    { value: 'Mueang Prachuap Khiri Khan', label: 'Mueang Prachuap Khiri Khan' },
  ],
  Rayong: [
    { value: 'Ban Chang', label: 'Ban Chang' },
    { value: 'Mueang Rayong', label: 'Mueang Rayong' },
    { value: 'Pluak Daeng', label: 'Pluak Daeng' },
  ],
  'Samut Prakan': [
    { value: 'Bang Bo', label: 'Bang Bo' },
    { value: 'Bang Phli', label: 'Bang Phli' },
    { value: 'Mueang Samut Prakan', label: 'Mueang Samut Prakan' },
    { value: 'Phra Pradaeng', label: 'Phra Pradaeng' },
  ],
  'Samut Sakhon': [
    { value: 'Krathum Baen', label: 'Krathum Baen' },
    { value: 'Mueang Samut Sakhon', label: 'Mueang Samut Sakhon' },
  ],
}

export default function DiscoveryForm({ onSubmit }: DiscoveryFormProps) {
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [goal, setGoal] = useState<'rent' | 'flip'>('rent')
  const [province, setProvince] = useState('Bangkok')
  const [district, setDistrict] = useState('')
  const [income, setIncome] = useState('')
  const [expense, setExpense] = useState('')
  const [errors, setErrors] = useState<any>({})

  const districts = DISTRICTS_BY_PROVINCE[province] || []
  const requiresDistrict = districts.length > 0

  const validateForm = () => {
    const e: any = {}
    if (!budgetMin || parseFloat(budgetMin) <= 0) e.budgetMin = 'Please enter minimum budget'
    if (!budgetMax || parseFloat(budgetMax) <= 0) e.budgetMax = 'Please enter maximum budget'
    if (budgetMin && budgetMax && parseFloat(budgetMin) >= parseFloat(budgetMax)) e.budgetMax = 'Max budget must be greater than min'
    if (!income || parseFloat(income) <= 0) e.income = 'Please enter monthly income'
    if (!expense || parseFloat(expense) < 0) e.expense = 'Please enter monthly expense'
    if (income && expense && parseFloat(expense) >= parseFloat(income)) e.expense = 'Expense must be less than income'
    if (requiresDistrict && !district) e.district = 'Please select a district'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validateForm()) return
    const location = district ? `${district}, ${province}` : province
    onSubmit({
      budget_min: parseFloat(budgetMin),
      budget_max: parseFloat(budgetMax),
      goal,
      province,
      district,
      location,
      income: parseFloat(income),
      expense: parseFloat(expense),
    })
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="mb-6">
        <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm mb-4">
          INVESTMENT ENGINE V3.0
        </span>
        <h1 className="text-4xl font-bold mb-4">Start Your Investment Journey</h1>
        <p className="text-gray-600">
          Our AI-driven simulator analyzes market liquidity and asset yields to match your capital with institutional-grade opportunities.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-violet-700 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Predictive Modeling</h3>
              <p className="text-sm text-gray-600">Real-time simulation of rent vs. flip scenarios based on localized volatility.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 space-y-4">
          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              CAPITAL ALLOCATION (BUDGET) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input type="number" placeholder="Min (THB)" value={budgetMin}
                  onChange={e => setBudgetMin(e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${errors.budgetMin ? 'ring-2 ring-red-500' : 'focus:ring-violet-500'}`} />
                {errors.budgetMin && <p className="text-xs text-red-500 mt-1">{errors.budgetMin}</p>}
              </div>
              <div>
                <input type="number" placeholder="Max (THB)" value={budgetMax}
                  onChange={e => setBudgetMax(e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${errors.budgetMax ? 'ring-2 ring-red-500' : 'focus:ring-violet-500'}`} />
                {errors.budgetMax && <p className="text-xs text-red-500 mt-1">{errors.budgetMax}</p>}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Example: 1,000,000 – 5,000,000</p>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              INVESTMENT GOAL <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setGoal('rent')}
                className={`px-4 py-3 rounded-lg font-medium transition ${goal === 'rent' ? 'bg-violet-700 text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                🏠 Rent
              </button>
              <button type="button" onClick={() => setGoal('flip')}
                className={`px-4 py-3 rounded-lg font-medium transition ${goal === 'flip' ? 'bg-violet-700 text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                💰 Flip
              </button>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              PREFERRED LOCATION <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <select
                value={province}
                onChange={e => { setProvince(e.target.value); setDistrict('') }}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer">
                {PROVINCES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>

              {requiresDistrict && (
                <div>
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 appearance-none cursor-pointer ${errors.district ? 'ring-2 ring-red-500' : 'focus:ring-violet-500'}`}>
                    <option value="">-- Select District --</option>
                    {districts.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>All provinces where Sansiri operates</span>
            </div>
          </div>

          {/* Income / Expense */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                MONTHLY INCOME <span className="text-red-500">*</span>
              </label>
              <input type="number" placeholder="THB" value={income}
                onChange={e => setIncome(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${errors.income ? 'ring-2 ring-red-500' : 'focus:ring-violet-500'}`} />
              {errors.income && <p className="text-xs text-red-500 mt-1">{errors.income}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                MONTHLY EXPENSE <span className="text-red-500">*</span>
              </label>
              <input type="number" placeholder="THB" value={expense}
                onChange={e => setExpense(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${errors.expense ? 'ring-2 ring-red-500' : 'focus:ring-violet-500'}`} />
              {errors.expense && <p className="text-xs text-red-500 mt-1">{errors.expense}</p>}
            </div>
          </div>
        </div>

        <button type="submit"
          className="w-full bg-gradient-to-r from-violet-700 to-lime-500 text-white py-4 rounded-xl font-semibold hover:from-violet-800 hover:to-lime-600 transition flex items-center justify-center gap-2 shadow-lg">
          🔍 Find My Match →
        </button>
      </form>
    </div>
  )
}
