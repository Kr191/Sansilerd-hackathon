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
  const [addingToPortfolio, setAddingToPortfolio] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [portfolioAdded, setPortfolioAdded] = useState(false)
  
  // คำนวณข้อมูลจริงจาก investmentData และ property
  const downPayment = investmentData?.downPayment || 0
  const loanAmount = property.price - downPayment
  const monthlyPayment = investmentData?.monthly_payment || (() => {
    const annualRate = 0.042
    const monthlyRate = annualRate / 12
    const numPayments = 30 * 12
    return Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                     (Math.pow(1 + monthlyRate, numPayments) - 1))
  })()
  
  const rentalYield = property.rentalYield || 5.5
  const roi = rentalYield
  const averageRent = property.averageRent || Math.round((property.price * rentalYield) / 100 / 12)
  
  // คำนวณ risk level จาก location score และ liquidity score
  const locationScore = property.locationScore || 75
  const liquidityScore = property.liquidityScore || 75
  const avgScore = (locationScore + liquidityScore) / 2
  const riskLevel = avgScore > 85 ? 'low' : avgScore > 70 ? 'medium' : 'high'
  
  // คำนวณ ROI vs Market
  const marketAvgROI = 6.5
  const roiDiff = (roi - marketAvgROI).toFixed(1)
  
  // สร้าง verdict
  const verdict = verdictData || {
    decision: roi > 5 && riskLevel !== 'high' ? 'recommended' : 'consider',
    confidence: Math.min(95, Math.round(avgScore)),
    roi: roi,
    monthlyPayment: monthlyPayment,
    riskLevel: riskLevel,
    reasons: [
      roi > marketAvgROI ? `ROI สูงกว่าค่าเฉลี่ยตลาด ${roiDiff}%` : 'ROI ใกล้เคียงค่าเฉลี่ยตลาด',
      downPayment >= property.price * 0.1 ? 'เหมาะกับงบประมาณ' : 'ต้องการเงินดาวน์เพิ่ม',
      locationScore > 80 ? 'ทำเลดีมีศักยภาพเติบโต' : 'ทำเลปานกลาง',
      liquidityScore > 80 ? 'สภาพคล่องสูง' : 'สภาพคล่องปานกลาง'
    ]
  }

  const isRecommended = verdict.decision === 'recommended'
  
  // คำนวณ 5-year cashflow projection
  const yearlyData = Array.from({ length: 5 }, (_, i) => {
    const year = i + 1
    const rentGrowth = 1 + (0.08 * year) // เพิ่ม 8% ต่อปี
    const expenseGrowth = 1 + (0.05 * year) // เพิ่ม 5% ต่อปี
    return {
      year,
      rent: Math.round(averageRent * rentGrowth),
      expense: Math.round(monthlyPayment * 0.4 * expenseGrowth) // ค่าใช้จ่าย ~40% ของค่าผ่อน
    }
  })
  
  // ฟังก์ชันบันทึกลง Portfolio
  const handleAddToPortfolio = () => {
    setAddingToPortfolio(true)
    
    try {
      // ดึง portfolio ปัจจุบันจาก localStorage
      const existingPortfolio = localStorage.getItem('portfolio')
      const portfolio = existingPortfolio ? JSON.parse(existingPortfolio) : []
      
      // สร้าง portfolio item
      const portfolioItem = {
        id: `${property.id}-${Date.now()}`,
        property: property,
        investment: {
          downPayment: downPayment,
          monthlyPayment: monthlyPayment,
          roi: roi,
          riskLevel: riskLevel
        },
        verdict: verdict,
        addedAt: new Date().toISOString()
      }
      
      // เช็คว่ามีอยู่แล้วหรือไม่
      const exists = portfolio.some((item: any) => item.property.id === property.id)
      
      if (!exists) {
        portfolio.push(portfolioItem)
        localStorage.setItem('portfolio', JSON.stringify(portfolio))
        setPortfolioAdded(true)
        
        // แสดง success message
        setTimeout(() => {
          alert('✅ Added to Portfolio successfully!')
        }, 300)
      } else {
        alert('ℹ️ This property is already in your portfolio')
      }
    } catch (error) {
      console.error('Error adding to portfolio:', error)
      alert('❌ Failed to add to portfolio')
    } finally {
      setAddingToPortfolio(false)
    }
  }
  
  // ฟังก์ชันสร้าง PDF
  const handleDownloadPDF = () => {
    setDownloadingPDF(true)
    
    try {
      // สร้าง HTML content สำหรับ PDF
      const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Investment Analysis - ${property.name}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; }
    .section { margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px; }
    .metric { display: inline-block; margin: 10px 20px 10px 0; }
    .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .metric-value { font-size: 24px; font-weight: bold; color: #111827; }
    .recommended { color: #10b981; font-weight: bold; }
    .consider { color: #f59e0b; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <h1>Investment Analysis Report</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleString('th-TH')}</p>
  
  <div class="section">
    <h2>Property Information</h2>
    <p><strong>Name:</strong> ${property.name}</p>
    <p><strong>Location:</strong> ${property.location}, ${property.district}, ${property.province}</p>
    <p><strong>Type:</strong> ${property.type}</p>
    <p><strong>Price:</strong> ${property.price.toLocaleString()} THB</p>
    <p><strong>Size:</strong> ${property.size} sqm</p>
    <p><strong>Bedrooms:</strong> ${property.bedrooms} | <strong>Bathrooms:</strong> ${property.bathrooms}</p>
  </div>
  
  <div class="section">
    <h2>AI Verdict</h2>
    <p class="${verdict.decision === 'recommended' ? 'recommended' : 'consider'}">
      Decision: ${verdict.decision.toUpperCase()}
    </p>
    <p><strong>Confidence:</strong> ${verdict.confidence}%</p>
    <p><strong>Risk Level:</strong> ${riskLevel.toUpperCase()}</p>
    <ul>
      ${verdict.reasons.map((r: string) => `<li>${r}</li>`).join('')}
    </ul>
  </div>
  
  <div class="section">
    <h2>Investment Metrics</h2>
    <div class="metric">
      <div class="metric-label">Expected ROI</div>
      <div class="metric-value">${roi.toFixed(1)}%</div>
    </div>
    <div class="metric">
      <div class="metric-label">Monthly Payment</div>
      <div class="metric-value">${monthlyPayment.toLocaleString()} THB</div>
    </div>
    <div class="metric">
      <div class="metric-label">Down Payment</div>
      <div class="metric-value">${downPayment.toLocaleString()} THB</div>
    </div>
  </div>
  
  <div class="section">
    <h2>5-Year Cashflow Projection</h2>
    <table>
      <thead>
        <tr>
          <th>Year</th>
          <th>Rental Income</th>
          <th>Expenses</th>
          <th>Net Cashflow</th>
        </tr>
      </thead>
      <tbody>
        ${yearlyData.map(d => `
          <tr>
            <td>Year ${d.year}</td>
            <td>${d.rent.toLocaleString()} THB</td>
            <td>${d.expense.toLocaleString()} THB</td>
            <td>${(d.rent - d.expense).toLocaleString()} THB</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h2>Recommended Rent Range</h2>
    <p><strong>Recommended:</strong> ${averageRent.toLocaleString()} THB/month</p>
    <p><strong>Min Range:</strong> ${Math.round(averageRent * 0.85).toLocaleString()} THB/month</p>
    <p><strong>Max Range:</strong> ${Math.round(averageRent * 1.15).toLocaleString()} THB/month</p>
    <p><strong>Target Occupancy:</strong> ${property.occupancyRate || 95}%</p>
  </div>
  
  <div class="footer">
    <p>This report is generated by Sansilerd Investment Simulator</p>
    <p>Disclaimer: This analysis is for informational purposes only and should not be considered as financial advice.</p>
  </div>
</body>
</html>
      `
      
      // สร้าง Blob และ download
      const blob = new Blob([pdfContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `investment-analysis-${property.name.replace(/\s+/g, '-')}-${Date.now()}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // แสดง success message
      setTimeout(() => {
        alert('✅ Analysis report downloaded successfully!')
      }, 300)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('❌ Failed to download report')
    } finally {
      setDownloadingPDF(false)
    }
  }

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
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
            isRecommended 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {isRecommended ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span className="font-semibold text-sm capitalize">{verdict.decision}</span>
          </div>
          
          <p className="text-gray-900 text-lg leading-relaxed">
            {verdict.reasons.map((reason: string, index: number) => (
              <span key={index}>
                {index === 0 && <span className="font-bold">{reason}</span>}
                {index > 0 && reason}
                {index < verdict.reasons.length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>

      </div>


      {/* Investment Metrics */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
        <p className="text-xs text-gray-500 uppercase mb-4">Investment Metrics</p>
        
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-3xl font-bold text-emerald-600">{verdict.roi.toFixed(1)}%</p>
            <span className={`text-sm flex items-center gap-1 ${
              parseFloat(roiDiff) > 0 ? 'text-emerald-600' : 'text-gray-600'
            }`}>
              <TrendingUp className="w-4 h-4" />
              {parseFloat(roiDiff) > 0 ? '+' : ''}{roiDiff}% vs Market
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
              {yearlyData.map((data) => {
                const maxValue = Math.max(...yearlyData.map(d => d.rent)) * 1.2
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
        
        {/* Summary - คำนวณจากข้อมูลจริง */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-gray-600">
              รายได้จากค่าเช่าเพิ่มขึ้นเฉลี่ย <span className="font-semibold text-blue-600">
                {(() => {
                  const firstYearRent = yearlyData[0].rent
                  const lastYearRent = yearlyData[yearlyData.length - 1].rent
                  const avgGrowth = ((Math.pow(lastYearRent / firstYearRent, 1 / (yearlyData.length - 1)) - 1) * 100).toFixed(1)
                  return avgGrowth
                })()}%
              </span> ต่อปี
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl">
            <p className="text-xs text-gray-600">
              ค่าใช้จ่ายเพิ่มขึ้นเฉลี่ย <span className="font-semibold text-red-600">
                {(() => {
                  const firstYearExpense = yearlyData[0].expense
                  const lastYearExpense = yearlyData[yearlyData.length - 1].expense
                  const avgGrowth = ((Math.pow(lastYearExpense / firstYearExpense, 1 / (yearlyData.length - 1)) - 1) * 100).toFixed(1)
                  return avgGrowth
                })()}%
              </span> ต่อปี
            </p>
          </div>
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
                {(averageRent / 1000).toFixed(1)}K
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
              {Math.round(averageRent * 0.85).toLocaleString()} บาท
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Max Range</p>
            <p className="text-lg font-bold text-gray-900">
              {Math.round(averageRent * 1.15).toLocaleString()} บาท
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600">
          Optimized for <span className="font-semibold text-emerald-600">{property.occupancyRate || 95}% Occupancy Rate</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button 
          onClick={handleAddToPortfolio}
          disabled={addingToPortfolio || portfolioAdded}
          className={`w-full border-2 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors ${
            portfolioAdded 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default'
              : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
          }`}
        >
          <BookmarkPlus className="w-5 h-5" />
          {portfolioAdded ? 'Added to Portfolio ✓' : addingToPortfolio ? 'Adding...' : 'Add to Portfolio'}
        </button>

        <button 
          onClick={handleDownloadPDF}
          disabled={downloadingPDF}
          className="w-full bg-white border-2 border-gray-200 text-gray-900 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          {downloadingPDF ? 'Generating...' : 'Download Analysis Report'}
        </button>
      </div>
    </div>
  )
}