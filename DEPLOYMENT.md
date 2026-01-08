# My Village - Deployment Guide 🚀

คู่มือการ Deploy My Village บน Vercel

---

## 📋 Pre-Deployment Checklist

### 1. GitHub Repository Setup
- [ ] Push code to GitHub
- [ ] CI/CD tests passing (green checkmark)
- [ ] No pending merge conflicts

### 2. Vercel Account Setup
- [ ] สมัคร Vercel: https://vercel.com
- [ ] เชื่อมต่อ GitHub account
- [ ] Import project จาก GitHub

---

## 🔐 Required Environment Variables

ตั้งค่าใน **Vercel Dashboard → Project Settings → Environment Variables**

### Database (Required)
```
DATABASE_URL=postgresql://user:password@host:5432/database
```
> 💡 สมัคร Neon: https://neon.tech (Free tier: 512MB storage)

### Authentication (Required)
```
AUTH_SECRET=<generate-with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.vercel.app
```

### File Upload (Required)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
> 💡 สมัคร Cloudinary: https://cloudinary.com (Free tier: 25GB)

### Email (Required for notifications)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=My Village <noreply@myvillage.com>
```
> 💡 สร้าง App Password: https://myaccount.google.com/apppasswords

### Push Notifications (Optional)
```
NEXT_PUBLIC_ONESIGNAL_APP_ID=your-app-id
ONESIGNAL_REST_API_KEY=your-api-key
```
> 💡 สมัคร OneSignal: https://onesignal.com

### Analytics & Monitoring (Optional)
```
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🔑 GitHub Secrets (สำหรับ Auto-Deploy)

ตั้งค่าใน **GitHub → Repository Settings → Secrets and variables → Actions**

| Secret | วิธีรับ |
|--------|--------|
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | จาก `.vercel/project.json` หลังจาก `vercel link` |
| `VERCEL_PROJECT_ID` | จาก `.vercel/project.json` หลังจาก `vercel link` |

### วิธีรับ VERCEL_ORG_ID และ VERCEL_PROJECT_ID
```bash
# ติดตั้ง Vercel CLI
bun add -g vercel

# เชื่อมต่อ project
vercel link

# ดู IDs
cat .vercel/project.json
```

---

## 🚀 Deployment Steps

### First Time Setup

1. **Import Project บน Vercel**
   - ไป https://vercel.com/new
   - Import repository จาก GitHub
   - Vercel จะ detect Next.js อัตโนมัติ

2. **ตั้งค่า Environment Variables**
   - Copy ทุก variable จากด้านบนไปใส่ใน Vercel Dashboard
   - ตั้งค่าสำหรับ Production, Preview, และ Development

3. **Deploy**
   - Click "Deploy" บน Vercel Dashboard
   - หรือ push to main branch

4. **Setup Database**
   ```bash
   # หลัง deploy สำเร็จ ให้รัน migration
   bun run db:push
   
   # Seed ข้อมูลเริ่มต้น (optional)
   bun run db:seed
   ```

### Subsequent Deployments
- Push to `main` branch → Auto-deploy to production
- Open Pull Request → Preview deployment

---

## ✅ Post-Deployment Verification

หลัง deploy สำเร็จ ให้ตรวจสอบ:

1. **Health Check**: `https://your-domain.vercel.app/api/health`
2. **API Docs**: `https://your-domain.vercel.app/api/swagger`
3. **Login**: ทดสอบ login/logout
4. **Database**: ตรวจสอบว่าข้อมูลแสดงถูกต้อง

---

## 🔧 Troubleshooting

### Build Failed
```
Error: Cannot find module 'xxx'
```
→ ตรวจสอบ `package.json` ว่า dependencies ครบ

### Database Connection Failed
```
Error: Connection refused
```
→ ตรวจสอบ `DATABASE_URL` ใน Vercel Environment Variables

### Authentication Error
```
Error: AUTH_SECRET is not set
```
→ เพิ่ม `AUTH_SECRET` ใน Vercel Environment Variables

---

## 📊 Monitoring

- **Logs**: Vercel Dashboard → Deployments → Functions
- **Errors**: Sentry Dashboard (ถ้าตั้งค่าไว้)
- **Analytics**: Google Analytics Dashboard

---

## 🔒 Security Notes

- ❌ อย่า commit `.env.local` ไปบน GitHub
- ✅ ใช้ Vercel Environment Variables สำหรับ secrets
- ✅ ใช้ `AUTH_SECRET` ที่ยาวและ random
- ✅ ใช้ HTTPS เสมอ (Vercel ทำให้อัตโนมัติ)
