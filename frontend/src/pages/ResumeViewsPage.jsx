/**
 * ResumeViewsPage — Job seeker uchun "Rezyumemni kim ko'rdi" sahifasi.
 *
 * - 3 ta statistika kartasi (jami, unique tashkilotlar, oxirgi 7 kun)
 * - Oxirgi 50 ta ko'rilish ro'yxati (tashkilot logosi + nom + sana)
 * - Har 30 sekundda yangilanadi (real-time deyarli)
 * - Maxfiylik: ko'ruvchining shaxsiy ma'lumotlari ko'rsatilmaydi
 */
import { Link } from 'react-router-dom'
import { Eye, Building2, Calendar, ArrowLeft, ShieldCheck, BarChart3 } from 'lucide-react'
import { useMyResumeViews } from '@/hooks/useResume'
import { formatDate } from '@/lib/format'
import { SkeletonList, NotificationItemSkeleton, StatCardSkeleton } from '@/components/ui/Skeletons'

function StatCard({ icon: Icon, label, value, hint, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  )
}

function ViewItem({ item }) {
  const orgName = item.organization_name || "Noma'lum tashkilot"
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3 hover:border-brand-300 transition">
      {item.organization_logo ? (
        <img
          src={item.organization_logo}
          alt={orgName}
          className="w-12 h-12 rounded-lg object-cover bg-gray-50"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6 text-brand-500" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="font-medium text-gray-900 truncate">{orgName}</div>
        <div className="text-xs text-gray-500 mt-0.5">{item.role_display}</div>
      </div>
      <div className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {formatDate(item.viewed_at, { withTime: true })}
      </div>
    </div>
  )
}

function ResumeViewsPage() {
  const { data, isLoading, isError } = useMyResumeViews()

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <SkeletonList count={5} Component={NotificationItemSkeleton} className="space-y-2" />
      </div>
    )
  }

  if (isError || data?.detail) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl text-center">
          <Eye className="w-12 h-12 mx-auto mb-3 text-amber-500" />
          <h2 className="font-semibold mb-2">Rezyume yaratilmagan</h2>
          <p className="text-sm mb-4">
            Avval rezyume yarating — keyin uni kim ko'rganini ko'rishingiz mumkin bo'ladi.
          </p>
          <Link
            to="/resumes/my"
            className="inline-block px-5 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition"
          >
            Rezyume yaratish
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Sarlavha */}
      <div>
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Profilga qaytish
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Rezyumemni kim ko'rdi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ish beruvchilar sizning rezyumengizni ko'rganda bu sahifada ko'rinadi.
          Har 30 sekundda yangilanadi.
        </p>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Eye}
          label="Jami ko'rilishlar"
          value={data?.total ?? 0}
          color="brand"
        />
        <StatCard
          icon={Building2}
          label="Unique tashkilotlar"
          value={data?.unique_organizations ?? 0}
          hint="Bir tashkilot ko'p marta ko'rgan bo'lishi mumkin"
          color="blue"
        />
        <StatCard
          icon={BarChart3}
          label="Oxirgi 7 kunda"
          value={data?.last_7_days ?? 0}
          color="green"
        />
      </div>

      {/* Maxfiylik xabari */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3 text-sm text-gray-600">
        <ShieldCheck className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-gray-900">Maxfiylik:</strong> sizga faqat
          ko'rgan tashkilotning nomi ko'rinadi. Ko'ruvchining telefon raqami,
          emaili va shaxsiy ma'lumotlari sizga ochilmaydi.
        </div>
      </div>

      {/* Ro'yxat */}
      {data?.views?.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium text-gray-600">Hozircha hech kim ko'rmagan</p>
          <p className="text-sm mt-1">
            Rezyumengizni yaxshilang — yanada ko'proq diqqat tortadi.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            So'nggi ko'rilishlar (oxirgi 50 ta)
          </h2>
          {data?.views?.map((item) => (
            <ViewItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ResumeViewsPage
