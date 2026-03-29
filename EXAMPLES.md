# ตัวอย่าง Input และ Expected Output

## ตัวอย่างที่ 1: เขตที่มีโครงการเยอะ (Watthana - มี 3 โครงการ)

### Input:
```json
{
  "budget_min": 5000000,
  "budget_max": 20000000,
  "goal": "rent",
  "location": "Watthana",
  "income": 150000,
  "expense": 50000,
  "down_payment": 3000000
}
```

### Expected Output:
- จะได้ **5 โครงการ**:
  1. **3 โครงการในเขต Watthana** (The Monument Thong Lo, KHUN by YOO Thonglor, The Esse Sukhumvit 36)
  2. **2 โครงการใกล้เคียง** จากเขตข้างเคียง เช่น:
     - Phra Khanong (The Base Sukhumvit 77)
     - Pathum Wan (The Esse Asoke)
     - Khlong Toei (The Monument Sanampao)

---

## ตัวอย่างที่ 2: เขตที่มีโครงการน้อย (Huai Khwang - มี 1 โครงการ)

### Input:
```json
{
  "budget_min": 2000000,
  "budget_max": 5000000,
  "goal": "flip",
  "location": "Huai Khwang",
  "income": 80000,
  "expense": 30000,
  "down_payment": 500000
}
```

### Expected Output:
- จะได้ **5 โครงการ**:
  1. **1 โครงการในเขต Huai Khwang** (The Base Rama 9)
  2. **4 โครงการใกล้เคียง** จากเขตข้างเคียงใน Bangkok เช่น:
     - Din Daeng (The Line Ratchaprarop)
     - Ratchathewi (The Line Ratchathewi)
     - Wang Thonglang (The Base Ladprao)
     - Bang Kapi (The Base Ramkhamhaeng)

---

## ตัวอย่างที่ 3: จังหวัดที่มีโครงการน้อย (Phuket - มี 2 โครงการ)

### Input:
```json
{
  "budget_min": 8000000,
  "budget_max": 15000000,
  "goal": "rent",
  "location": "Phuket",
  "income": 200000,
  "expense": 60000,
  "down_payment": 2000000
}
```

### Expected Output:
- จะได้ **5 โครงการ**:
  1. **2 โครงการใน Phuket** (Baan Mai Khao, Baan Layan)
  2. **3 โครงการใกล้เคียง** จากจังหวัดอื่นที่ใกล้หรือมีลักษณะคล้ายกัน เช่น:
     - Chonburi (The Riviera Monaco, The Riviera Jomtien)
     - หรือโครงการ premium อื่นๆ ใน Bangkok

---

## ตัวอย่างที่ 4: ไม่ระบุพื้นที่ (ทั่วประเทศ)

### Input:
```json
{
  "budget_min": 1500000,
  "budget_max": 3000000,
  "goal": "rent",
  "location": "",
  "income": 60000,
  "expense": 25000,
  "down_payment": 300000
}
```

### Expected Output:
- จะได้ **5 โครงการที่ดีที่สุด** จากทั่วประเทศตามคะแนน AI:
  1. โครงการที่มี rental yield สูง
  2. โครงการที่ราคาเหมาะสมกับงบประมาณ
  3. โครงการที่มี location score ดี
  4. โครงการที่มี liquidity score สูง
  5. โครงการที่มี occupancy rate สูง

---

## ตัวอย่างที่ 5: เขตที่ไม่มีโครงการเลย (เช่น Min Buri)

### Input:
```json
{
  "budget_min": 2000000,
  "budget_max": 4000000,
  "goal": "flip",
  "location": "Min Buri",
  "income": 70000,
  "expense": 28000,
  "down_payment": 400000
}
```

### Expected Output:
- จะได้ **5 โครงการใกล้เคียง** จากเขตข้างเคียงใน Bangkok:
  1. Lat Phrao (The Base Saphanmai)
  2. Khlong Sam Wa (SHAA Residence Khlong Sam Wa)
  3. Saphan Sung (SHAA Residence Saphan Sung)
  4. Bueng Kum (The Base Serithai)
  5. Bang Kapi (The Base Ramkhamhaeng)

---

## โครงสร้าง Response

```json
{
  "matches": [
    {
      "id": "sns002",
      "name": "The Monument Thong Lo",
      "price": 12400000,
      "pricePerSqm": 180000,
      "location": "Thong Lo",
      "district": "Watthana",
      "province": "Bangkok",
      "type": "condo",
      "size": 68.8,
      "bedrooms": 2,
      "bathrooms": 2,
      "nearBTS": "Thong Lo",
      "amenities": ["Infinity Pool", "Sky Lounge", "Fitness", "Concierge", "Library"],
      "rentalYield": 4.5,
      "match_score": 92,
      "short_reason": "ทำเลดีเยี่ยมใกล้ BTS • ผลตอบแทนจากค่าเช่าดี • โครงการ premium คุณภาพสูง",
      "premium": true,
      "riskLevel": "low"
    },
    {
      "id": "sns003",
      "name": "KHUN by YOO Thonglor",
      "price": 18500000,
      "match_score": 88,
      "short_reason": "โครงการ luxury ระดับโลก • ทำเลเป็นที่ต้องการสูง • มูลค่าเพิ่มระยะยาว",
      "premium": true,
      "riskLevel": "low"
    },
    {
      "id": "sns019",
      "name": "The Esse Sukhumvit 36",
      "price": 13800000,
      "match_score": 85,
      "short_reason": "ใกล้ BTS Thong Lo • สิ่งอำนวยความสะดวกครบครัน • โครงการใกล้เคียงพื้นที่ที่เลือก",
      "premium": false,
      "riskLevel": "low"
    }
    // ... อีก 2 โครงการ
  ]
}
```

---

## หมายเหตุ

1. **คะแนน match_score** จะอยู่ระหว่าง 0-100
   - 85+ = Premium (แนะนำสูง)
   - 70-84 = Good (แนะนำ)
   - 50-69 = Fair (พอใช้)

2. **โครงการใกล้เคียง** จะมีข้อความ "โครงการใกล้เคียงพื้นที่ที่เลือก" ใน short_reason

3. **การเรียงลำดับ** จะเรียงตาม match_score จากมากไปน้อย

4. **riskLevel** ประเมินจาก:
   - low: โครงการมั่นคง ทำเลดี occupancy rate สูง
   - medium: โครงการปานกลาง มีความเสี่ยงบ้าง
   - high: โครงการใหม่ ทำเลห่างไกล หรือราคาสูงเกินไป
