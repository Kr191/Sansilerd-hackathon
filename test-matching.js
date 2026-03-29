// Test script สำหรับทดสอบ matching engine
// รันด้วย: node test-matching.js

const testCases = [
  {
    name: "ตัวอย่างที่ 1: เขต Watthana (มี 3 โครงการ)",
    input: {
      budget_min: 5000000,
      budget_max: 20000000,
      goal: "rent",
      location: "Watthana",
      income: 150000,
      expense: 50000,
      down_payment: 3000000
    }
  },
  {
    name: "ตัวอย่างที่ 2: เขต Huai Khwang (มี 1 โครงการ)",
    input: {
      budget_min: 2000000,
      budget_max: 5000000,
      goal: "flip",
      location: "Huai Khwang",
      income: 80000,
      expense: 30000,
      down_payment: 500000
    }
  },
  {
    name: "ตัวอย่างที่ 3: จังหวัด Phuket (มี 2 โครงการ)",
    input: {
      budget_min: 8000000,
      budget_max: 15000000,
      goal: "rent",
      location: "Phuket",
      income: 200000,
      expense: 60000,
      down_payment: 2000000
    }
  },
  {
    name: "ตัวอย่างที่ 4: ไม่ระบุพื้นที่",
    input: {
      budget_min: 1500000,
      budget_max: 3000000,
      goal: "rent",
      location: "",
      income: 60000,
      expense: 25000,
      down_payment: 300000
    }
  },
  {
    name: "ตัวอย่างที่ 5: เขต Lat Phrao (มี 1 โครงการ)",
    input: {
      budget_min: 1500000,
      budget_max: 3000000,
      goal: "flip",
      location: "Lat Phrao",
      income: 70000,
      expense: 28000,
      down_payment: 400000
    }
  }
]

async function testMatching() {
  console.log("=".repeat(80))
  console.log("🧪 ทดสอบ Matching Engine")
  console.log("=".repeat(80))
  console.log()

  for (const testCase of testCases) {
    console.log("📋", testCase.name)
    console.log("-".repeat(80))
    console.log("Input:", JSON.stringify(testCase.input, null, 2))
    console.log()
    
    try {
      const response = await fetch('http://localhost:3000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.input)
      })
      
      const result = await response.json()
      
      console.log(`✅ ได้ ${result.matches?.length || 0} โครงการ:`)
      console.log()
      
      if (result.matches) {
        result.matches.forEach((match, index) => {
          console.log(`${index + 1}. ${match.name}`)
          console.log(`   📍 ${match.district}, ${match.province}`)
          console.log(`   💰 ราคา: ${match.price.toLocaleString()} บาท`)
          console.log(`   ⭐ คะแนน: ${match.match_score.toFixed(1)}`)
          console.log(`   📝 ${match.short_reason}`)
          console.log()
        })
      }
      
    } catch (error) {
      console.log("❌ Error:", error.message)
      console.log("💡 กรุณาเปิด dev server ด้วย: npm run dev")
    }
    
    console.log()
    console.log("=".repeat(80))
    console.log()
  }
}

// เช็คว่ามี argument หรือไม่
const testIndex = process.argv[2]
if (testIndex) {
  const index = parseInt(testIndex) - 1
  if (index >= 0 && index < testCases.length) {
    console.log(`Running test case ${testIndex}...`)
    testMatching = async () => {
      const testCase = testCases[index]
      console.log("=".repeat(80))
      console.log("🧪", testCase.name)
      console.log("=".repeat(80))
      console.log()
      console.log("Input:", JSON.stringify(testCase.input, null, 2))
      console.log()
      
      try {
        const response = await fetch('http://localhost:3000/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testCase.input)
        })
        
        const result = await response.json()
        
        console.log(`✅ ได้ ${result.matches?.length || 0} โครงการ:`)
        console.log()
        
        if (result.matches) {
          result.matches.forEach((match, index) => {
            console.log(`${index + 1}. ${match.name}`)
            console.log(`   📍 ${match.district}, ${match.province}`)
            console.log(`   💰 ราคา: ${match.price.toLocaleString()} บาท`)
            console.log(`   ⭐ คะแนน: ${match.match_score.toFixed(1)}`)
            console.log(`   📝 ${match.short_reason}`)
            console.log()
          })
        }
        
      } catch (error) {
        console.log("❌ Error:", error.message)
        console.log("💡 กรุณาเปิด dev server ด้วย: npm run dev")
      }
    }
  }
}

testMatching()
