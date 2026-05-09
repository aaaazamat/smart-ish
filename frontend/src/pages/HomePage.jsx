import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search, MapPin, Briefcase, FileText, Building2, ArrowRight,
  Accessibility, GraduationCap, User, Bookmark,
  Factory, Wrench, BookOpen, Heart, HardHat, TrendingUp, Truck,
  Sparkles, Zap, Shield, UserPlus, Send, CheckCircle2,
} from 'lucide-react'
import { vacanciesApi, referenceApi } from '@/api/endpoints'
import { apiClient } from '@/api/client'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import VacancyCard from '@/components/vacancy/VacancyCard'

// ─────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────
function Hero({ regions }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (region) params.set('region', region)
    navigate(`/vacancies?${params.toString()}`)
  }

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background:
          'linear-gradient(135deg, #082c37 0%, #18525f 50%, #137c8e 100%)',
      }}
    >
      {/* Background image — darkened */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(8,44,55,0.92) 0%, rgba(24,82,95,0.88) 50%, rgba(19,124,142,0.82) 100%), url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-400/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/25 rounded-full blur-3xl" />

      <div className="relative max-w-[1400px] mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AI bilan ish topish endi yanada oson
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Ish beruvchi va<br />
              ish qidiruvchilar uchun<br />
              <span className="text-brand-300">ishonchli platforma</span>
            </h1>
            <p className="text-base sm:text-lg text-brand-100/80 mt-6 max-w-xl">
              O'zbekistondagi minglab vakansiyalar va nomzodlar bir joyda.
              Sun'iy intellekt yordamida o'zingizga eng mosini toping.
            </p>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-6 shadow-2xl shadow-rose-500/20 transform lg:rotate-2 hover:rotate-0 transition-transform">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-lg">100% Bepul</div>
                  <div className="text-sm text-white/90 mt-1">
                    Ish qidiruvchi va ish beruvchilar uchun
                    platformadan foydalanish to'liq bepul
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative mt-10 lg:mt-12 bg-white rounded-2xl shadow-2xl shadow-black/20 p-2 grid grid-cols-1 md:grid-cols-[2fr_1.2fr_auto] gap-2 max-w-5xl"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kasb, lavozim nomi"
              className="w-full bg-transparent text-gray-900 rounded-xl pl-12 pr-4 h-14 text-base placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <div className="relative border-l-0 md:border-l border-gray-200">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full appearance-none bg-transparent text-gray-900 rounded-xl pl-12 pr-10 h-14 text-base focus:outline-none cursor-pointer"
            >
              <option value="">O'zbekiston bo'ylab</option>
              {regions?.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="h-14 px-8 lg:px-12 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Qidirish
          </button>
        </form>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// STATS BAR (overlapping with hero bottom)
// ─────────────────────────────────────────────
function StatsBar({ stats }) {
  const items = [
    { icon: Briefcase, value: stats.vacancies, label: 'Vakansiyalar', color: 'text-brand-500', bg: 'bg-brand-50' },
    { icon: FileText, value: stats.resumes, label: 'Rezyumelar', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: Building2, value: stats.organizations, label: 'Tashkilotlar', color: 'text-amber-500', bg: 'bg-amber-50' },
  ]
  return (
    <section className="relative -mt-8 z-10 max-w-[1400px] mx-auto px-6">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {items.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="flex items-center gap-4">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shrink-0', s.bg)}>
                  <Icon className={cn('w-7 h-7', s.color)} />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-gray-900 leading-none">
                    {formatNumber(s.value || 0)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 lg:border-l lg:border-gray-100 lg:pl-6">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium transition shadow-sm hover:shadow"
          >
            <FileText className="w-4 h-4" />
            Rezyume joylash
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-brand-600 border border-brand-200 rounded-xl font-medium transition"
          >
            <Briefcase className="w-4 h-4" />
            Vakansiya joylash
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// HOW IT WORKS (3 steps)
// ─────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "1. Ro'yxatdan o'ting",
      text: "Telefon raqamingiz orqali bir necha daqiqada akkaunt yarating",
      color: 'from-brand-400 to-brand-600',
    },
    {
      icon: FileText,
      title: '2. Rezyume yarating',
      text: 'Tajriba, ko\'nikma va ta\'lim ma\'lumotlaringizni kiriting',
      color: 'from-purple-400 to-purple-600',
    },
    {
      icon: Send,
      title: '3. Ariza yuboring',
      text: 'AI tavsiyalari asosida eng mos vakansiyani toping va ariza bering',
      color: 'from-amber-400 to-orange-500',
    },
  ]
  return (
    <section className="max-w-[1400px] mx-auto px-6 py-16 lg:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          Qanday ishlaydi?
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          3 oddiy qadam — siz o'zingizga mos ishni topasiz, ish beruvchi esa kerakli mutaxassisni
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
        {steps.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="relative group">
              <div className="bg-white rounded-3xl border border-gray-100 p-8 hover:shadow-lg transition-all hover:-translate-y-1 h-full">
                <div className={cn(
                  'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-lg',
                  s.color
                )}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 w-6 h-6 text-gray-300 z-10" />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// TOP VACANCIES
// ─────────────────────────────────────────────
function TopVacanciesSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['top-vacancies'],
    queryFn: () => vacanciesApi.list({ ordering: '-salary_from', page_size: 6 }),
  })

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-[1400px] mx-auto px-6 py-16 lg:py-20">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              Eng yaxshi takliflar
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Yuqori maoshli ishlar
            </h2>
          </div>
          <Link
            to="/vacancies?ordering=-salary_from"
            className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-brand-500 font-medium hover:border-brand-300 hover:bg-brand-50 transition"
          >
            Barchasini ko'rish <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading && <div className="h-40 flex items-center justify-center text-gray-400">Yuklanmoqda...</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data?.results?.slice(0, 6).map((v) => (
            <VacancyCard key={v.id} vacancy={v} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// SPECIAL CATEGORIES (big colorful cards)
// ─────────────────────────────────────────────
const CATEGORIES = [
  {
    icon: Accessibility,
    title: "Nogironligi bo'lgan shaxslar uchun",
    description: 'Maxsus moslashtirilgan ish o\'rinlari',
    to: '/vacancies?for_disabled=true',
    gradient: 'from-blue-500 to-cyan-500',
    bgPattern: 'bg-blue-50',
  },
  {
    icon: GraduationCap,
    title: 'Talaba va bitiruvchilar',
    description: 'Yangi mutaxassislar uchun start',
    to: '/vacancies?for_students=true',
    gradient: 'from-purple-500 to-pink-500',
    bgPattern: 'bg-purple-50',
  },
  {
    icon: User,
    title: 'Ayollar uchun',
    description: 'Ayollarga mos ish o\'rinlari',
    to: '/vacancies?gender=female',
    gradient: 'from-pink-500 to-rose-500',
    bgPattern: 'bg-pink-50',
  },
  {
    icon: Bookmark,
    title: 'Bitiruvchilar uchun',
    description: 'Yangi bitiruvchilarga moslangan',
    to: '/vacancies?for_graduates=true',
    gradient: 'from-emerald-500 to-teal-500',
    bgPattern: 'bg-emerald-50',
  },
]

function SpecialCategoriesSection() {
  return (
    <section className="bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 py-16 lg:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Alohida toifalar uchun ishlar
          </h2>
          <p className="text-gray-500">
            Har kim uchun mos imkoniyatlar mavjud
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon
            return (
              <Link
                key={i}
                to={c.to}
                className="group relative overflow-hidden bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className={cn(
                  'absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition',
                  `bg-gradient-to-br ${c.gradient}`
                )} />
                <div className="relative">
                  <div className={cn(
                    'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform',
                    c.gradient
                  )}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-brand-500 transition">
                    {c.title}
                  </h3>
                  <p className="text-sm text-gray-500">{c.description}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm text-brand-500 font-medium">
                    Ko'rish
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// INDUSTRIES
// ─────────────────────────────────────────────
const INDUSTRY_CONFIG = {
  'IT va Aloqa': { icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-50' },
  'Moliya va Bank': { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  'Qurilish': { icon: HardHat, color: 'text-amber-500', bg: 'bg-amber-50' },
  'Savdo': { icon: Wrench, color: 'text-rose-500', bg: 'bg-rose-50' },
  "Ta'lim": { icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
  "Sog'liqni saqlash": { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
  'Logistika': { icon: Truck, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  'Ishlab chiqarish': { icon: Factory, color: 'text-orange-500', bg: 'bg-orange-50' },
}

function IndustriesSection() {
  const { data: industries = [] } = useQuery({
    queryKey: ['industries'],
    queryFn: referenceApi.industries,
    staleTime: 60 * 60 * 1000,
  })

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-16 lg:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          Sohalar bo'yicha qidiring
        </h2>
        <p className="text-gray-500">
          Sizga mos sohani tanlang va vakansiyalarni ko'ring
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {industries.map((i) => {
          const cfg = INDUSTRY_CONFIG[i.name] || { icon: Briefcase, color: 'text-brand-500', bg: 'bg-brand-50' }
          const Icon = cfg.icon
          return (
            <Link
              key={i.id}
              to={`/vacancies?industry=${i.id}`}
              className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-start"
            >
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform', cfg.bg)}>
                <Icon className={cn('w-6 h-6', cfg.color)} />
              </div>
              <div className="font-semibold text-gray-900 group-hover:text-brand-500 transition leading-tight">
                {i.name}
              </div>
              <div className="text-xs text-gray-400 mt-1.5 inline-flex items-center gap-1">
                Ko'rish <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// FEATURES (why us)
// ─────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI yordamchisi',
      text: 'Sun\'iy intellekt sizga eng mos vakansiya yoki nomzodni tanlaydi',
    },
    {
      icon: Shield,
      title: 'Ishonchli platforma',
      text: 'Tekshirilgan tashkilotlar va xavfsiz ma\'lumotlar himoyasi',
    },
    {
      icon: Zap,
      title: 'Tezkor ishlaydi',
      text: 'Bir necha daqiqada ariza yuboring yoki taklif oling',
    },
  ]
  return (
    <section className="bg-gradient-to-br from-brand-950 to-brand-800 text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-16 lg:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-3">
            Nega aynan OSON ISH?
          </h2>
          <p className="text-brand-200/80 max-w-2xl mx-auto">
            Zamonaviy texnologiyalar va mijozga g'amxo'rlik bizni boshqalardan ajratib turadi
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-brand-100/70">{f.text}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// CTA
// ─────────────────────────────────────────────
function CtaSection() {
  return (
    <section className="max-w-[1400px] mx-auto px-6 py-16 lg:py-20">
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-8 lg:p-12 text-white text-center">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl" />
        <div className="relative">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Bugundan ish qidirishni boshlang!
          </h2>
          <p className="text-brand-50 max-w-xl mx-auto mb-8">
            Bepul ro'yxatdan o'ting va minglab vakansiyalar ichidan o'zingizga mosini toping
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-brand-600 rounded-xl font-semibold hover:bg-gray-50 transition shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              Bepul ro'yxatdan o'tish
            </Link>
            <Link
              to="/vacancies"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition"
            >
              <Search className="w-5 h-5" />
              Vakansiyalarni ko'rish
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────
function HomePage() {
  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: referenceApi.regions,
    staleTime: 60 * 60 * 1000,
  })

  const { data: vacancyCount } = useQuery({
    queryKey: ['count', 'vacancies'],
    queryFn: () => apiClient.get('/vacancies/?page_size=1').then((r) => r.data?.count || 0),
  })
  const { data: resumeCount } = useQuery({
    queryKey: ['count', 'resumes'],
    queryFn: () => apiClient.get('/resumes/?page_size=1').then((r) => r.data?.count || 0),
  })
  const { data: orgCount } = useQuery({
    queryKey: ['count', 'organizations'],
    queryFn: () => apiClient.get('/organizations/?page_size=1').then((r) => r.data?.count || 0),
  })

  return (
    <>
      <Hero regions={regions} />
      <StatsBar stats={{
        vacancies: vacancyCount,
        resumes: resumeCount,
        organizations: orgCount,
      }} />
      <HowItWorks />
      <TopVacanciesSection />
      <SpecialCategoriesSection />
      <IndustriesSection />
      <FeaturesSection />
      <CtaSection />
    </>
  )
}

export default HomePage
