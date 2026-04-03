export type Lang = 'th' | 'en'

export interface Translations {
  discover: string
  simulator: string
  portfolio: string
  insights: string
  budget: string
  goal: string
  location: string
  findMatch: string
  rent: string
  flip: string
  recommended: string
  consider: string
  riskLevel: string
  low: string
  medium: string
  high: string
  expectedROI: string
  monthlyPayment: string
  downPayment: string
  addToPortfolio: string
  downloadReport: string
}

export const translations: Record<Lang, Translations> = {
  th: {
    discover: 'ค้นหา',
    simulator: 'จำลอง',
    portfolio: 'พอร์ต',
    insights: 'ข้อมูลเชิงลึก',
    budget: 'งบประมาณ',
    goal: 'เป้าหมาย',
    location: 'ทำเล',
    findMatch: 'ค้นหาที่เหมาะสม',
    rent: 'ให้เช่า',
    flip: 'ขายต่อ',
    recommended: 'แนะนำ',
    consider: 'พิจารณา',
    riskLevel: 'ระดับความเสี่ยง',
    low: 'ต่ำ',
    medium: 'ปานกลาง',
    high: 'สูง',
    expectedROI: 'ผลตอบแทนคาดการณ์',
    monthlyPayment: 'ค่าผ่อนต่อเดือน',
    downPayment: 'เงินดาวน์',
    addToPortfolio: 'เพิ่มในพอร์ต',
    downloadReport: 'ดาวน์โหลดรายงาน'
  },
  en: {
    discover: 'Discover',
    simulator: 'Simulator',
    portfolio: 'Portfolio',
    insights: 'Insights',
    budget: 'Budget',
    goal: 'Goal',
    location: 'Location',
    findMatch: 'Find Match',
    rent: 'Rent',
    flip: 'Flip',
    recommended: 'Recommended',
    consider: 'Consider',
    riskLevel: 'Risk Level',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    expectedROI: 'Expected ROI',
    monthlyPayment: 'Monthly Payment',
    downPayment: 'Down Payment',
    addToPortfolio: 'Add to Portfolio',
    downloadReport: 'Download Report'
  }
}
