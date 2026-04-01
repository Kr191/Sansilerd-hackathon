# คู่มือการใช้งาน Simulator

## ภาพรวม

Simulator เป็นฟีเจอร์ที่ช่วยให้ผู้ใช้สามารถวิเคราะห์การลงทุนอสังหาริมทรัพย์อย่างละเอียด โดยแบ่งออกเป็น 3 ขั้นตอนหลัก:

1. **Simulator View** - แสดงรายละเอียดโครงการและแนวโน้มมูลค่า
2. **Investment Lab** - คำนวณสินเชื่อและจำลองการลงทุน
3. **AI Verdict** - แสดงผลการวิเคราะห์และคำแนะนำจาก AI

---

## การเข้าถึง Simulator

### วิธีที่ 1: จากหน้า Discovery
1. กรอกข้อมูลในฟอร์ม Discovery (งบประมาณ, รายได้, รายจ่าย)
2. ดูรายการโครงการที่แนะนำ (Top 5)
3. คลิกที่โครงการที่สนใจ
4. ระบบจะนำไปหน้า Simulator พร้อมข้อมูลที่กรอกไว้

### วิธีที่ 2: Direct URL
```
/simulator/[propertyId]?income=150000&expense=50000
```

---

## ขั้นตอนที่ 1: Simulator View

### ข้อมูลที่แสดง:

#### 1. Property Header
- รูปภาพโครงการ
- ชื่อโครงการ
- ที่อยู่ (location, province)
- Badge "PREMIUM LISTING"

#### 2. Valuation Range
- ราคาปัจจุบัน (เช่น ฿12.4M)
- อัตราการเติบโต 5 ปี (เช่น +14.2% YOY Growth)

#### 3. Property Images
- รูปภาพโครงการ 2 รูป
- แสดง "+12 Photos" สำหรับรูปเพิ่มเติม

#### 4. Location Trend Analytics
- **5-Year Gain**: แสดงเปอร์เซ็นต์การเติบโตใน 5 ปี
- **10-Year Gain**: แสดงเปอร์เซ็นต์การเติบโตใน 10 ปี
- **Projected Market Value (10Y)**: มูลค่าที่คาดการณ์ใน 10 ปี
- **Growth Chart**: กราฟแสดงแนวโน้มการเติบโต

#### 5. Area Highlights
- **BTS/MRT**: ระยะทางและข้อมูลการเดินทาง
- **Shopping Malls**: ห้างสรรพสินค้าใกล้เคียง
- **Hospital**: โรงพยาบาลใกล้เคียง

#### 6. Investment Blueprint
- **Gross Rental Yield**: ผลตอบแทนจากค่าเช่า (%)
- **Net Monthly Cashflow**: กระแสเงินสดรายเดือน (฿)
- **Occupancy Rate**: อัตราการเข้าพัก (%)

#### 7. ปุ่ม "Simulate This Investment"
- คลิกเพื่อไปขั้นตอนถัดไป (Investment Lab)

---

## ขั้นตอนที่ 2: Investment Lab

### ข้อมูลที่แสดง:

#### 1. Loan Assessment
- **Monthly Income**: รายได้รายเดือน (ดึงจาก Discovery Form)
- **Monthly Expenses**: รายจ่ายรายเดือน (ดึงจาก Discovery Form)
- **Available Down Payment**: ให้ผู้ใช้กรอก (ขั้นต่ำ 10% ของราคา)
- **Max Loan Amount**: วงเงินกู้สูงสุด (คำนวณจาก DTI)
- **Status Badge**: "PASSED/QUALIFIED" ถ้าผ่านเกณฑ์

#### 2. Loan Calculation
- คำนวณอัตโนมัติเมื่อกรอก Down Payment
- แสดงวงเงินกู้สูงสุดในรูปแบบ Circular Progress
- แสดง Debt-to-Income Ratio (DTI)

#### 3. Get AI Verdict Section
- ปุ่ม "Get AI Verdict" สีน้ำเงิน
- คำอธิบาย: "Our AI analyzes over 45 variables..."

#### 4. Investment Simulation
- **Property Price**: ราคาโครงการ
- **Down Payment**: เงินดาวน์ที่กรอก
- **Interest Rate**: อัตราดอกเบี้ย (4.2%)
- **Tenure**: ระยะเวลากู้ (30 Years)
- **Estimated Monthly Payment**: ค่าผ่อนรายเดือน
- **ROI Estimate**: ผลตอบแทนคาดการณ์
- **Payback Period**: ระยะเวลาคืนทุน

#### 5. Market Sentiment
- ข้อมูลเปรียบเทียบกับตลาด
- "Currently undervalued by 4.2%"

#### 6. Scenarios
- **Conservative**: สถานการณ์แบบระมัดระวัง
- **Optimistic**: สถานการณ์แบบมองโลกในแง่ดี

#### 7. Property Insights
- ข้อมูลเชิงลึกเกี่ยวกับโครงการ
- ปุ่ม "Historical Data" และ "Required Analysis"

---

## ขั้นตอนที่ 3: AI Verdict

### ข้อมูลที่แสดง:

#### 1. The AI Verdict Card
- **Icon**: เครื่องหมายถูก (CheckCircle) สีเขียว
- **Status Badge**: "Recommended" หรือ "Not Recommended"
- **Summary**: สรุปผลการวิเคราะห์เป็นภาษาไทย
  - "ROI สูงกว่าค่าเฉลี่ยตลาด 1.5%"
  - "เหมาะกับงบประมาณ"
  - "ทำเลดีมีศักยภาพเติบโต"
  - "วงเงินกู้ของคุณครอบคลุม 100%"
- **ปุ่ม "Proceed to Purchase"**: สีน้ำเงิน

#### 2. Investment Metrics
- **Expected ROI**: ผลตอบแทนคาดการณ์ (%)
  - แสดงเปรียบเทียบกับตลาด (+1.5% vs Market)
- **Monthly Payment**: ค่าผ่อนรายเดือน (฿)
- **Risk Level**: ระดับความเสี่ยง (Low/Medium/High)

#### 3. 5-Year Cashflow Projection
- กราฟแท่งแสดงกระแสเงินสด 5 ปี
- แยกเป็น RENT และ EXPENSES
- แสดง Y1, Y2, Y3, Y4, Y5

#### 4. Exit Strategy & Wealth Alert
- **Target Selling Profit**: เป้าหมายกำไร (+20%)
- **Alert Status**: สถานะการแจ้งเตือน
- **ปุ่ม "Modify Strategy"**: ปรับกลยุทธ์
- **ปุ่ม "Review Market"**: ทบทวนตลาด

#### 5. Recommended Next Range
- Circular Progress แสดงค่าเช่าแนะนำ
- "Optimized for 95% Occupancy Rate"

#### 6. Action Buttons
- **"Add to Portfolio"**: เพิ่มเข้า Portfolio
- **"Download Analysis PDF"**: ดาวน์โหลดรายงาน

---

## Flow การใช้งาน

```
Discovery Form
    ↓ (กรอกข้อมูล: income, expense, budget, location)
Property Matches (Top 5)
    ↓ (คลิกโครงการที่สนใจ)
Simulator View
    ↓ (ดูรายละเอียดโครงการ + แนวโน้ม)
    ↓ (คลิก "Simulate This Investment")
Investment Lab
    ↓ (กรอก Down Payment)
    ↓ (ดูการคำนวณสินเชื่อ)
    ↓ (คลิก "Get AI Verdict")
AI Verdict
    ↓ (ดูผลการวิเคราะห์)
    ↓ (เลือก Action: Purchase / Add to Portfolio / Download PDF)
```

---

## API Endpoints ที่ใช้

### 1. GET /api/projects?id={propertyId}
ดึงข้อมูลโครงการเดี่ยว

**Response:**
```json
{
  "id": "sns002",
  "name": "The Monument Thong Lo",
  "price": 12400000,
  "location": "Thong Lo",
  "district": "Watthana",
  "province": "Bangkok",
  ...
}
```

### 2. POST /api/analyze
คำนวณสินเชื่อ

**Request:**
```json
{
  "income": 150000,
  "expense": 50000,
  "down_payment": 3000000
}
```

**Response:**
```json
{
  "qualified": true,
  "max_loan": 18000000,
  "dti": 28.5,
  "recommendation": "..."
}
```

### 3. POST /api/simulate
จำลองการลงทุน

**Request:**
```json
{
  "property_id": "sns002",
  "down_payment": 3000000,
  "loan_amount": 18000000,
  "monthly_income": 150000,
  "monthly_expense": 50000
}
```

**Response:**
```json
{
  "monthly_payment": 24500,
  "total_interest": 5200000,
  "roi": 8.4,
  "payback_period": 8,
  ...
}
```

### 4. POST /api/verdict
ขอคำแนะนำจาก AI

**Request:**
```json
{
  "property_id": "sns002",
  "simulation": { ... },
  "user_profile": {
    "income": 150000,
    "expense": 50000,
    "down_payment": 3000000
  }
}
```

**Response:**
```json
{
  "decision": "recommended",
  "confidence": 85,
  "roi": 8.4,
  "riskLevel": "low",
  "reasons": [...]
}
```

---

## การทดสอบ

### 1. เปิด Development Server
```bash
npm run dev
```

### 2. ทดสอบผ่าน Web UI
1. ไปที่ http://localhost:3000
2. กรอกข้อมูลใน Discovery Form
3. เลือกโครงการ
4. ทดสอบทุกขั้นตอนใน Simulator

### 3. ทดสอบ Direct URL
```bash
# ทดสอบโครงการ The Monument Thong Lo
http://localhost:3000/simulator/sns002?income=150000&expense=50000
```

---

## หมายเหตุ

1. **Down Payment ขั้นต่ำ**: 10% ของราคาโครงการ
2. **DTI Ratio**: ควรไม่เกิน 40% เพื่อผ่านเกณฑ์
3. **Interest Rate**: ใช้ค่าเริ่มต้น 4.2%
4. **Tenure**: ใช้ค่าเริ่มต้น 30 ปี
5. **Responsive Design**: รองรับทั้ง Mobile และ Desktop

---

## ตัวอย่างการใช้งาน

### Scenario 1: ผู้ใช้มีรายได้ 150,000 บาท
- Monthly Income: 150,000
- Monthly Expense: 50,000
- Down Payment: 3,000,000 (24% ของ 12.4M)
- Max Loan: ~18,000,000
- Monthly Payment: ~24,500
- DTI: ~28.5%
- Result: ✅ Recommended

### Scenario 2: ผู้ใช้มีรายได้ 80,000 บาท
- Monthly Income: 80,000
- Monthly Expense: 30,000
- Down Payment: 500,000 (15% ของ 3.2M)
- Max Loan: ~2,700,000
- Monthly Payment: ~11,500
- DTI: ~35%
- Result: ✅ Recommended (แต่ต้องระวังความเสี่ยง)
