# วิธีทดสอบ Matching Engine

## เริ่มต้น

1. เปิด development server:
```bash
cd Sansilerd-hackathon
npm run dev
```

2. เปิด terminal ใหม่และรันการทดสอบ:
```bash
# ทดสอบทั้งหมด
node test-matching.js

# ทดสอบเฉพาะ case ที่ต้องการ (1-5)
node test-matching.js 1
node test-matching.js 2
```

---

## ทดสอบผ่าน API โดยตรง

### ตัวอย่างที่ 1: เขต Watthana (มี 3 โครงการ)

```bash
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "budget_min": 5000000,
    "budget_max": 20000000,
    "goal": "rent",
    "location": "Watthana",
    "income": 150000,
    "expense": 50000,
    "down_payment": 3000000
  }'
```

**Expected Result:**
- ได้ 5 โครงการ
- 3 โครงการในเขต Watthana (The Monument Thong Lo, KHUN by YOO Thonglor, The Esse Sukhumvit 36)
- 2 โครงการใกล้เคียงจากเขตข้างเคียง

---

### ตัวอย่างที่ 2: เขต Huai Khwang (มี 1 โครงการ)

```bash
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "budget_min": 2000000,
    "budget_max": 5000000,
    "goal": "flip",
    "location": "Huai Khwang",
    "income": 80000,
    "expense": 30000,
    "down_payment": 500000
  }'
```

**Expected Result:**
- ได้ 5 โครงการ
- 1 โครงการในเขต Huai Khwang (The Base Rama 9)
- 4 โครงการใกล้เคียงจากเขตข้างเคียง (Din Daeng, Ratchathewi, Wang Thonglang, Bang Kapi)
- โครงการที่เติมเต็มจะมีข้อความ "โครงการใกล้เคียงพื้นที่ที่เลือก" ใน short_reason

---

### ตัวอย่างที่ 3: จังหวัด Phuket (มี 2 โครงการ)

```bash
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "budget_min": 8000000,
    "budget_max": 15000000,
    "goal": "rent",
    "location": "Phuket",
    "income": 200000,
    "expense": 60000,
    "down_payment": 2000000
  }'
```

**Expected Result:**
- ได้ 5 โครงการ
- 2 โครงการใน Phuket (Baan Mai Khao, Baan Layan)
- 3 โครงการใกล้เคียงจากจังหวัดอื่น

---

### ตัวอย่างที่ 4: ไม่ระบุพื้นที่

```bash
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "budget_min": 1500000,
    "budget_max": 3000000,
    "goal": "rent",
    "location": "",
    "income": 60000,
    "expense": 25000,
    "down_payment": 300000
  }'
```

**Expected Result:**
- ได้ 5 โครงการที่ดีที่สุดจากทั่วประเทศ
- เรียงตามคะแนน AI (rental yield, location score, liquidity)

---

### ตัวอย่างที่ 5: เขต Lat Phrao (มี 1 โครงการ)

```bash
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "budget_min": 1500000,
    "budget_max": 3000000,
    "goal": "flip",
    "location": "Lat Phrao",
    "income": 70000,
    "expense": 28000,
    "down_payment": 400000
  }'
```

**Expected Result:**
- ได้ 5 โครงการ
- 1 โครงการในเขต Lat Phrao (The Base Saphanmai)
- 4 โครงการใกล้เคียงจากเขตข้างเคียง

---

## ทดสอบผ่าน Web UI

1. เปิดเบราว์เซอร์ไปที่ http://localhost:3000
2. กรอกข้อมูลในฟอร์ม Discovery
3. กด "ค้นหาโครงการ"
4. ดูผลลัพธ์ที่แสดง 5 โครงการ

---

## การตรวจสอบผลลัพธ์

### ✅ สิ่งที่ควรเห็น:

1. **จำนวนโครงการ**: ควรได้ 5 โครงการเสมอ (ถ้ามีโครงการในระบบ)

2. **โครงการในพื้นที่ที่เลือก**: แสดงก่อน
   - คะแนน match_score สูง (85+)
   - ไม่มีข้อความ "โครงการใกล้เคียงพื้นที่ที่เลือก"

3. **โครงการใกล้เคียง**: แสดงทีหลัง
   - คะแนน match_score ลดลงเล็กน้อย (คูณ 0.9)
   - มีข้อความ "โครงการใกล้เคียงพื้นที่ที่เลือก" ใน short_reason

4. **การเรียงลำดับ**: เรียงตาม match_score จากมากไปน้อย

5. **ข้อมูลครบถ้วน**: แต่ละโครงการมี
   - ชื่อโครงการ
   - ที่อยู่ (district, province)
   - ราคา
   - คะแนน match_score
   - เหตุผลการแนะนำ (short_reason)
   - riskLevel

---

## Debug Tips

### ถ้าได้โครงการน้อยกว่า 5:

1. เช็คว่ามีโครงการในระบบที่ตรงกับงบประมาณหรือไม่
2. ลองขยายช่วงงบประมาณ (budget_min, budget_max)
3. ลองไม่ระบุ location เพื่อดูโครงการทั้งหมด

### ถ้าไม่มีโครงการใกล้เคียง:

1. เช็คว่าโครงการมี coordinates หรือไม่
2. เช็คว่ามีโครงการในจังหวัดเดียวกันหรือไม่
3. ดูใน console log ว่ามี error หรือไม่

### ถ้า API ไม่ทำงาน:

1. เช็คว่า dev server รันอยู่หรือไม่
2. เช็ค port ว่าเป็น 3000 หรือไม่
3. ดู console log ใน terminal

---

## ข้อมูลเพิ่มเติม

- ดูรายละเอียดโครงการทั้งหมดใน `lib/sansiriData.ts`
- ดู logic การ match ใน `lib/matchingEngine.ts`
- ดู AI scoring ใน `lib/aiAgent.ts`
