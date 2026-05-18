import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, AlertCircle, ChevronDown, ChevronUp,
  Briefcase, MapPin, Building2,
} from 'lucide-react'
import { useAiTopVacanciesForMe } from '@/hooks/useAi'
import { getApiError } from '@/lib/apiError'
import { formatSalary } from '@/lib/format'
import { cn } from '@/lib/cn'
import { SkeletonList, AiMatchCardSkeleton } from '@/components/ui/Skeletons'

function ScoreBadge({ score }) {
  let color = 'bg-gray-100 text-gray-700'
  if (score >= 80) color = 'bg-green-100 text-green-700'
  else if (score >= 60) color = 'bg-brand-100 text-brand-700'
  else if (score >= 40) color = 'bg-amber-100 text-amber-700'
  else color = 'bg-red-100 text-red-700'

  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold', color)}>
      <Sparkles className="w-3 h-3" />
      {score}%
    </span>
  )
}

function RecommendedVacancyCard({ v }) {
  return (
    <Link
      to={`/vacancies/${v.vacancy_id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-400 hover:shadow-sm transition group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
          <Briefcase className="w-5 h-5 text-brand-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-gray-900 group-hover:text-brand-500 transition truncate">
              {v.profession_name}
            </h4>
            <ScoreBadge score={v.score} />
          </div>
          {v.organization_name && (
            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {v.organization_name}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-700 flex-wrap">
            <span className="font-medium">
              {formatSalary(v.salary_from, v.salary_to)}
            </span>
            {v.region_name && (
              <span className="flex items-center gap-1 text-gray-500">
                <MapPin className="w-3 h-3" />
                {v.region_name}
              </span>
            )}
          </div>
          {v.summary && (
            <p className="text-xs text-gray-600 mt-2 leading-snug line-clamp-2">{v.summary}</p>
          )}
          {v.matched?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {v.matched.map((m, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                  ✓ {m}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function AiRecommendedVacancies() {
  const [open, setOpen] = useState(false)
  const fetch = useAiTopVacanciesForMe()

  const handleToggle = () => {
    if (!open && !fetch.data && !fetch.isPending) {
      fetch.mutate()
    }
    setOpen((o) => !o)
  }

  return (
    <div className="bg-gradient-to-br from-brand-50 via-white to-purple-50/30 border border-brand-200 rounded-2xl p-5 mb-6">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {open ? 'Sizga AI tavsiya qilgan vakansiyalar' : '✨ Sizga eng mos top 5 vakansiyani topish'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              AI sizning rezyumengizga eng mos vakansiyalarni tanlaydi
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />}
      </button>

      {open && (
        <div className="mt-4">
          {fetch.isPending && (
            <div>
              <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                AI vakansiyalarni tahlil qilayapti... (15-30 sekund)
              </p>
              <SkeletonList count={3} Component={AiMatchCardSkeleton} />
            </div>
          )}

          {fetch.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{getApiError(fetch.error)}</span>
            </div>
          )}

          {fetch.data?.matched?.length === 0 && (
            <div className="bg-white border border-gray-200 p-4 rounded-lg text-sm text-gray-500 text-center">
              Mos vakansiya topilmadi
            </div>
          )}

          {fetch.data?.matched?.length > 0 && (
            <div className="space-y-2">
              {fetch.data.matched.map((v) => (
                <RecommendedVacancyCard key={v.vacancy_id} v={v} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AiRecommendedVacancies
