# 🚀 Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Prerequisites Check
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

### 2. Install & Run
```bash
cd Sansilerd-hackathon
npm install
npm run dev
```

### 3. Open Browser
```
http://localhost:3000
```

That's it! 🎉

## 🎯 First Time User Guide

### Step 1: Discovery (30 seconds)
1. You'll see the **Discovery Form**
2. Enter your criteria:
   - **Budget Min**: 1000000 (1M THB)
   - **Budget Max**: 5000000 (5M THB)
   - **Goal**: Click "🏠 Rent"
   - **Location**: Type "Bangkok"
   - **Income**: 50000 (50K THB/month)
   - **Expense**: 15000 (15K THB/month)
3. Click **"Find My Match →"**

### Step 2: View Results (30 seconds)
1. Wait for AI to analyze (1-2 seconds)
2. See **Top 3 Matches**:
   - Property cards with images
   - Match scores (85-95%)
   - AI reasons
   - Risk levels
3. Click on **"The Base Sukhumvit 77"** (usually #1)

### Step 3: Financial Analysis (2 minutes)
1. You're now in the **Investment Lab**
2. Review the **Loan Assessment**:
   - Pre-filled with your income/expense
   - See max loan capacity
   - Status: "Pre-Qualified" ✓
3. Check **Investment Simulation**:
   - Monthly payment: ~14,650 THB
   - ROI: 5.8%
   - Net cash flow
4. View **Location Trend Chart**:
   - 3-year: +12%
   - 5-year: +22%
   - 10-year: +45%

### Step 4: Get AI Verdict (30 seconds)
1. Click **"🤖 Get AI Verdict"**
2. Wait for AI analysis (1 second)
3. See the result:
   - ✅ Recommended (or ⚠️ Consider / ❌ Not Recommended)
   - Confidence: 85%
   - Pros & Cons
   - AI Insight

### Step 5: Explore Portfolio (30 seconds)
1. Click **"PORTFOLIO"** in bottom nav
2. See portfolio overview:
   - Total Value: 42.8M THB
   - Overall ROI: 18.2%
   - Monthly Cash Flow: 148K THB
3. View **Smart Selling Alert**

## 🎮 Try Different Scenarios

### Scenario 1: Budget-Conscious Investor
```
Budget: 1M - 2M
Goal: Rent
Location: Rangsit
Income: 35K
Expense: 10K
```
**Expected**: Entry-level properties, stable returns

### Scenario 2: Premium Investor
```
Budget: 10M - 20M
Goal: Flip
Location: Thong Lo
Income: 100K
Expense: 30K
```
**Expected**: Premium properties, high capital gain

### Scenario 3: First-Time Buyer
```
Budget: 1.5M - 3M
Goal: Rent
Location: Bangkok
Income: 45K
Expense: 12K
```
**Expected**: Good starter properties, balanced risk

## 🔍 What to Look For

### In Discovery:
- ✅ Match scores (higher = better fit)
- ✅ AI reasons (why recommended)
- ✅ Risk levels (Low/Medium/High)
- ✅ Property details (size, location, amenities)

### In Analysis:
- ✅ DTI ratio (< 0.4 is good)
- ✅ Max loan capacity
- ✅ Monthly payment
- ✅ ROI percentage
- ✅ Cash flow (positive = profit)

### In AI Verdict:
- ✅ Decision (Recommended/Consider/Not Recommended)
- ✅ Confidence score (higher = more certain)
- ✅ Pros (advantages)
- ✅ Cons (risks)
- ✅ AI insight (detailed explanation)

## 💡 Pro Tips

### Tip 1: Budget Range
- Keep range reasonable (2-3x difference)
- Too wide = less accurate matches
- Too narrow = fewer options

### Tip 2: Income/Expense
- Be realistic with your numbers
- Include all monthly expenses
- DTI < 0.4 is ideal for loan approval

### Tip 3: Down Payment
- Recommended: 30% of property price
- Higher down payment = lower monthly payment
- Lower down payment = higher ROI potential

### Tip 4: Goal Selection
- **Rent**: Focus on rental yield and cash flow
- **Flip**: Focus on capital gain and appreciation

### Tip 5: Location
- Bangkok = higher prices, better liquidity
- Suburbs = lower prices, higher yields
- Near BTS/MRT = premium but stable

## 🐛 Troubleshooting

### Problem: Page won't load
**Solution**: 
```bash
# Stop the server (Ctrl+C)
# Restart
npm run dev
```

### Problem: No properties found
**Solution**: 
- Adjust budget range (try 1M - 10M)
- Remove location filter
- Try different goal (Rent vs Flip)

### Problem: AI Verdict not appearing
**Solution**:
- Make sure loan assessment loaded
- Make sure simulation completed
- Check browser console for errors
- Refresh the page

### Problem: Images not loading
**Solution**:
- Check internet connection
- Images use Unsplash CDN
- Fallback images should load automatically

## 📱 Mobile Testing

### On Mobile Device:
1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address
   ```
2. On mobile, open browser:
   ```
   http://[YOUR_IP]:3000
   ```
3. Test all features on mobile

## 🎯 Feature Checklist

Try all these features:

- [ ] Search for properties
- [ ] View top 3 matches
- [ ] Click on a property
- [ ] Enter financial info
- [ ] Run simulation
- [ ] Get AI verdict
- [ ] Navigate to portfolio
- [ ] View smart alerts
- [ ] Use bottom navigation
- [ ] Try different scenarios

## 📊 Understanding the Numbers

### Match Score (0-100%)
- **90-100%**: Perfect match
- **80-89%**: Excellent match
- **70-79%**: Good match
- **60-69%**: Fair match
- **< 60%**: Poor match

### DTI Ratio
- **< 0.30**: Excellent (low debt)
- **0.30-0.40**: Good (manageable)
- **0.40-0.50**: Warning (high debt)
- **> 0.50**: Failed (too much debt)

### ROI Percentage
- **> 7%**: Excellent return
- **5-7%**: Good return
- **3-5%**: Fair return
- **< 3%**: Poor return

### Risk Level
- **Low**: Safe investment, stable returns
- **Medium**: Moderate risk, good potential
- **High**: Risky, high potential or concerns

## 🎓 Learning Path

### Beginner (Day 1)
1. Run the app
2. Try one search
3. View results
4. Get AI verdict

### Intermediate (Day 2)
1. Try multiple scenarios
2. Compare different properties
3. Understand the calculations
4. Explore portfolio features

### Advanced (Day 3)
1. Analyze the code
2. Understand AI algorithm
3. Test API endpoints
4. Customize for your needs

## 🚀 Next Steps

After trying the app:

1. **Read Documentation**:
   - [README.md](./README.md) - Overview
   - [FEATURES.md](./FEATURES.md) - Detailed features
   - [DEMO_GUIDE.md](./DEMO_GUIDE.md) - Presentation guide

2. **Explore Code**:
   - `lib/aiAgent.ts` - AI engine
   - `lib/sansiriData.ts` - Property data
   - `components/` - UI components

3. **Test APIs**:
   - Use Postman or curl
   - See API examples in README
   - Test different scenarios

4. **Customize**:
   - Add more properties
   - Adjust scoring weights
   - Modify UI colors
   - Add new features

## 💬 Need Help?

### Check These First:
1. [README.md](./README.md) - Main documentation
2. [TESTING.md](./TESTING.md) - Test cases
3. Browser console - Error messages
4. Terminal output - Server logs

### Common Questions:

**Q: How accurate are the calculations?**
A: Financial calculations use standard formulas. AI recommendations are based on multiple factors and should be used as guidance.

**Q: Is this real Sansiri data?**
A: The properties are real Sansiri projects with realistic data for demonstration purposes.

**Q: Can I add my own properties?**
A: Yes! Edit `lib/sansiriData.ts` to add more properties.

**Q: How does the AI work?**
A: The AI uses a weighted scoring algorithm analyzing budget fit, ROI, and location quality. See `lib/aiAgent.ts` for details.

**Q: Can I deploy this?**
A: Yes! It's a standard Next.js app. Deploy to Vercel, Netlify, or any Node.js hosting.

## 🎉 You're Ready!

You now know how to:
- ✅ Run the application
- ✅ Search for properties
- ✅ Analyze investments
- ✅ Get AI recommendations
- ✅ Manage portfolio

**Enjoy exploring Sovereign AI!** 🏠🤖

---

**Quick Links**:
- 🏠 [Home](http://localhost:3000)
- 📖 [Full Documentation](./README.md)
- 🎬 [Demo Guide](./DEMO_GUIDE.md)
- 🧪 [Testing Guide](./TESTING.md)
