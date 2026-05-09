import { Sparkles, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { useAiMatch } from '@/hooks/useAi'
import { getApiError } from '@/lib/apiError'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'

function ScoreCircle({ score }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  let color = 'text-gray-400'
  if (score >= 80) color = 'text-green-500'
  else if (score >= 60) color = 'text-brand-500'
  else if (score >= 40) color = 'text-amber-500'
  else color = 'text-red-500'

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
        <circle
          cx="44" cy="44" r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-100"
        />
        <circle
          cx="44" cy="44" r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(color, 'transition-all duration-700')}
        />
      </svg>
      <div className={cn('absolute inset-0 flex flex-col items-center justify-center', color)}>
        <span className="text-2xl font-bold">{score}</span>
        <span className="text-xs">%</span>
      </div>
    </div>
  )
}

function MatchResult({ data }) {
  let label = 'Past'
  if (data.score >= 80) label = 'Juda yuqori'
  else if (data.score >= 60) label = 'Yuqori'
  else if (data.score >= 40) label = "O'rta"

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <ScoreCircle score={data.score} />
        <div className="min-w-0 flex-1">
          <div className="text-xs text-gray-500 mb-0.5">Mos kelish darajasi</div>
          <div className="text-lg font-semibold text-gray-900">{label}</div>
          {data.summary && (
            <p className="text-sm text-gray-600 mt-1.5 leading-snug">{data.summary}</p>
          )}
        </div>
      </div>

      {data.matched?.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sizning afzalliklaringiz
          </div>
          <ul className="space-y-1">
            {data.matched.map((m, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-green-500 shrink-0">✓</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.missing?.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            E'tibor bering
          </div>
          <ul className="space-y-1">
            {data.missing.map((m, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-amber-500 shrink-0">!</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

function MatchCard({ vacancyId, resumeId, hasResume = true, title }) {
  const match = useAiMatch()

  const handleCheck = () => {
    const data = { vacancy: Number(vacancyId) }
    if (resumeId) data.resume = Number(resumeId)
    match.mutate(data)
  }

  return (
    <div className="bg-gradient-to-br from-brand-50 via-white to-purple-50/30 border border-brand-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-gray-900">{title || 'AI Tahlil'}</h3>
      </div>

      {!hasResume && !resumeId && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
          Mosligini tekshirish uchun avval rezyume yarating
        </div>
      )}

      {(hasResume || resumeId) && !match.data && !match.isPending && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            AI sizga ushbu vakansiya qanchalik mos kelishini tahlil qiladi
          </p>
          <Button
            onClick={handleCheck}
            loading={match.isPending}
            className="w-full"
          >
            <Sparkles className="w-4 h-4" />
            Mosligini tekshirish
          </Button>
        </>
      )}

      {match.isPending && (
        <div className="flex items-center justify-center py-6 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          AI tahlil qilayapti...
        </div>
      )}

      {match.isError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{getApiError(match.error)}</span>
        </div>
      )}

      {match.data && (
        <>
          <MatchResult data={match.data} />
          <button
            type="button"
            onClick={handleCheck}
            disabled={match.isPending}
            className="mt-4 w-full inline-flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-brand-500 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Qayta tahlil qilish
          </button>
        </>
      )}
    </div>
  )
}

export default MatchCard
