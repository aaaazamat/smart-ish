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
import { formatSalary } from '@/lib/format'
import { cn } from '@/lib/cn'
import VacancyCard from '@/components/vacancy/VacancyCard'
import AnimateOnScroll from '@/components/ui/AnimateOnScroll'
import AnimatedNumber from '@/components/ui/AnimatedNumber'

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
    <section className="relative overflow-hidden text-white animated-gradient-bg">
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-950/50 to-black/60" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-dark opacity-50" />

      {/* Floating orb 1 — large */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-pink-500/40 rounded-full blur-3xl animate-float-slow" />
      {/* Floating orb 2 */}
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-orange-500/35 rounded-full blur-3xl animate-float-reverse" />
      {/* Floating orb 3 — center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/25 rounded-full blur-3xl animate-pulse-slow" />

      {/* Twinkling stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { top: '15%', left: '10%', delay: '0s', size: 4 },
          { top: '25%', left: '85%', delay: '0.5s', size: 3 },
          { top: '45%', left: '20%', delay: '1s', size: 5 },
          { top: '70%', left: '90%', delay: '1.5s', size: 4 },
          { top: '85%', left: '15%', delay: '2s', size: 3 },
          { top: '35%', left: '50%', delay: '2.5s', size: 4 },
          { top: '60%', left: '70%', delay: '0.3s', size: 3 },
          { top: '20%', left: '60%', delay: '1.8s', size: 4 },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: s.delay,
              boxShadow: '0 0 12px white',
            }}
          />
        ))}
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 py-16 lg:py-28">
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-xs font-medium mb-6 animate-fade-in-down">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-sparkle" />
              SmartIsh — AI bilan ish topish endi yanada oson
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight animate-fade-in-up">
              Sun'iy intellekt<br />
              yordamida ish topish<br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f472b6 40%, #c084fc 70%, #fbbf24 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradient-shift 6s ease infinite',
                }}
              >
                endi yanada oson
              </span>
            </h1>
            <p className="text-base sm:text-lg text-white/85 mt-6 max-w-xl animate-fade-in-up stagger-2" style={{ animationFillMode: 'backwards' }}>
              O'zbekistondagi minglab vakansiyalar va nomzodlar bir joyda.
              SmartIsh AI yordamida o'zingizga eng mosini toping.
            </p>
          </div>

          <div className="relative animate-fade-in-right" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-6 shadow-2xl shadow-rose-500/40 transform lg:rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-500 animate-float">
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
          className="relative mt-10 lg:mt-12 bg-white rounded-2xl shadow-2xl shadow-black/30 p-2 grid grid-cols-1 md:grid-cols-[2fr_1.2fr_auto] gap-2 max-w-5xl animate-fade-in-up stagger-4"
          style={{ animationFillMode: 'backwards' }}
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
            className="h-14 px-8 lg:px-12 smartish-gradient-bg hover:opacity-90 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/40"
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
    { icon: Briefcase, value: stats.vacancies, label: 'Vakansiyalar', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: FileText, value: stats.resumes, label: 'Rezyumelar', color: 'text-pink-500', bg: 'bg-pink-50' },
    { icon: Building2, value: stats.organizations, label: 'Tashkilotlar', color: 'text-orange-500', bg: 'bg-orange-50' },
  ]
  return (
    <section className="relative -mt-8 z-10 max-w-[1400px] mx-auto px-6">
      <AnimateOnScroll variant="up">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center hover:shadow-2xl transition-shadow duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {items.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="flex items-center gap-4 group">
                  <div className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300',
                    s.bg
                  )}>
                    <Icon className={cn('w-7 h-7', s.color)} />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-gray-900 leading-none">
                      <AnimatedNumber value={s.value || 0} />
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
              className="inline-flex items-center justify-center gap-2 px-5 py-3 smartish-gradient-bg text-white rounded-xl font-medium transition hover:shadow-lg hover:shadow-purple-500/40 hover:scale-105"
            >
              <FileText className="w-4 h-4" />
              Rezyume joylash
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-brand-600 border border-brand-200 rounded-xl font-medium transition hover:scale-105"
            >
              <Briefcase className="w-4 h-4" />
              Vakansiya joylash
            </Link>
          </div>
        </div>
      </AnimateOnScroll>
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
      color: 'from-pink-400 to-pink-600',
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
      color: 'from-orange-400 to-orange-600',
    },
  ]
  return (
    <section className="max-w-[1400px] mx-auto px-6 py-16 lg:py-20">
      <AnimateOnScroll variant="up">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Qanday <span className="smartish-gradient-text">ishlaydi?</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            3 oddiy qadam — siz o'zingizga mos ishni topasiz, ish beruvchi esa kerakli mutaxassisni
          </p>
        </div>
      </AnimateOnScroll>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
        {steps.map((s, i) => {
          const Icon = s.icon
          return (
            <AnimateOnScroll key={i} variant="up" delay={i * 150}>
              <div className="relative group">
                <div className="bg-white rounded-3xl border border-gray-100 p-8 hover-lift h-full">
                  <div className={cn(
                    'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300',
                    s.color
                  )}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 w-6 h-6 text-purple-300 z-10 animate-pulse-slow" />
                )}
              </div>
            </AnimateOnScroll>
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
        <AnimateOnScroll variant="up">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-xs font-semibold mb-3">
                <TrendingUp className="w-3.5 h-3.5" />
                Eng yaxshi takliflar
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Yuqori maoshli <span className="smartish-gradient-text">ishlar</span>
              </h2>
            </div>
            <Link
              to="/vacancies?ordering=-salary_from"
              className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-brand-600 font-medium hover:border-brand-300 hover:bg-brand-50 hover-scale transition"
            >
              Barchasini ko'rish <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </AnimateOnScroll>

        {isLoading && <div className="h-40 flex items-center justify-center text-gray-400">Yuklanmoqda...</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data?.results?.slice(0, 6).map((v, i) => (
            <AnimateOnScroll key={v.id} variant="up" delay={i * 80}>
              <VacancyCard vacancy={v} />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// SPECIAL CATEGORIES
// ─────────────────────────────────────────────
const CATEGORIES = [
  {
    icon: Accessibility,
    title: "Nogironligi bo'lgan shaxslar uchun",
    description: "Maxsus moslashtirilgan ish o'rinlari",
    to: '/vacancies?for_disabled=true',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: GraduationCap,
    title: 'Talaba va bitiruvchilar',
    description: 'Yangi mutaxassislar uchun start',
    to: '/vacancies?for_students=true',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: User,
    title: 'Ayollar uchun',
    description: "Ayollarga mos ish o'rinlari",
    to: '/vacancies?gender=female',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Bookmark,
    title: 'Bitiruvchilar uchun',
    description: 'Yangi bitiruvchilarga moslangan',
    to: '/vacancies?for_graduates=true',
    gradient: 'from-emerald-500 to-teal-500',
  },
]

function SpecialCategoriesSection() {
  return (
    <section className="bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 py-16 lg:py-20">
        <AnimateOnScroll variant="up">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Alohida toifalar uchun ishlar
            </h2>
            <p className="text-gray-500">
              Har kim uchun mos imkoniyatlar mavjud
            </p>
          </div>
        </AnimateOnScroll>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon
            return (
              <AnimateOnScroll key={i} variant="up" delay={i * 100}>
                <Link
                  to={c.to}
                  className="group relative overflow-hidden bg-white rounded-3xl p-6 border border-gray-100 hover-lift h-full block"
                >
                  <div className={cn(
                    'absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-all duration-500',
                    `bg-gradient-to-br ${c.gradient}`
                  )} />
                  <div className="relative">
                    <div className={cn(
                      'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300',
                      c.gradient
                    )}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition">
                      {c.title}
                    </h3>
                    <p className="text-sm text-gray-500">{c.description}</p>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm text-brand-600 font-medium">
                      Ko'rish
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </Link>
              </AnimateOnScroll>
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
      <AnimateOnScroll variant="up">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Sohalar bo'yicha qidiring
          </h2>
          <p className="text-gray-500">
            Sizga mos sohani tanlang va vakansiyalarni ko'ring
          </p>
        </div>
      </AnimateOnScroll>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {industries.map((i, idx) => {
          const cfg = INDUSTRY_CONFIG[i.name] || { icon: Briefcase, color: 'text-brand-500', bg: 'bg-brand-50' }
          const Icon = cfg.icon
          return (
            <AnimateOnScroll key={i.id} variant="up" delay={idx * 60}>
              <Link
                to={`/vacancies?industry=${i.id}`}
                className="group bg-white border border-gray-100 rounded-2xl p-5 hover-lift transition-all flex flex-col items-start h-full"
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300',
                  cfg.bg
                )}>
                  <Icon className={cn('w-6 h-6', cfg.color)} />
                </div>
                <div className="font-semibold text-gray-900 group-hover:text-brand-600 transition leading-tight">
                  {i.name}
                </div>
                <div className="text-xs text-gray-400 mt-1.5 inline-flex items-center gap-1">
                  Ko'rish <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            </AnimateOnScroll>
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
      text: "Sun'iy intellekt sizga eng mos vakansiya yoki nomzodni tanlaydi",
    },
    {
      icon: Shield,
      title: 'Ishonchli platforma',
      text: "Tekshirilgan tashkilotlar va xavfsiz ma'lumotlar himoyasi",
    },
    {
      icon: Zap,
      title: 'Tezkor ishlaydi',
      text: 'Bir necha daqiqada ariza yuboring yoki taklif oling',
    },
  ]
  return (
    <section className="relative overflow-hidden text-white animated-gradient-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-950/60 to-black/70" />
      <div className="absolute inset-0 bg-grid-dark opacity-30" />

      <div className="relative max-w-[1400px] mx-auto px-6 py-16 lg:py-20">
        <AnimateOnScroll variant="up">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">
              Nega aynan <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f472b6, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>SmartIsh?</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Zamonaviy texnologiyalar, AI va mijozga g'amxo'rlik bizni boshqalardan ajratib turadi
            </p>
          </div>
        </AnimateOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <AnimateOnScroll key={i} variant="up" delay={i * 150}>
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 group h-full">
                  <div className="w-12 h-12 rounded-xl smartish-gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-white/80">{f.text}</p>
                </div>
              </AnimateOnScroll>
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
      <AnimateOnScroll variant="scale">
        <div className="relative overflow-hidden smartish-gradient-bg rounded-3xl p-8 lg:p-14 text-white text-center hover:shadow-2xl hover:shadow-purple-500/40 transition-shadow duration-500">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl animate-float-reverse" />
          <div className="absolute inset-0 bg-grid-dark opacity-20" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold mb-4">
              <Sparkles className="w-3 h-3 animate-twinkle" />
              Yangi imkoniyatlar sizni kutmoqda
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Bugundan ish qidirishni boshlang!
            </h2>
            <p className="text-white/90 max-w-xl mx-auto mb-8">
              Bepul ro'yxatdan o'ting va minglab vakansiyalar ichidan o'zingizga mosini toping
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-brand-600 rounded-xl font-semibold hover:bg-gray-50 hover:scale-105 transition-all shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                Bepul ro'yxatdan o'tish
              </Link>
              <Link
                to="/vacancies"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/15 backdrop-blur border border-white/30 rounded-xl font-semibold hover:bg-white/25 hover:scale-105 transition-all"
              >
                <Search className="w-5 h-5" />
                Vakansiyalarni ko'rish
              </Link>
            </div>
          </div>
        </div>
      </AnimateOnScroll>
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
