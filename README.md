# OSON ISH — Job Board Platformasi

O'zbekistonda ish izlash va ish beruvchilarni nomzodlar bilan bog'lovchi raqamli platforma.
**4-kurs diplom loyihasi.**

## 🎯 Asosiy funksiyalar

### 👤 Job Seeker (Ish izlovchi)
- Vakansiyalarni qidirish, filterlash, saralash
- Sevimli vakansiyalar
- Rezyume yaratish (ko'nikmalar, ish tajribasi, ta'lim, sertifikatlar)
- Vakansiyaga ariza yuborish va kuzatish
- Bildirishnomalar (in-app)

### 🏢 Employer (Ish beruvchi)
- Dashboard (statistika)
- Vakansiya CRUD (til talablari, ish jadvali, ...)
- Kelgan arizalarni ko'rish va status berish (suhbat / qabul / rad)
- Rezyumelarni qidirish va taklif yuborish

### 👑 Admin
- Foydalanuvchi boshqaruvi (block / delete)
- Vakansiya / rezyume moderatsiya
- 7 turdagi ma'lumotnoma CRUD
- Shikoyatlarni ko'rib chiqish
- Platforma statistikasi

### 🤖 AI funksiyalari (Google Gemini)
1. **Vakansiya tavsifini AI yozadi** — kalit so'zlar bo'yicha
2. **AI Chatbot** — har sahifada yordamchi (kontekstli)
3. **Smart Matching** — vakansiya ↔ rezyume mos kelish foizi
4. **Top 5 nomzod tavsiyasi** (employer uchun)
5. **Top 5 vakansiya tavsiyasi** (job seeker uchun)

## 🛠 Texnik stack

- **Backend**: Django 6 + DRF + JWT + drf-spectacular
- **Frontend**: React + Vite + TailwindCSS v4 + TanStack Query + Zustand + React Hook Form + Zod
- **AI**: Google Gemini 2.5 Flash
- **DB**: SQLite (dev) / PostgreSQL (prod)

## 🚀 Lokal ishga tushirish

### Backend
```bash
python -m venv .venv
.venv\Scripts\activate    # Windows
# source .venv/bin/activate   # Linux/Mac

pip install -r requirements.txt

cp .env.example .env
# .env'ni tahrirlang (SECRET_KEY, GEMINI_API_KEY, ...)

cd config
python manage.py migrate
python manage.py seed_demo --vacancies 25
python manage.py bootstrap_admin --phone +998900000000 --email admin@example.com --password admin12345
python manage.py runserver
```
Backend: http://localhost:8000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

## 🔑 Test akkauntlar

| Rol | Telefon | Parol |
|---|---|---|
| Admin | `+998900000000` | `admin12345` |
| Demo Employer | `+998900000001` | `demo12345` |

## 🤖 AI sozlash

[Google AI Studio](https://aistudio.google.com/apikey) dan bepul kalit oling va `.env` ga qo'shing:
```
GEMINI_API_KEY=AIza...
```

## ⏰ Rejalashtirilgan vazifalar (cron)

Loyihada 2 ta avtomatlashtirilgan vazifa bor — har kuni ishga tushishi kerak:

### 1. Muddati o'tgan vakansiyalarni yopish

```bash
python config/manage.py close_expired_vacancies
```

Har kuni `expires_at < bugun` bo'lgan faol vakansiyalarni `is_active=False` qilib qo'yadi va egasiga in-app bildirishnoma yuboradi.

### 2. Eskirgan OTP kodlarni o'chirish

```bash
python config/manage.py cleanup_otp
```

Ishlatilgan va muddati tugagan OTP kodlarni bazadan o'chiradi (1 sutka saqlanadi).

### Cron sozlash

**Linux/Mac (crontab -e):**
```cron
# Har kuni 02:00 — OTP tozalash
0 2 * * * cd /path/to/project && /path/to/.venv/bin/python config/manage.py cleanup_otp

# Har kuni 03:00 — muddati o'tgan vakansiyalar
0 3 * * * cd /path/to/project && /path/to/.venv/bin/python config/manage.py close_expired_vacancies
```

**Windows Task Scheduler:**
1. `Task Scheduler` ni oching → `Create Basic Task`
2. Daily, 03:00 va Daily 02:00 uchun ikkita task
3. Action: `Start a program`
4. Program: `C:\path\to\.venv\Scripts\python.exe`
5. Arguments: `C:\path\to\config\manage.py close_expired_vacancies`

**Render.com (production):**
`Cron Jobs` bo'limidan yangi job qo'shing:
```
Schedule: 0 3 * * *
Command: cd config && python manage.py close_expired_vacancies
```

### Sinash (xavfsiz)

Haqiqiy o'zgartirishlardan oldin `--dry-run` bilan tekshirish mumkin:

```bash
python config/manage.py close_expired_vacancies --dry-run
python config/manage.py cleanup_otp --dry-run
```

## ☁️ Production deploy

### Backend → Render
1. Loyihani GitHub'ga push qiling
2. [render.com](https://render.com) → **New Web Service** → GitHub repo'ni tanlang
3. Configuration:
   - **Build Command**: `./build.sh`
   - **Start Command**: `cd config && gunicorn config.wsgi:application`
4. **Environment** bo'limida o'rnating:
   - `SECRET_KEY` — random
   - `DEBUG=False`
   - `ALLOWED_HOSTS=.onrender.com`
   - `GEMINI_API_KEY` — Google'dan olgan kalit
   - `CORS_ALLOWED_ORIGINS` — Vercel domeningiz (deploy qilgandan keyin)
   - `DATABASE_URL` — Render PostgreSQL'dan avtomatik
5. **PostgreSQL Database** qo'shing (free tier)
6. Deploy → log'ni kuting

### Frontend → Vercel
1. [vercel.com](https://vercel.com) → **Import Project** → GitHub repo
2. **Root Directory**: `frontend`
3. **Environment Variables**:
   - `VITE_API_URL` = `https://YOUR-BACKEND.onrender.com/api`
4. Deploy

### Connect
Render'dagi `CORS_ALLOWED_ORIGINS` ga Vercel URL'ni qo'shing va backend'ni qayta deploy qiling.

## 📁 Loyiha tuzilishi

```
Diplom_project/
├── config/                       # Django backend
│   ├── config/                   # settings, urls
│   └── main_project_app/         # asosiy app
│       ├── models.py
│       ├── views.py              # job_seeker views
│       ├── admin_views.py
│       ├── ai_services.py        # Gemini AI
│       └── management/commands/
│           ├── seed_demo.py
│           └── bootstrap_admin.py
├── frontend/                     # React frontend
│   └── src/
│       ├── api/                  # axios + endpoints
│       ├── components/           # UI komponentlar
│       ├── hooks/                # TanStack Query
│       ├── pages/                # rol bo'yicha sahifalar
│       └── store/                # Zustand
├── requirements.txt
├── build.sh                      # Render build script
└── render.yaml                   # Render config
```

## 📚 API hujjatlari

Backend ishga tushgach:
- Swagger UI: http://localhost:8000/api/docs/
- Redoc: http://localhost:8000/api/redoc/

## 📜 Litsenziya

Diplom loyihasi — o'quv maqsadida.
