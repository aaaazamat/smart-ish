import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle, Users, Briefcase, FileText, Eye,
  CheckCircle2, X, UserCheck, UserX, Shield, AlertTriangle,
} from 'lucide-react'
import { adminApi } from '@/api/endpoints'
import { useAuthStore } from '@/store/authStore'
import { formatNumber } from '@/lib/format'
import { StatCardSkeleton } from '@/components/ui/Skeletons'

function StatCard({ icon: Icon, label, value, color = 'brand', sub, to }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-100 text-gray-600',
  }
  const Component = to ? Link : 'div'
  return (
    <Component
      to={to}
      className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-brand-300 transition block"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-bold text-gray-900">{formatNumber(value)}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </Component>
  )
}

function MiniStat({ label, value, color = 'gray' }) {
  const colors = {
    gray: 'text-gray-700',
    green: 'text-green-700',
    red: 'text-red-700',
    blue: 'text-blue-700',
  }
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-semibold ${colors[color]}`}>{formatNumber(value)}</span>
    </div>
  )
}

function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-stats-overview'],
    queryFn: adminApi.statsOverview,
  })

  if (isLoading) {
    // Admin dashboard skeleton — stat kartochkalar va bo'limlar joyini
    // ko'rsatib turadi
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error?.message || 'Xato yuz berdi'}</span>
        </div>
      </div>
    )
  }

  const u = data?.users || {}
  const v = data?.vacancies || {}
  const r = data?.resumes || {}
  const a = data?.applications || {}

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-7 h-7 text-brand-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Statistika</h1>
          <p className="text-sm text-gray-500">Platforma umumiy ko'rsatkichlari</p>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Foydalanuvchilar
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          icon={Users}
          label="Jami foydalanuvchi"
          value={u.total || 0}
          sub={`+${u.new_last_7_days || 0} oxirgi 7 kun`}
          color="brand"
          to="/admin/users"
        />
        <StatCard icon={UserCheck} label="Faol" value={u.active || 0} color="green" />
        <StatCard icon={UserX} label="Bloklangan" value={u.blocked || 0} color="red" />
        <StatCard
          icon={Users}
          label="Yangi (30 kun)"
          value={u.new_last_30_days || 0}
          color="blue"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Rol bo'yicha</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <MiniStat label="Ish izlovchilar" value={u.by_role?.job_seeker || 0} color="blue" />
          <MiniStat label="Ish beruvchilar" value={u.by_role?.employer || 0} color="green" />
          <MiniStat label="Adminlar" value={u.by_role?.admin || 0} color="gray" />
        </div>
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Vakansiyalar
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Briefcase}
          label="Jami"
          value={v.total || 0}
          sub={`+${v.new_last_7_days || 0} oxirgi 7 kun`}
          color="brand"
          to="/admin/moderation"
        />
        <StatCard icon={CheckCircle2} label="Faol" value={v.active || 0} color="green" />
        <StatCard icon={X} label="Yopiq" value={v.closed || 0} color="red" />
        <StatCard icon={Eye} label="Jami ko'rishlar" value={v.total_views || 0} color="blue" />
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Rezyumelar
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={FileText}
          label="Jami rezyumelar"
          value={r.total || 0}
          color="brand"
        />
        <StatCard icon={CheckCircle2} label="E'lon qilingan" value={r.published || 0} color="green" />
        <StatCard icon={X} label="Yashirilgan" value={r.hidden || 0} color="gray" />
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Arizalar
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Jami arizalar" value={a.total || 0} color="brand" />
        <StatCard icon={CheckCircle2} label="Qabul qilindi" value={a.accepted || 0} color="green" />
        <StatCard icon={UserCheck} label="Ishga olindi" value={a.hired || 0} color="green" />
        <StatCard icon={X} label="Rad etildi" value={a.rejected || 0} color="red" />
      </div>
    </div>
  )
}

export default AdminDashboardPage
