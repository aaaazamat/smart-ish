import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle, Briefcase, Users, Eye, Heart,
  CheckCircle2, Clock, X, FileText, ArrowRight,
} from 'lucide-react'
import { employerApi } from '@/api/endpoints'
import { useAuthStore } from '@/store/authStore'
import { formatNumber } from '@/lib/format'
import { StatCardSkeleton } from '@/components/ui/Skeletons'

function StatCard({ icon: Icon, label, value, color = 'brand', to }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  const Component = to ? Link : 'div'
  return (
    <Component
      to={to}
      className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-brand-300 hover:shadow-sm transition block"
    >
      <div className="flex items-start gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900">{formatNumber(value)}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </Component>
  )
}

function QuickAction({ icon: Icon, title, description, to, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-500 hover:bg-brand-600 text-white',
    secondary: 'bg-white border border-gray-200 text-gray-700 hover:border-brand-300',
  }
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 p-5 rounded-2xl transition group ${colors[color]}`}
    >
      <div className={color === 'brand' ? 'p-2.5 bg-white/20 rounded-lg' : 'p-2.5 bg-brand-50 text-brand-600 rounded-lg'}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{title}</div>
        <div className={`text-xs mt-0.5 ${color === 'brand' ? 'text-white/80' : 'text-gray-500'}`}>
          {description}
        </div>
      </div>
      <ArrowRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition" />
    </Link>
  )
}

function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['employer-dashboard'],
    queryFn: employerApi.dashboard,
  })

  if (isLoading) {
    // Statistika kartochkalari uchun skeleton — haqiqiy layoutni saqlab,
    // foydalanuvchiga "sahifa hozir keladi" tuyg'usini beradi
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="h-8 w-48 mb-6">
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error?.message || 'Xato yuz berdi'}</span>
        </div>
      </div>
    )
  }

  const v = data?.vacancies || {}
  const a = data?.applications || {}

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Salom, <span className="font-medium text-gray-700">{user?.organization_name || user?.phone_number}</span>!
        </p>
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Vakansiyalar
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Briefcase} label="Jami vakansiyalar" value={v.total || 0} color="brand" to="/employer/vacancies" />
        <StatCard icon={CheckCircle2} label="Faol" value={v.active || 0} color="green" />
        <StatCard icon={Eye} label="Ko'rishlar" value={v.total_views || 0} color="blue" />
        <StatCard icon={Heart} label="Saqlanishlar" value={v.total_likes || 0} color="red" />
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Arizalar
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Jami arizalar" value={a.total || 0} color="brand" to="/employer/applications" />
        <StatCard icon={Clock} label="Kutilmoqda" value={a.pending || 0} color="amber" />
        <StatCard icon={CheckCircle2} label="Qabul qilindi" value={a.accepted || 0} color="green" />
        <StatCard icon={X} label="Rad etildi" value={a.rejected || 0} color="red" />
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Tezkor amallar
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickAction
          icon={FileText}
          title="Yangi vakansiya yaratish"
          description="Yangi ish o'rni e'lon qiling"
          to="/employer/vacancies/new"
          color="brand"
        />
        <QuickAction
          icon={Users}
          title="Rezyumelarni qidirish"
          description="Mos nomzodlarni toping"
          to="/employer/resumes"
          color="secondary"
        />
      </div>
    </div>
  )
}

export default DashboardPage
