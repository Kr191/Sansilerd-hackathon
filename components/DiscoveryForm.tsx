'use client'

import { useState } from 'react'
import { TrendingUp, MapPin } from 'lucide-react'

interface DiscoveryFormProps {
  onSubmit: (criteria: any) => void
}

// Available locations from Sansiri properties
const PROVINCES = [
  { value: 'Bangkok', label: 'Bangkok' },
  { value: 'Pathum Thani', label: 'Pathum Thani' },
  { value: 'Chonburi', label: 'Chonburi' },
  { value: 'Samut Prakan', label: 'Samut Prakan' }
]

const BANGKOK_DISTRICTS = [
  { value: 'Phra Khanong', label: 'Phra Khanong (พระโขนง)' },
  { value: 'Watthana', label: 'Watthana (วัฒนา)' },
  { value: 'Ratchathewi', label: 'Ratchathewi (ราชเทวี)' },
  { value: 'Phaya Thai', label: 'Phaya Thai (พญาไท)' },
  { value: 'Khlong Toei', label: 'Khlong Toei (คลองเตย)' },
  { value: 'Pathum Wan', label: 'Pathum Wan (ปทุมวัน)' },
  { value: 'Bang Rak', label: 'Bang Rak (บางรัก)' },
  { value: 'Sathon', label: 'Sathon (สาทร)' },
  { value: 'Yan Nawa', label: 'Yan Nawa (ยานนาวา)' },
  { value: 'Bang Kho Laem', label: 'Bang Kho Laem (บางคอแหลม)' },
  { value: 'Phra Nakhon', label: 'Phra Nakhon (พระนคร)' },
  { value: 'Dusit', label: 'Dusit (ดุสิต)' },
  { value: 'Bang Sue', label: 'Bang Sue (บางซื่อ)' },
  { value: 'Chatuchak', label: 'Chatuchak (จตุจักร)' },
  { value: 'Bang Kapi', label: 'Bang Kapi (บางกะปิ)' },
  { value: 'Huai Khwang', label: 'Huai Khwang (ห้วยขวาง)' },
  { value: 'Din Daeng', label: 'Din Daeng (ดินแดง)' },
  { value: 'Phasi Charoen', label: 'Phasi Charoen (ภาษีเจริญ)' },
  { value: 'Bangkok Yai', label: 'Bangkok Yai (บางกอกใหญ่)' },
  { value: 'Bangkok Noi', label: 'Bangkok Noi (บางกอกน้อย)' },
  { value: 'Thon Buri', label: 'Thon Buri (ธนบุรี)' },
  { value: 'Khlong San', label: 'Khlong San (คลองสาน)' },
  { value: 'Taling Chan', label: 'Taling Chan (ตลิ่งชัน)' },
  { value: 'Bang Phlat', label: 'Bang Phlat (บางพลัด)' },
  { value: 'Bang Khae', label: 'Bang Khae (บางแค)' },
  { value: 'Nong Khaem', label: 'Nong Khaem (หนองแขม)' },
  { value: 'Rat Burana', label: 'Rat Burana (ราษฎร์บูรณะ)' },
  { value: 'Bang Bon', label: 'Bang Bon (บางบอน)' },
  { value: 'Thung Khru', label: 'Thung Khru (ทุ่งครุ)' },
  { value: 'Chom Thong', label: 'Chom Thong (จอมทอง)' },
  { value: 'Don Mueang', label: 'Don Mueang (ดอนเมือง)' },
  { value: 'Lak Si', label: 'Lak Si (หลักสี่)' },
  { value: 'Sai Mai', label: 'Sai Mai (สายไหม)' },
  { value: 'Khan Na Yao', label: 'Khan Na Yao (คันนายาว)' },
  { value: 'Saphan Sung', label: 'Saphan Sung (สะพานสูง)' },
  { value: 'Wang Thonglang', label: 'Wang Thonglang (วังทองหลาง)' },
  { value: 'Khlong Sam Wa', label: 'Khlong Sam Wa (คลองสามวา)' },
  { value: 'Bang Na', label: 'Bang Na (บางนา)' },
  { value: 'Prawet', label: 'Prawet (ประเวศ)' },
  { value: 'Suan Luang', label: 'Suan Luang (สวนหลวง)' },
  { value: 'Bueng Kum', label: 'Bueng Kum (บึงกุ่ม)' },
  { value: 'Lat Krabang', label: 'Lat Krabang (ลาดกระบัง)' },
  { value: 'Min Buri', label: 'Min Buri (มีนบุรี)' },
  { value: 'Lat Phrao', label: 'Lat Phrao (ลาดพร้าว)' },
  { value: 'Bang Khun Thian', label: 'Bang Khun Thian (บางขุนเทียน)' },
  { value: 'Nong Chok', label: 'Nong Chok (หนองจอก)' },
  { value: 'Thawi Watthana', label: 'Thawi Watthana (ทวีวัฒนา)' },
  { value: 'Bang Khen', label: 'Bang Khen (บางเขน)' },
  { value: 'Vadhana', label: 'Vadhana (วัฒนา)' },
  { value: 'Sukhumvit', label: 'Sukhumvit Area (สุขุมวิท)' }
]

export default function DiscoveryForm({ onSubmit }: DiscoveryFormProps) {
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [goal, setGoal] = useState<'rent' | 'flip'>('rent')
  const [province, setProvince] = useState('Bangkok')
  const [district, setDistrict] = useState('')
  const [income, setIncome] = useState('')
  const [expense, setExpense] = useState('')
  const [errors, setErrors] = useState<any>({})

  const validateForm = () => {
    const newErrors: any = {}

    if (!budgetMin || parseFloat(budgetMin) <= 0) {
      newErrors.budgetMin = 'กรุณากรอกงบประมาณขั้นต่ำ'
    }
    if (!budgetMax || parseFloat(budgetMax) <= 0) {
      newErrors.budgetMax = 'กรุณากรอกงบประมาณสูงสุด'
    }
    if (budgetMin && budgetMax && parseFloat(budgetMin) >= parseFloat(budgetMax)) {
      newErrors.budgetMax = 'งบสูงสุดต้องมากกว่างบขั้นต่ำ'
    }
    if (!income || parseFloat(income) <= 0) {
      newErrors.income = 'กรุณากรอกรายได้ต่อเดือน'
    }
    if (!expense || parseFloat(expense) < 0) {
      newErrors.expense = 'กรุณากรอกค่าใช้จ่ายต่อเดือน'
    }
    if (income && expense && parseFloat(expense) >= parseFloat(income)) {
      newErrors.expense = 'ค่าใช้จ่ายต้องน้อยกว่ารายได้'
    }
    if (province === 'Bangkok' && !district) {
      newErrors.district = 'กรุณาเลือกเขตใน Bangkok'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const location = province === 'Bangkok' && district 
      ? `${district}, Bangkok` 
      : province

    onSubmit({
      budget_min: parseFloat(budgetMin),
      budget_max: parseFloat(budgetMax),
      goal,
      province,
      district: province === 'Bangkok' ? district : '',
      location,
      income: parseFloat(income),
      expense: parseFloat(expense)
    })
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="mb-6">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm mb-4">
          INVESTMENT ENGINE V3.0
        </span>
        <h1 className="text-4xl font-bold mb-4">Start Your Investment Journey</h1>
        <p className="text-gray-600">
          Our AI-driven simulator analyzes market liquidity and asset yields to match your capital with institutional-grade opportunities.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg p-4 space-y-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Predictive Modeling</h3>
              <p className="text-sm text-gray-600">Real-time simulation of rent vs. flip scenarios based on localized volatility.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              CAPITAL ALLOCATION (BUDGET) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Min (THB)"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.budgetMin ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.budgetMin && (
                  <p className="text-xs text-red-500 mt-1">{errors.budgetMin}</p>
                )}
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max (THB)"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${
                    errors.budgetMax ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.budgetMax && (
                  <p className="text-xs text-red-500 mt-1">{errors.budgetMax}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">ตัวอย่าง: 1,000,000 - 5,000,000</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              INVESTMENT GOAL <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGoal('rent')}
                className={`px-4 py-3 rounded-lg font-medium transition ${
                  goal === 'rent' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                🏠 Rent
              </button>
              <button
                type="button"
                onClick={() => setGoal('flip')}
                className={`px-4 py-3 rounded-lg font-medium transition ${
                  goal === 'flip' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                💰 Flip
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              PREFERRED LOCATION <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div>
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value)
                    if (e.target.value !== 'Bangkok') {
                      setDistrict('')
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  required
                >
                  {PROVINCES.map(prov => (
                    <option key={prov.value} value={prov.value}>
                      {prov.label}
                    </option>
                  ))}
                </select>
              </div>

              {province === 'Bangkok' && (
                <div className="overflow-hidden transition-all duration-300 ease-in-out">
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${
                      errors.district ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                    } appearance-none cursor-pointer animate-slideDown`}
                    required
                  >
                    <option value="">-- เลือกเขต --</option>
                    {BANGKOK_DISTRICTS.map(dist => (
                      <option key={dist.value} value={dist.value}>
                        {dist.label}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="text-xs text-red-500 mt-1">{errors.district}</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>เลือกจังหวัดที่มีโครงการ Sansiri</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                MONTHLY INCOME <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="THB"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${
                  errors.income ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                }`}
                required
              />
              {errors.income && (
                <p className="text-xs text-red-500 mt-1">{errors.income}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                MONTHLY EXPENSE <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="THB"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 ${
                  errors.expense ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                }`}
                required
              />
              {errors.expense && (
                <p className="text-xs text-red-500 mt-1">{errors.expense}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition flex items-center justify-center gap-2 shadow-lg"
        >
          🔍 Find My Match →
        </button>
      </form>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
