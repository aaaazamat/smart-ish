import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  Heart, MapPin, Building2, Briefcase, GraduationCap, Clock,
  Calendar, Users, Eye, Globe, ArrowLeft, AlertCircle, Loader2,
  CheckCircle2, BadgeCheck,
} from 'lucide-react'
import { useVacancyDetail, useSimilarVacancies, useToggleLike } from '@/hooks/useVacancies'
import { useAuthStore } from '@/store/authStore'
import { formatSalary, formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'
import VacancyCard from '@/components/vacancy/VacancyCard'
import ApplyModal from '@/components/vacancy/ApplyModal'
import MatchCard from '@/components/ai/MatchCard'
import { useMyResume } from '@/hooks/useResume'

function InfoItem({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="w-5 h-5 text-brand-500 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
    </div>
  )
}

function Tag({ children, color = 'gray' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    brand: 'bg-brand-50 text-brand-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium', colors[color])}>
      {children}
    </span>
  )
}

function VacancyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { data: v, isLoading, isError, error } = useVacancyDetail(id)
  const { data: similar } = useSimilarVacancies(id)
  const toggleLike = useToggleLike()
  const [applyOpen, setApplyOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const isJobSeeker = user?.role === 'job_seeker'
  const { data: myResume } = useMyResume()

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate(`/login?next=/vacancies/${id}`)
      return
    }
    toggleLike.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-16 flex items-center justify-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Yuklanmoqda...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium mb-1">Vakansiya topilmadi</div>
            <div className="text-sm">
              {error?.response?.status === 404
                ? 'Bunday ID bilan vakansiya mavjud emas yoki o\'chirilgan.'
                : error?.message || 'Maʼlumot olishda xatolik'}
            </div>
          </div>
        </div>
        <Link to="/" className="mt-4 inline-flex items-center gap-1 text-brand-500 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Vakansiyalarga qaytish
        </Link>
      </div>
    )
  }

  if (!v) return null

  const location = [v.region_name, v.district_name].filter(Boolean).join(', ')
  const ageRange = v.age_from && v.age_to ? `${v.age_from} - ${v.age_to} yosh`
    : v.age_from ? `${v.age_from} yoshdan` : v.age_to ? `${v.age_to} yoshgacha` : null

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 mb-4 transition">
        <ArrowLeft className="w-4 h-4" /> Vakansiyalarga qaytish
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {v.profession_name}
                </h1>
                <p className="text-sm text-gray-500 uppercase tracking-wide">
                  {v.organization?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLike}
                aria-label="Sevimlilar"
                className={cn(
                  'p-3 rounded-full hover:bg-gray-50 transition shrink-0',
                  v.is_liked ? 'text-red-500' : 'text-gray-300 hover:text-red-500'
                )}
              >
                <Heart className={cn('w-7 h-7', v.is_liked && 'fill-current')} />
              </button>
            </div>

            <div className="text-2xl font-bold text-gray-900 mb-4">
              {formatSalary(v.salary_from, v.salary_to)}
            </div>

            {location && (
              <div className="flex items-center gap-2 text-brand-500 mb-5">
                <MapPin className="w-5 h-5" />
                <span className="text-base">{location}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {v.employment_type_display && <Tag color="brand">{v.employment_type_display}</Tag>}
              {v.work_mode_display && <Tag color="brand">{v.work_mode_display}</Tag>}
              {v.work_schedule_display && <Tag>{v.work_schedule_display}</Tag>}
              {v.experience_required_display && <Tag>{v.experience_required_display}</Tag>}
              {v.for_disabled && <Tag color="green">Nogironlar uchun</Tag>}
              {v.for_graduates && <Tag color="green">Bitiruvchilar uchun</Tag>}
              {v.for_students && <Tag color="green">Talabalar uchun</Tag>}
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-5 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> {formatNumber(v.views_count || 0)} ko'rildi
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" /> {v.applications_count || 0} ariza
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {formatDate(v.created_at)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Asosiy ma'lumotlar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 sm:[&>*:nth-child(odd)]:border-r [&>*]:border-gray-100">
              <InfoItem icon={Briefcase} label="Tajriba" value={v.experience_required_display} />
              <InfoItem icon={GraduationCap} label="Ta'lim" value={v.education_level_display} />
              <InfoItem icon={Clock} label="Bandlik turi" value={v.employment_type_display} />
              <InfoItem icon={Clock} label="Ish jadvali" value={v.work_schedule_display} />
              <InfoItem icon={Globe} label="Ish rejimi" value={v.work_mode_display} />
              <InfoItem icon={Users} label="Jins" value={v.gender_display} />
              {ageRange && <InfoItem icon={Users} label="Yosh" value={ageRange} />}
              {v.industry_name && <InfoItem icon={Briefcase} label="Soha" value={v.industry_name} />}
            </div>
          </div>

          {v.description && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Vakansiya tavsifi</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{v.description}</p>
            </div>
          )}

          {v.language_requirements?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Til talablari</h2>
              <div className="space-y-2">
                {v.language_requirements.map((lr) => (
                  <div key={lr.id} className="flex items-center gap-2 text-sm">
                    <BadgeCheck className="w-4 h-4 text-brand-500" />
                    <span className="text-gray-700">{lr.language} — {lr.min_level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {similar?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">O'xshash vakansiyalar</h2>
              <div className="space-y-3">
                {similar.slice(0, 3).map((s) => (
                  <VacancyCard key={s.id} vacancy={s} />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 h-fit">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {v.has_applied ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-start gap-2 text-sm mb-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>Siz bu vakansiyaga ariza yuborgansiz</span>
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full"
                disabled={v.has_applied}
                onClick={() => {
                  if (!isAuthenticated) navigate(`/login?next=/vacancies/${id}`)
                  else setApplyOpen(true)
                }}
              >
                Ariza yuborish
              </Button>
            )}
            <p className="text-xs text-gray-500 text-center mt-3">
              Ariza yuborish uchun rezyumengiz bo'lishi kerak
            </p>
          </div>

          {isJobSeeker && (
            <MatchCard
              vacancyId={v.id}
              hasResume={!!myResume}
              title="AI tahlil"
            />
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Tashkilot</h3>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {v.organization?.logo ? (
                  <img src={v.organization.logo} alt="" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/organizations/${v.organization?.id}`}
                  className="text-sm font-semibold text-gray-900 hover:text-brand-500 transition line-clamp-2"
                >
                  {v.organization?.name}
                </Link>
                {v.organization?.vacancies_count !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">
                    {v.organization.vacancies_count} ta faol vakansiya
                  </p>
                )}
                {v.organization?.website && (
                  <a
                    href={v.organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-500 hover:underline mt-1 inline-flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3" /> Veb-sayt
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-xs text-gray-500 space-y-1">
            <div>ID: <span className="text-gray-700">{v.id}</span></div>
            <div>E'lon qilingan: <span className="text-gray-700">{formatDate(v.created_at)}</span></div>
            {v.expires_at && (
              <div>Amal qiladi: <span className="text-gray-700">{formatDate(v.expires_at)}</span></div>
            )}
          </div>
        </aside>
      </div>

      <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} vacancy={v} />
    </div>
  )
}

export default VacancyDetailPage
