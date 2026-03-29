# Sovereign AI - Property Investment Agent

🏠 AI-driven property investment simulator that analyzes market liquidity and asset yields to match your capital with institutional-grade opportunities.

## 🎯 Project Overview

Sovereign AI is a comprehensive MVP platform that helps investors make data-driven decisions in real estate investment. Built with Next.js, TypeScript, and a custom AI agent, it provides end-to-end investment analysis from property discovery to portfolio management.

### Key Features

- 🤖 **AI-Powered Matching**: Intelligent property recommendations based on budget, goals, and market data
- 💰 **Financial Analysis**: Loan assessment, DTI calculation, and investment simulation
- 📊 **Market Intelligence**: Location trend analytics and capital gain projections
- ✅ **AI Verdict**: Comprehensive investment decision support with pros/cons analysis
- 📱 **Portfolio Management**: Real-time asset tracking and smart selling alerts

## 🚀 Live Demo

The application is running at: **http://localhost:3000**

### Demo Flow
1. **Discover** (หน้า 1-3): Enter budget → View AI-matched properties → Select property
2. **Simulator** (หน้า 4-6): Input finances → Run simulation → Get AI verdict
3. **Portfolio** (หน้า 7-8): View assets → Monitor performance → Receive alerts

## Features

### Phase 1: Discovery & Predictive Analytics (หน้า 1-3)
- **Smart Property Matching**: AI-powered recommendation engine with scoring algorithm
  - Budget Fit (40%) + ROI (30%) + Location (30%)
  - Top 3 property recommendations
  - Match score 0-100% with detailed reasons
- **Real Sansiri Data**: 8 actual Sansiri properties across Bangkok, Pathum Thani, Chonburi
- **Location Trend Analytics**: Predictive modeling for capital gain forecasting
- **Risk Assessment**: Low/Medium/High risk classification

### Phase 2: Financial Analysis & AI Decision (หน้า 4-6)
- **Loan Assessment**: 
  - DTI (Debt-to-Income) calculation
  - Maximum loan capacity analysis
  - Pre-qualification status
- **Investment Simulation**: 
  - Monthly payment calculation
  - ROI projection
  - Cash flow analysis (Rent scenario)
  - Profit projection (Flip scenario)
- **Location Trend Charts**: Historical and projected property value growth
- **AI Verdict Dashboard** ⭐ (KILLER FEATURE):
  - Recommended / Consider / Not Recommended
  - Confidence score 60-95%
  - Detailed pros & cons analysis
  - AI-generated insights and recommendations

### Phase 3: Portfolio Management & Exit Strategy (หน้า 7-8)
- **Real-time Portfolio Tracking**: Total value, ROI, cash flow
- **Asset Performance Monitoring**: Market value vs purchase price
- **Smart Selling Alerts**: Automated profit target notifications
- **Growth Visualization**: Portfolio performance charts

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd Sansilerd-hackathon

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Current Status
✅ All dependencies installed
✅ No TypeScript errors
✅ Development server running successfully
✅ All components compiled without errors

## Project Structure

```
Sansilerd-hackathon/
├── app/
│   ├── api/              # API routes
│   │   ├── projects/     # Property listings
│   │   ├── recommend/    # Recommendation engine
│   │   ├── analyze/      # Financial analysis
│   │   └── simulate/     # Investment simulation
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page
│   └── globals.css       # Global styles
├── components/
│   ├── Header.tsx        # App header
│   ├── DiscoveryForm.tsx # Phase 1: Search form
│   ├── PropertyMatches.tsx # Phase 1: Results
│   ├── FinancialAnalysis.tsx # Phase 2: Simulator
│   └── Portfolio.tsx     # Phase 3: Portfolio view
├── lib/
│   └── matchingEngine.ts # Scoring algorithm
└── package.json
```

## API Endpoints

### POST /api/recommend
Match properties based on user criteria with AI scoring

**Request:**
```json
{
  "budget_min": 1000000,
  "budget_max": 5000000,
  "goal": "rent",
  "location": "Bangkok",
  "income": 50000,
  "expense": 15000
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "rank": 1,
      "id": "sns001",
      "name": "The Base Sukhumvit 77",
      "price": 2800000,
      "match_score": 88.5,
      "short_reason": "เหมาะกับงบประมาณ • ผลตอบแทนค่าเช่าสูง 5.8% • ใกล้ BTS",
      "riskLevel": "low"
    }
  ],
  "total": 8
}
```

### POST /api/analyze
Analyze loan capacity and financial status

**Request:**
```json
{
  "income": 50000,
  "expense": 15000,
  "down_payment": 500000
}
```

**Response:**
```json
{
  "maxLoan": 1800000,
  "monthlyCapacity": 17500,
  "dti": 0.30,
  "status": "passed",
  "recommendation": "สถานะการเงินดีมาก สามารถกู้ได้สูงสุด 1.8 ล้านบาท"
}
```

### POST /api/simulate
Simulate investment returns and cash flow

**Request:**
```json
{
  "property_id": "sns001",
  "price": 2800000,
  "downPayment": 840000,
  "interestRate": 6.5,
  "tenure": 20,
  "goal": "rent"
}
```

**Response:**
```json
{
  "monthlyPayment": 14650,
  "totalPayment": 4356000,
  "roi": 5.8,
  "paybackPeriod": 8.2,
  "monthlyRent": 13500,
  "netMonthlyCashFlow": -1500
}
```

### POST /api/verdict
Get AI investment decision and recommendation

**Request:**
```json
{
  "property_id": "sns001",
  "simulation": { ... },
  "loanAssessment": { ... },
  "criteria": { "goal": "rent" }
}
```

**Response:**
```json
{
  "decision": "recommended",
  "confidence": 85,
  "summary": "The Base Sukhumvit 77 เป็นตัวเลือกที่ดีสำหรับการลงทุน",
  "pros": [
    "ROI สูงกว่าค่าเฉลี่ย (5.8%)",
    "วงเงินกู้เพียงพอ สถานะการเงินดี",
    "ทำเลยอดเยี่ยม มีศักยภาพสูง"
  ],
  "cons": [],
  "aiInsight": "โครงการนี้เหมาะสำหรับปล่อยเช่า ด้วยผลตอบแทน 5.8% ต่อปี..."
}
```

## Matching Algorithm

The AI recommendation engine uses a sophisticated weighted scoring formula:

```typescript
Score = (Budget Fit × 0.4) + (ROI × 0.3) + (Location × 0.3)
```

### Scoring Components:

1. **Budget Fit (40%)**
   - Measures how well property price matches user's budget range
   - Optimal when price is near budget midpoint
   - Penalizes properties too far from budget

2. **ROI Fit (30%)**
   - For Rent: Prioritizes rental yield (monthly rent / price)
   - For Flip: Prioritizes capital gain projection
   - Higher returns = higher score

3. **Location Score (30%)**
   - Based on proximity to BTS/MRT
   - Market liquidity and demand
   - Historical price appreciation
   - Occupancy rates

### Risk Assessment:
- **Low Risk**: High location score (>85), high liquidity (>85), low DTI
- **Medium Risk**: Moderate scores, acceptable DTI
- **High Risk**: Low location/liquidity scores, high DTI, low occupancy

### AI Decision Logic:
```typescript
if (score >= 70 && dti < 0.4 && roi > 5) → Recommended
else if (score >= 50) → Consider
else → Not Recommended
```

## Build for Production

```bash
npm run build
npm start
```

## 🏢 Sansiri Properties Database

The platform includes 8 real Sansiri properties:

| Property | Location | Price | Type | Yield | Risk |
|----------|----------|-------|------|-------|------|
| The Base Sukhumvit 77 | Phra Khanong | 2.8M | Condo | 5.8% | Low |
| The Monument Thong Lo | Watthana | 12.4M | Condo | 4.5% | Low |
| KHUN by YOO Thonglor | Watthana | 18.5M | Condo | 4.2% | Medium |
| The Base Central Pattaya | Chonburi | 1.85M | Condo | 7.2% | Medium |
| SHAA Residence Rangsit | Pathum Thani | 1.2M | Condo | 6.5% | Low |
| The Line Ratchathewi | Ratchathewi | 5.6M | Condo | 5.2% | Low |
| Via ARI | Phaya Thai | 8.9M | Condo | 4.8% | Low |
| NICHE MONO Sukhumvit-Bearing | Samut Prakan | 2.1M | Condo | 6.0% | Medium |

### Property Data Includes:
- Complete specifications (size, bedrooms, bathrooms)
- Location details and BTS/MRT proximity
- Rental yield and occupancy rates
- Capital gain projections (3, 5, 10 years)
- Location and liquidity scores
- High-quality property images

## 🤖 AI Agent Architecture

```
lib/
├── aiAgent.ts           # Core AI Investment Agent
│   ├── calculateMatchScore()
│   ├── getTopMatches()
│   ├── calculateLoanAssessment()
│   ├── simulateInvestment()
│   └── generateVerdict()
├── sansiriData.ts       # Property database
│   ├── Property interface
│   ├── sansiriProperties[]
│   └── searchProperties()
└── matchingEngine.ts    # Matching algorithm wrapper
```

### AI Capabilities:
- Multi-factor property scoring
- Financial eligibility assessment
- Investment return simulation
- Risk level classification
- Decision confidence scoring
- Natural language insights generation

## 📊 Technical Highlights

- **Type-Safe**: Full TypeScript implementation
- **Real-time**: Instant calculations and updates
- **Responsive**: Mobile-first design (max-width: 448px)
- **Fast**: < 500ms API response time
- **Scalable**: Modular architecture
- **Maintainable**: Clean code with separation of concerns

## 🎨 UI Components

- **DiscoveryForm**: Budget and goal input
- **PropertyMatches**: AI-matched property cards
- **FinancialAnalysis**: Loan assessment and simulation
- **Portfolio**: Asset management dashboard
- **BottomNav**: Mobile navigation bar
- **Charts**: Recharts for data visualization

## 📝 Development Notes

### Code Structure:
- `app/`: Next.js app router pages and layouts
- `components/`: React components
- `lib/`: Business logic and AI agent
- `app/api/`: API route handlers
- `public/`: Static assets

### Best Practices:
- Component-based architecture
- API route separation
- Type safety throughout
- Error handling
- Loading states
- Responsive design

## 🔮 Future Enhancements

- [ ] Real-time market data integration via external APIs
- [ ] User authentication and saved portfolios
- [ ] Property comparison tool (side-by-side)
- [ ] Document upload for loan applications
- [ ] Bank API integration for real loan approval
- [ ] Push notifications for price alerts
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (EN/TH)
- [ ] Export reports (PDF)
- [ ] Social sharing features

## 📄 Documentation

- [FEATURES.md](./FEATURES.md) - Detailed feature documentation
- [SRS Document](./requirement-document.pdf) - Software requirements specification
- [Mockups](./Mock%20Up.pdf) - UI/UX design mockups

## License

MIT
