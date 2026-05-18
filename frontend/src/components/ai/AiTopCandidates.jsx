import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, AlertCircle, ChevronDown, ChevronUp,
  User, MapPin, Award,
} from 'lucide-react'
import { useAiTopMatchedResumes } from '@/hooks/useAi'
import { getApiError } from '@/lib/apiError'
import { formatNumber } from '@/lib/format'
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

function CandidateCard({ c }) {
  return (
    <Link
      to={`/employer/resumes/${c.resume_id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-400 hover:shadow-sm transition group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-brand-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-gray-900 group-hover:text-brand-500 transition truncate">
              {c.full_name}
            </h4>
            <ScoreBadge score={c.score} />
          </div>
          {c.profession_name && (
            <p className="text-xs text-brand-500 mb-1">{c.profession_name}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            {c.career_level_display && (
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                {c.career_level_display}
              </span>
            )}
            {c.region_name && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {c.region_name}
              </span>
            )}
            {c.expected_salary && (
              <span>{formatNumber(c.expected_salary)} so'm</span>
            )}
          </div>
          {c.summary && (
            <p className="text-xs text-gray-600 mt-2 leading-snug line-clamp-2">{c.summary}</p>
          )}
          {c.matched?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {c.matched.map((m, i) => (
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

function AiTopCandidates({ vacancyId, vacancyActive }) {
  const [open, setOpen] = useState(false)
  const fetch = useAiTopMatchedResumes()

  const handleToggle = () => {
    if (!open && !fetch.data && !fetch.isPending) {
      fetch.mutate(vacancyId)
    }
    setOpen((o) => !o)
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button
        type="button"
        onClick={handleToggle}
        disabled={!vacancyActive}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition',
          vacancyActive
            ? 'bg-gradient-to-r from-brand-50 to-purple-50 text-brand-700 hover:from-brand-100 hover:to-purple-100 border border-brand-200'
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
        )}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {open ? 'AI tavsiya nomzodlar' : 'AI bilan top 5 nomzodni topish'}
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="mt-3">
          {fetch.isPending && (
            <div>
              <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                AI nomzodlarni tahlil qilayapti... (15-30 sekund)
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
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-sm text-gray-500 text-center">
              Mos nomzodlar topilmadi
            </div>
          )}

          {fetch.data?.matched?.length > 0 && (
            <div className="space-y-2">
              {fetch.data.matched.map((c) => (
                <CandidateCard key={c.resume_id} c={c} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AiTopCandidates
