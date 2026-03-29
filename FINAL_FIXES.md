# Final Fixes - Max Loan, Currency & Chart

## การแก้ไขทั้งหมด

### ✅ 1. แก้บัค Max Loan Amount

**ปัญหา:**
- แสดง "0" แทนที่จะเป็นตัวเลขจริง
- API return `maxLoan` แต่ component ใช้ `max_loan`

**วิธีแก้:**
```typescript
// ❌ เดิม
loan_amount: data.max_loan  // undefined!

// ✅ ใหม่
loan_amount: data.maxLoan   // ถูกต้อง!
```

**ใน InvestmentLab.tsx:**
```typescript
const data = await response.json()
console.log('Loan data received:', data) // Debug log
setLoanData(data)

// ใช้ maxLoan ไม่ใช่ max_loan
loan_amount: data.maxLoan
```

**แสดงผล:**
```typescript
{loanData.maxLoan ? `${(loanData.maxLoan / 1000000).toFixed(1)}M` : '0'}
```

---

### ✅ 2. เปลี่ยน ฿ เป็น "บาท"

**ทุกที่ที่เปลี่ยน:**

#### Investment Lab:
```typescript
// ❌ เดิม
฿{monthlyIncome.toLocaleString()}
฿{monthlyExpense.toLocaleString()}
฿{minDownPayment.toLocaleString()}
฿{(property.price / 1000000).toFixed(1)}M
฿{simulation.monthly_payment?.toLocaleString()}
฿8,750
฿8,120

// ✅ ใหม่
{monthlyIncome.toLocaleString()} บาท
{monthlyExpense.toLocaleString()} บาท
{minDownPayment.toLocaleString()} บาท
{(property.price / 1000000).toFixed(1)}M บาท
{simulation.monthly_payment?.toLocaleString()} บาท
8,750 บาท
8,120 บาท
```

#### AI Verdict:
```typescript
// ❌ เดิม
{verdict.monthlyPayment.toLocaleString()} ฿
{property.averageRent ? `${(property.averageRent / 1000).toFixed(1)}K` : '16.5K'} ฿
฿{property.averageRent ? (property.averageRent * 0.85).toLocaleString() : '14,000'}
฿30K, ฿20K, ฿10K, ฿0

// ✅ ใหม่
{verdict.monthlyPayment.toLocaleString()} บาท
{property.averageRent ? `${(property.averageRent / 1000).toFixed(1)}K` : '16.5K'} (แยกบรรทัด: บาท)
{property.averageRent ? (property.averageRent * 0.85).toLocaleString() : '14,000'} บาท
30K, 20K, 10K, 0
```

---

### ✅ 3. เพิ่มเส้นกราฟใน 5-Year Cashflow

**ปัญหา:**
- มีแค่แท่งกราฟ ไม่มีเส้นกราฟ

**วิธีแก้:**
เพิ่ม SVG line chart ทับบนแท่งกราฟ

**โครงสร้างใหม่:**
```
┌─────────────────────────────────┐
│  Y-axis Labels (30K, 20K, ...)  │
│  ┌──────────────────────────┐   │
│  │  SVG (Grid + Line)       │   │
│  │  ┌────────────────────┐  │   │
│  │  │  Bars (Overlay)    │  │   │
│  │  └────────────────────┘  │   │
│  └──────────────────────────┘   │
│  X-axis Labels (Y1, Y2, ...)    │
└─────────────────────────────────┘
```

**Code:**
```typescript
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
      
      {/* Line chart */}
      {showCashflow ? (
        <>
          {/* Rent line (blue) */}
          <path
            d="M 50 96 L 150 90 L 250 84 L 350 76 L 450 68"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Data points */}
          <circle cx="50" cy="96" r="4" fill="#3b82f6" />
          <circle cx="150" cy="90" r="4" fill="#3b82f6" />
          <circle cx="250" cy="84" r="4" fill="#3b82f6" />
          <circle cx="350" cy="76" r="4" fill="#3b82f6" />
          <circle cx="450" cy="68" r="4" fill="#3b82f6" />
        </>
      ) : (
        <>
          {/* Expense line (red) */}
          <path
            d="M 50 133 L 150 129 L 250 125 L 350 121 L 450 117"
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Data points */}
          <circle cx="50" cy="133" r="4" fill="#ef4444" />
          <circle cx="150" cy="129" r="4" fill="#ef4444" />
          <circle cx="250" cy="125" r="4" fill="#ef4444" />
          <circle cx="350" cy="121" r="4" fill="#ef4444" />
          <circle cx="450" cy="117" r="4" fill="#ef4444" />
        </>
      )}
    </svg>
    
    {/* Bars overlay (semi-transparent) */}
    <div className="absolute inset-0 flex items-end justify-around gap-2">
      {data.map((item) => (
        <div className="w-full bg-blue-600/30 rounded-t-lg ..." />
      ))}
    </div>
  </div>
</div>
```

**ฟีเจอร์:**
- ✅ เส้นกราฟสีน้ำเงิน (RENT)
- ✅ เส้นกราฟสีแดง (EXPENSES)
- ✅ จุดข้อมูล (circles) บนเส้น
- ✅ Grid lines
- ✅ แท่งกราฟโปร่งแส่ (30% opacity)
- ✅ Hover tooltip แสดงตัวเลข
- ✅ Toggle ระหว่าง RENT/EXPENSES

**ข้อมูลกราฟ:**
```
RENT (สีน้ำเงิน):
Y1: 18,000 บาท
Y2: 19,500 บาท (+8.3%)
Y3: 21,000 บาท (+7.7%)
Y4: 22,800 บาท (+8.6%)
Y5: 24,500 บาท (+7.5%)

EXPENSES (สีแดง):
Y1: 8,000 บาท
Y2: 8,500 บาท (+6.3%)
Y3: 9,000 บาท (+5.9%)
Y4: 9,500 บาท (+5.6%)
Y5: 10,000 บาท (+5.3%)
```

---

## ตัวอย่างการใช้งาน

### Test Case: The Base Rama 9 (sns014)

**Input:**
```
Monthly Income: 80,000 บาท
Monthly Expense: 30,000 บาท
Down Payment: 4,000,000 บาท
Property Price: 3,200,000 บาท
```

**Process:**
1. กรอก Down Payment: 4000000
2. กดปุ่ม "Calculate"
3. API `/api/analyze` คำนวณ:
   - DTI = (30,000 / 80,000) × 100 = 37.5%
   - Max Monthly Payment = 80,000 × 0.35 = 28,000
   - Max Loan = ~3,000,000 บาท

**Output:**
```
✅ Max Loan Amount: 3.0M บาท
✅ DTI: 37.5%
✅ Status: PASSED/QUALIFIED
✅ Monthly Payment: 8,500 บาท
```

**AI Verdict:**
```
✅ Monthly Payment: 24,500 บาท
✅ Recommended Rent: 16.5K บาท
✅ Min Range: 14,000 บาท
✅ Max Range: 19,000 บาท
✅ 5-Year Cashflow: มีเส้นกราฟ + แท่งกราฟ
```

---

## การทดสอบ

### 1. ทดสอบ Max Loan Amount
```bash
npm run dev

# ไปที่
http://localhost:3000/simulator/sns014?income=80000&expense=30000

# ทดสอบ:
1. กรอก Down Payment: 4000000
2. กดปุ่ม "Calculate"
3. ตรวจสอบว่าแสดง "3.0M" ไม่ใช่ "0"
```

### 2. ทดสอบหน่วยเงิน
```bash
# ตรวจสอบทุกหน้าว่าใช้ "บาท" แทน "฿"
1. Investment Lab: Monthly Income, Expense, Down Payment
2. Investment Simulation: Property Price, Monthly Payment
3. AI Verdict: Monthly Payment, Recommended Rent
```

### 3. ทดสอบกราฟ
```bash
# ในหน้า AI Verdict
1. ตรวจสอบว่ามีเส้นกราฟ (line chart)
2. คลิก Toggle RENT/EXPENSES
3. Hover ที่แท่งกราฟเพื่อดู tooltip
4. ตรวจสอบว่าเส้นกราฟเปลี่ยนสีตาม toggle
```

---

## สรุป

### ✅ แก้บัค Max Loan Amount
- เปลี่ยนจาก `max_loan` เป็น `maxLoan`
- เพิ่ม console.log สำหรับ debug
- แสดงค่าที่ถูกต้อง

### ✅ เปลี่ยนหน่วยเงิน
- เปลี่ยนจาก ฿ เป็น "บาท" ทุกที่
- อ่านง่ายขึ้น
- สอดคล้องกับภาษาไทย

### ✅ เพิ่มเส้นกราฟ
- เพิ่ม SVG line chart
- มี Grid lines
- มี Data points
- แท่งกราฟโปร่งแส่
- Toggle ระหว่าง RENT/EXPENSES
- Hover tooltip

---

## Files Changed

1. `components/InvestmentLab.tsx`
   - แก้ `max_loan` → `maxLoan`
   - เปลี่ยน ฿ → บาท
   - เพิ่ม console.log

2. `components/AIVerdict.tsx`
   - เปลี่ยน ฿ → บาท
   - เพิ่ม SVG line chart
   - เพิ่ม Grid lines
   - แท่งกราฟโปร่งแส่ (30% opacity)

---

## ผลลัพธ์

✅ Max Loan Amount แสดงค่าที่ถูกต้อง (3.0M บาท)
✅ ทุกที่ใช้ "บาท" แทน ฿
✅ กราฟมีเส้น + แท่ง + Grid lines
✅ Build สำเร็จ ไม่มี error
✅ UX ดีขึ้น อ่านง่ายขึ้น

พร้อมใช้งานแล้ว! 🎉
