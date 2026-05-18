# 🚀 OSON ISH — Production Deploy Yo'riqnomasi

Bu yo'riqnoma loyihani **noldan production'ga chiqarish**ni qadam-baqadam ko'rsatadi.

**Yutuq:**
- Backend → Render.com (Django + Daphne + PostgreSQL)
- Frontend → Vercel.com (React + Vite)
- Media fayllar → Cloudflare R2 (avatar, logo)
- Email → Brevo SMTP
- AI → Google Gemini

**Hammasi BEPUL** — diplom himoyasi uchun yetarli.

---

## ✅ Tekshiruv ro'yxati (oldindan)

Quyidagilarning hammasi bo'lishi kerak:

- [ ] **Git** o'rnatilgan ([git-scm.com](https://git-scm.com/download/win))
- [ ] **GitHub** akkaunti ([github.com/signup](https://github.com/signup))
- [ ] **Brevo** akkaunti — `EMAIL_HOST_USER` va `EMAIL_HOST_PASSWORD` mavjud ✅
- [ ] **Gemini API** kaliti — `GEMINI_API_KEY` mavjud ✅
- [ ] **Cloudflare R2** — bucket, kalitlar, public URL mavjud ✅

---

## 1️⃣ GitHub'ga loyihani jo'natish

### 1.1. Lokal Git repozitoriyasi yaratish

PowerShell yoki Git Bash'ni loyiha papkasida oching va ishga tushiring:

```bash
cd C:/Users/Azamat/PycharmProjects/Diplom_project

# Birinchi marta Git ishlatsangiz, sozlash
git config --global user.name "Azamat Saribayev"
git config --global user.email "azamatsaribaev0005@gmail.com"

# Repozitoriyani yaratish
git init
git branch -M main
git add .
git commit -m "Initial commit: OSON ISH job board platform"
```

### 1.2. GitHub'da yangi repozitoriya yaratish

1. [github.com/new](https://github.com/new) ga o'ting
2. To'ldiring:
   - **Repository name:** `osonish`
   - **Description:** `OSON ISH — AI yordamida ish izlash web-platformasi (Diplom loyihasi)`
   - **Public** yoki **Private** (xohlaganingizdek)
   - ❌ **README, .gitignore, license qo'shmang** (bizda allaqachon bor)
3. **Create repository** tugmasini bosing

### 1.3. Lokal kodni GitHub'ga jo'natish

GitHub yaratgan sahifada ko'rsatilgan buyruqlarni ishlatamiz:

```bash
git remote add origin https://github.com/<sizning-username>/osonish.git
git push -u origin main
```

⚠️ **Birinchi push'da GitHub authentication so'raydi:**
- **Username:** GitHub username
- **Password:** GitHub parol emas! **Personal Access Token** kerak
- Token yaratish: [github.com/settings/tokens](https://github.com/settings/tokens) → **Generate new token (classic)** → `repo` scope ni belgilang → Generate
- Token'ni nusxalab, password o'rniga ishlating

**Yoki** osonroq yo'l: **GitHub Desktop** ([desktop.github.com](https://desktop.github.com)) ishlatib, GUI orqali jo'nating.

---

## 2️⃣ Backend deploy — Render.com

### 2.1. Render'ga GitHub orqali kirish

1. [render.com](https://render.com) ga o'ting → **Get started for free**
2. **GitHub** orqali kiring
3. Render'ga GitHub repozitoriyalarga kirish ruxsat bering

### 2.2. Blueprint orqali avtomatik yaratish

Render dashboard'da:

1. **New +** tugmasi (yuqori o'ng) → **Blueprint**
2. GitHub repo'ngizni tanlang (`osonish`)
3. **Render** `render.yaml` faylni o'qiydi va ko'rsatadi:
   - ✅ Web service (Django backend)
   - ✅ PostgreSQL database
4. **Apply** bosing

### 2.3. Maxfiy environment variables qo'shish

Render avtomatik yaratganda **sync: false** belgilangan o'zgaruvchilarni so'raydi. Ularning hammasini to'ldiring:

| O'zgaruvchi | Qiymat |
|-------------|--------|
| `EMAIL_HOST_USER` | `ab5bc8001@smtp-brevo.com` |
| `EMAIL_HOST_PASSWORD` | `xsmtpsib-a2ff3d5b31b67ba21b6b012f68e412cb6695aebb22318a00e27fd86295b73b5b-...` |
| `DEFAULT_FROM_EMAIL` | `azamatsaribaev47@gmail.com` |
| `GEMINI_API_KEY` | `AIzaSyDd3ObQ5nOljG-mEflGkJVNZSzhO_857Uc` |
| `R2_ACCESS_KEY_ID` | `519724a77c425cbf905bd3bbcbdec342` |
| `R2_SECRET_ACCESS_KEY` | `c9f1b2f51d36674f8ab08ccb1465dd9ce3c41edf5ac1ab5f5c141372e8f0c4e3` |
| `R2_BUCKET_NAME` | `smart-ish` |
| `R2_ENDPOINT_URL` | `https://61f1243bce126d545f990fc405d2a916.r2.cloudflarestorage.com` |
| `R2_PUBLIC_URL` | `https://pub-8d7f699da48442fc943d232b65d47068.r2.dev` |
| `CORS_ALLOWED_ORIGINS` | _Hozircha bo'sh qoldiring — Vercel deploy'dan keyin to'ldirasiz_ |
| `FRONTEND_URL` | _Vercel deploy'dan keyin_ |

5. **Save** va kuting — Render avtomatik build qiladi (5-10 daqiqa)

### 2.4. Backend URL'ini olish

Build muvaffaqiyatli tugagandan keyin:
- Dashboard'da `osonish-backend` xizmatini bosing
- URL: `https://osonish-backend.onrender.com` (yoki shunga o'xshash)
- **Bu URL'ni eslab qoling** — frontend'da kerak bo'ladi

### 2.5. Admin yaratish (Render shell)

Render dashboard'da `osonish-backend` → **Shell** ga kiring:

```bash
cd config
python manage.py bootstrap_admin \
    --phone +998900000000 \
    --email admin@osonish.uz \
    --password mySecurePassword123
```

---

## 3️⃣ Frontend deploy — Vercel.com

### 3.1. Vercel'ga GitHub orqali kirish

1. [vercel.com](https://vercel.com) → **Sign Up** → GitHub orqali
2. Vercel'ga GitHub repolarga kirish ruxsat bering

### 3.2. Yangi loyiha import qilish

1. Dashboard → **Add New** → **Project**
2. GitHub repo'ni tanlang (`osonish`)
3. Konfiguratsiya:
   - **Framework Preset:** Vite (avtomatik aniqlanadi)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)

### 3.3. Environment Variables

**Add Environment Variable** tugmasini bosing va kiriting:

| Nom | Qiymat |
|-----|--------|
| `VITE_API_URL` | `https://osonish-backend.onrender.com/api` |

(Render'da olgan URL'ingiz bo'yicha)

### 3.4. Deploy

**Deploy** tugmasini bosing → Vercel build qiladi (~2 daqiqa)

Tugaganda URL: `https://osonish-xxx.vercel.app`

---

## 4️⃣ Backend va Frontend'ni ulash (CORS)

Endi Render'ga qaytib, **CORS_ALLOWED_ORIGINS** ni yangilash kerak:

1. Render dashboard → `osonish-backend` → **Environment**
2. Quyidagilarni yangilang:

| O'zgaruvchi | Qiymat |
|-------------|--------|
| `CORS_ALLOWED_ORIGINS` | `https://osonish-xxx.vercel.app` (Vercel URL'ingiz) |
| `FRONTEND_URL` | `https://osonish-xxx.vercel.app` |

3. **Save changes** → Render avtomatik qayta deploy qiladi

---

## 5️⃣ R2 CORS sozlash (rasm yuklash uchun)

Cloudflare R2 bucket'iga frontend domenidan kirish ruxsati kerak:

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2** → `smart-ish` → **Settings**
2. **CORS Policy** bo'limini toping → **Add**
3. Quyidagilarni kiriting:

```json
[
  {
    "AllowedOrigins": [
      "https://osonish-xxx.vercel.app"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

4. **Save** bosing

---

## 6️⃣ Sinash

### 6.1. Frontend ochilishi
Brauzerda Vercel URL'ingizni oching:
```
https://osonish-xxx.vercel.app
```

Sahifa yuklanishi kerak. Agar bo'sh ekran bo'lsa, Console (F12)'ni ochib xato qarang.

### 6.2. API ulanishi
- Bosh sahifada vakansiyalar ko'rinishi kerak (bo'sh ro'yxat — chunki bazada hali ma'lumot yo'q)
- Console'da **CORS xatosi** bo'lmasligi kerak

### 6.3. Ro'yxatdan o'tish
- Yuqoridagi **Kirish** tugmasi → **Ro'yxatdan o'tish**
- Telefon, email, parol kiriting
- OTP kodni emailingizdan oling → kiritsangiz, login bo'lishi kerak

### 6.4. Avatar yuklash
- **Profil** sahifasiga o'ting
- Rasm yuklang
- Rasm sizning **Cloudflare R2** bucket'ingizda paydo bo'lishi kerak

### 6.5. WebSocket
- Brauzer Console'da: hech qanday WebSocket xatosi bo'lmasligi kerak
- Yangi bildirishnoma kelganda toast chiqishi kerak

---

## 🐛 Muammolarni hal qilish

### Render: "Application failed to respond"
- **Sabab:** Backend uxlagan (free tier 15 daq inactiv bo'lsa)
- **Yechim:** 30-60 sekund kuting — Render avtomatik uyg'otadi
- Brauzerni yangilang

### Render: Build failed
- Dashboard → Logs ni qarang
- Eng tez-tez:
  - `requirements.txt` da paket yo'q
  - Python versiyasi mos kelmaydi
  - Migration xato

### "CORS error" Console'da
- `CORS_ALLOWED_ORIGINS` Render'da to'g'ri to'ldirilganmi tekshiring
- Vercel URL'i **`https://`** bilan boshlanishi kerak
- Render'da save qilgandan keyin **qayta deploy** kuting (3-5 daq)

### Avatar yuklanmayapti
- R2 CORS Policy to'g'ri sozlanganmi
- Brauzer Console'da xato matnini ko'ring

### WebSocket "Connection failed"
- WSS (HTTPS) ishlatilayapti
- Token to'g'rimi (login qilingan bo'lsangiz)

---

## 🔄 Keyingi push'lar (yangilanish)

Kelajakda kodni yangilaganingizda:

```bash
git add .
git commit -m "feat: yangi feature qo'shildi"
git push
```

- **Render** avtomatik backend'ni yangi build qiladi
- **Vercel** avtomatik frontend'ni yangi build qiladi
- Hech narsa qo'lda qilish kerak emas

---

## 📊 Bepul tier cheklovlari

| Servis | Limit | E'tibor |
|--------|-------|---------|
| Render Web | 750h/oy | 15 daq inactiv bo'lsa uxlaydi |
| Render PostgreSQL | 90 kun | Keyin to'lov kerak yoki yangi DB |
| Vercel | Cheksiz | Bepul tier oxiri yo'q |
| Cloudflare R2 | 10 GB/oy | Demo uchun yetarli |
| Brevo email | 300/kun | Diplom uchun yetadi |
| Gemini API | 50 RPM | Bir necha foydalanuvchi uchun yetadi |

---

## 🎓 Diplom himoyasi uchun maslahatlar

Komissiya so'rashi mumkin bo'lgan savollar va javoblari:

**S:** Production'da deploy qildingizmi?
**J:** Ha — Render.com'da backend (Django + Daphne ASGI), Vercel'da frontend (React+Vite), PostgreSQL ma'lumotlar bazasi. Hammasi avtomatik HTTPS bilan.

**S:** Media fayllar qayerda saqlanadi?
**J:** Cloudflare R2 (S3-compatible) — production-ready, 10 GB bepul. Demo'da hozir 5-10 ta rasm bor.

**S:** Real-time bildirishnomalar qanday ishlaydi?
**J:** Django Channels + WebSocket. Frontend `wss://` orqali ulanadi, JWT token bilan auth. Backend Daphne ASGI server.

**S:** Xavfsizlik?
**J:** HTTPS-only (HSTS), JWT auth, throttling (5-10/soat OTP/login), CORS strict, secure cookies.

**S:** Scalability?
**J:** Free tier'da 1 worker, lekin kod scalable: Redis (CHANNEL_LAYERS), PostgreSQL, stateless API.

---

## ✅ Yakuniy tekshiruv

Deploy tugagandan keyin:

- [ ] Backend URL ochiladi (`/api/docs/` — Swagger ko'rinadi)
- [ ] Frontend URL ochiladi
- [ ] Ro'yxatdan o'tish ishlaydi
- [ ] OTP email keladi
- [ ] Vakansiya yaratish ishlaydi
- [ ] Avatar yuklash ishlaydi (R2)
- [ ] WebSocket ulanadi (Console'da xato yo'q)
- [ ] Admin panelga kirish ishlaydi
- [ ] Til o'zgartirish ishlaydi (UZ/RU)

Hammasi yashil bo'lsa — **deploy muvaffaqiyatli! 🎉**

---

## Yordam kerak bo'lsa

- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- Django channels: https://channels.readthedocs.io

Diplom muvaffaqiyatli bo'lsin!
