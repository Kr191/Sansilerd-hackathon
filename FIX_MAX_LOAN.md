# แก้ไข Max Loan Amount Bug

## ปัญหาเดิม

Max Loan Amount แสดง "NaNM" เพราะ:
- คำนวณทันทีที่พิมพ์ตัวเลข (useEffect ที่ watch downPayment)
- ยังพิมพ์ไม่เสร็จก็คำนวณแล้ว
- ทำให้ได้ค่า NaN

## วิธีแก้ไข

### 1. เอา useEffect ออก
```typescript
// ❌ เดิม - คำนวณทันทีที่พิมพ์
useEffect(() => {
  if (downPayment && parseFloat(downPayment) > 0) {
    calculateLoan()
  }
}, [downPayment])
```

### 2. เพิ่ม Manual Trigger
```typescript
// ✅ ใหม่ - คำนวณเมื่อ:
// 1. กดปุ่ม "Calculate"
// 2. กด Enter
// 3. Blur จาก input (คลิกที่อื่น)

const handleDownPaymentBlur = () => {
  if (downPayment && parseFloat(downPayment) > 0) {
    calculateLoan()
  }
}

const handleDownPaymentKeyPress = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    calculateLoan()
  }
}
```

### 3. เพิ่มปุ่ม Calculate
```typescript
<div className="flex gap-2">
  <input
    type="number"
    value={downPayment}
    onChange={(e) => setDownPayment(e.target.value)}
    onBlur={handleDownPaymentBlur}
    onKeyPress={handleDownPaymentKeyPress}
    className="flex-1 ..."
  />
  <button
    onClick={calculateLoan}
    disabled={!downPayment || parseFloat(downPayment) <= 0 || calculating}
    className="px-6 py-4 bg-blue-600 text-white rounded-xl ..."
  >
    {calculating ? '...' : 'Calculate'}
  </button>
</div>
```

### 4. เพิ่ม Loading State
```typescript
const [calculating, setCalculating] = useState(false)

const calculateLoan = async () => {
  const down = parseFloat(downPayment)
  if (!down || down <= 0 || isNaN(down)) {
    setLoanData(null)
    setSimulation(null)
    return
  }

  setCalculating(true)
  try {
    // ... API calls
  } finally {
    setCalculating(false)
  }
}
```

### 5. เพิ่ม Validation
```typescript
// แสดง Max Loan Amount เฉพาะเมื่อมีข้อมูล
{loanData && !calculating && (
  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
    <div className="relative w-32 h-32 mx-auto mb-4">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="56"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="12"
          strokeDasharray={`${Math.min((loanData.dti / 50) * 351.86, 351.86)} 351.86`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-blue-600">
          {loanData.max_loan ? `${(loanData.max_loan / 1000000).toFixed(1)}M` : '0'}
        </p>
        <p className="text-xs text-gray-600">MAX LOAN AMOUNT</p>
      </div>
    </div>
    <p className="text-sm text-gray-600">
      Based on your debt-to-income ratio of 
      <span className="font-semibold">{loanData.dti ? loanData.dti.toFixed(1) : '0'}%</span>
    </p>
  </div>
)}
```

## การใช้งาน

### วิธีที่ 1: กดปุ่ม Calculate
1. กรอกเงินดาวน์ เช่น 4000000
2. กดปุ่ม "Calculate"
3. รอสักครู่ (แสดง "กำลังคำนวณ...")
4. แสดง Max Loan Amount

### วิธีที่ 2: กด Enter
1. กรอกเงินดาวน์ เช่น 4000000
2. กด Enter
3. แสดง Max Loan Amount

### วิธีที่ 3: คลิกที่อื่น (Blur)
1. กรอกเงินดาวน์ เช่น 4000000
2. คลิกที่อื่น (นอก input)
3. แสดง Max Loan Amount

## ตัวอย่างการทำงาน

### Input:
```
Monthly Income: ฿80,000
Monthly Expense: ฿30,000
Down Payment: ฿4,000,000
```

### Process:
1. User กรอก "4000000"
2. User กดปุ่ม "Calculate" (หรือ Enter หรือคลิกที่อื่น)
3. แสดง Loading: "กำลังคำนวณ..."
4. เรียก API `/api/analyze`
5. คำนวณ DTI = (30,000 / 80,000) × 100 = 37.5%
6. คำนวณ Max Loan = (80,000 - 30,000) × 5 × 12 = 3,000,000

### Output:
```
Max Loan Amount: 3.0M
DTI: 37.5%
Status: PASSED/QUALIFIED
```

## States

### 1. Initial State (ยังไม่กรอก)
- Input: ว่าง
- Button: Disabled
- Max Loan: ไม่แสดง

### 2. Typing State (กำลังพิมพ์)
- Input: มีค่า เช่น "400000"
- Button: Enabled
- Max Loan: ไม่แสดง

### 3. Calculating State (กำลังคำนวณ)
- Input: มีค่า
- Button: Disabled, แสดง "..."
- Loading: แสดง "กำลังคำนวณ..."
- Max Loan: ไม่แสดง

### 4. Calculated State (คำนวณเสร็จ)
- Input: มีค่า
- Button: Enabled
- Loading: ซ่อน
- Max Loan: แสดงผลลัพธ์

## Error Handling

### กรณีที่ 1: กรอกค่าไม่ถูกต้อง
```typescript
if (!down || down <= 0 || isNaN(down)) {
  setLoanData(null)
  setSimulation(null)
  return
}
```

### กรณีที่ 2: API Error
```typescript
try {
  // API calls
} catch (error) {
  console.error('Error calculating loan:', error)
} finally {
  setCalculating(false)
}
```

### กรณีที่ 3: ข้อมูลไม่ครบ
```typescript
{loanData && !calculating && (
  // แสดง Max Loan Amount
)}
```

## Benefits

✅ ไม่มี NaN แล้ว
✅ User control เมื่อจะคำนวณ
✅ มี Loading state ชัดเจน
✅ มี 3 วิธีในการ trigger
✅ Validation ครบถ้วน
✅ Error handling ดี
✅ UX ดีขึ้น

## Testing

### Test Case 1: กรอกเงินดาวน์ปกติ
```
Input: 4000000
Expected: Max Loan แสดงค่าที่ถูกต้อง
```

### Test Case 2: กรอกเงินดาวน์น้อยกว่า 10%
```
Input: 100000 (น้อยกว่า 10% ของ 3,800,000)
Expected: แสดงคำเตือน "Minimum 10% down payment required"
```

### Test Case 3: กรอกค่าไม่ถูกต้อง
```
Input: -1000 หรือ 0
Expected: ปุ่ม Calculate disabled
```

### Test Case 4: กด Enter
```
Input: 4000000
Action: กด Enter
Expected: คำนวณทันที
```

### Test Case 5: Blur
```
Input: 4000000
Action: คลิกที่อื่น
Expected: คำนวณทันที
```

## Summary

แก้ไขปัญหา NaN โดย:
1. ✅ เอา auto-calculate (useEffect) ออก
2. ✅ เพิ่มปุ่ม Calculate
3. ✅ เพิ่ม Enter และ Blur trigger
4. ✅ เพิ่ม Loading state
5. ✅ เพิ่ม Validation
6. ✅ เพิ่ม Error handling

ตอนนี้ Max Loan Amount จะแสดงค่าที่ถูกต้องเสมอ! 🎉
