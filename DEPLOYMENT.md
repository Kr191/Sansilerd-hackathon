# 🚀 Deployment Guide - Render.com

คู่มือการ deploy โปรเจค Sansilerd Hackathon บน Render.com

## 📋 Prerequisites

- Git repository (GitHub, GitLab, หรือ Bitbucket)
- บัญชี Render.com (สมัครฟรีที่ https://render.com)
- Docker installed (สำหรับทดสอบ local)

## 🐳 ทดสอบ Docker ใน Local

### 1. Build Docker Image

```bash
cd Sansilerd-hackathon
docker build -t sansilerd-app .
```

### 2. Run Container

```bash
docker run -p 3000:3000 sansilerd-app
```

### 3. หรือใช้ Docker Compose

```bash
docker-compose up
```

เปิดเบราว์เซอร์ที่ http://localhost:3000

### 4. Stop Container

```bash
docker-compose down
```

## 🌐 Deploy บน Render.com

### วิธีที่ 1: ใช้ Render Blueprint (แนะนำ)

1. **Push โค้ดขึ้น Git Repository**
   ```bash
   git add .
   git commit -m "Add Docker configuration"
   git push origin main
   ```

2. **เข้า Render Dashboard**
   - ไปที่ https://dashboard.render.com
   - คลิก "New" → "Blueprint"

3. **เชื่อมต่อ Repository**
   - เลือก repository ของคุณ
   - Render จะอ่าน `render.yaml` อัตโนมัติ

4. **Deploy**
   - คลิก "Apply"
   - รอ build และ deploy (ประมาณ 5-10 นาที)

### วิธีที่ 2: Manual Setup

1. **สร้าง Web Service ใหม่**
   - ไปที่ https://dashboard.render.com
   - คลิก "New" → "Web Service"

2. **เชื่อมต่อ Repository**
   - เลือก repository ของคุณ
   - Branch: `main` (หรือ branch ที่ต้องการ)

3. **ตั้งค่า Service**
   ```
   Name: sansilerd-hackathon
   Region: Singapore (หรือใกล้ที่สุด)
   Branch: main
   Runtime: Docker
   Instance Type: Free
   ```

4. **Environment Variables** (ถ้ามี)
   ```
   NODE_ENV=production
   PORT=3000
   ```

5. **Deploy**
   - คลิก "Create Web Service"
   - รอ build และ deploy

## 📊 หลังจาก Deploy

### ตรวจสอบสถานะ

- ไปที่ Render Dashboard
- ดู Logs เพื่อตรวจสอบว่า deploy สำเร็จ
- URL ของแอปจะอยู่ที่ `https://your-app-name.onrender.com`

### Auto Deploy

Render จะ auto deploy ทุกครั้งที่คุณ push โค้ดใหม่ขึ้น Git

### Custom Domain (Optional)

1. ไปที่ Settings → Custom Domain
2. เพิ่ม domain ของคุณ
3. ตั้งค่า DNS ตามที่ Render แนะนำ

## 🔧 Troubleshooting

### Build Failed

1. ตรวจสอบ Logs ใน Render Dashboard
2. ทดสอบ build ใน local ก่อน:
   ```bash
   docker build -t test-app .
   ```

### App ไม่ทำงาน

1. ตรวจสอบ Environment Variables
2. ดู Runtime Logs
3. ตรวจสอบว่า PORT ถูกต้อง (Render ใช้ PORT env variable)

### Out of Memory

- Free tier มี RAM จำกัด (512MB)
- พิจารณา upgrade เป็น Starter plan ($7/month)

## 💰 Pricing

### Free Tier
- ✅ 750 hours/month
- ✅ Auto-sleep หลังไม่มีการใช้งาน 15 นาที
- ✅ เหมาะสำหรับ demo และ testing
- ⚠️ Cold start อาจใช้เวลา 30-60 วินาที

### Starter Plan ($7/month)
- ✅ ไม่มี auto-sleep
- ✅ RAM มากขึ้น (1GB)
- ✅ เหมาะสำหรับ production

## 📝 Files สำหรับ Deployment

```
Sansilerd-hackathon/
├── Dockerfile              # Docker configuration
├── .dockerignore          # Files to ignore in Docker
├── docker-compose.yml     # Local Docker testing
├── render.yaml            # Render.com blueprint
└── next.config.js         # Next.js config (standalone mode)
```

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Docker Documentation](https://docs.docker.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🎯 Quick Commands

```bash
# Local testing
docker-compose up

# Build only
docker build -t sansilerd-app .

# Run with custom port
docker run -p 8080:3000 sansilerd-app

# View logs
docker logs <container-id>

# Stop all containers
docker-compose down
```

## ✅ Checklist

- [ ] Push โค้ดขึ้น Git
- [ ] ทดสอบ Docker ใน local
- [ ] สร้าง Render account
- [ ] Deploy ด้วย Blueprint หรือ Manual
- [ ] ตรวจสอบ URL ที่ได้
- [ ] ทดสอบ features ทั้งหมด
- [ ] ตั้งค่า custom domain (ถ้าต้องการ)

---

Happy Deploying! 🚀
