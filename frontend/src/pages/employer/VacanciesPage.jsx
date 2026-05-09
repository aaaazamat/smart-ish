import { Link } from 'react-router-dom'
import {
  Plus, Loader2, AlertCircle, Briefcase, Eye, Users, Heart,
  Pencil, Trash2, Power, ExternalLink,
} from 'lucide-react'
import {
  useEmployerVacancies,
  useDeleteVacancy,
  useToggleVacancyActive,
} from '@/hooks/useEmployer'
import { formatSalary, formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'
import AiTopCandidates from '@/components/ai/AiTopCandidates'

function VacancyRow({ v, onDelete, onToggle, isToggling, isDeleting }) {
  return (
    <div className={cn(
      'bg-white rounded-2xl border p-5 transition',
      v.is_active ? 'border-gray-200' : 'border-gray-200 opacity-70'
    )}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link
              to={`/employer/vacancies/${v.id}/edit`}
              className="text-lg font-semibold text-gray-900 hover:text-brand-500 transition"
            >
              {v.profession_name || 'Kasb belgilanmagan'}
            </Link>
            {v.is_active ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Faol
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Yopiq
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 font-medium">
            {formatSalary(v.salary_from, v.salary_to)}
          </p>
          {v.region_name && (
            <p className="text-sm text-gray-500 mt-1">
              {v.region_name}{v.district_name && `, ${v.district_name}`}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> {formatNumber(v.views_count || 0)}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" /> {v.applications_count || 0} ariza
        </span>
        <span className="ml-auto">{formatDate(v.created_at)}</span>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
        <Link
          to={`/vacancies/${v.id}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-brand-500 px-3 py-1.5 rounded-lg hover:bg-gray-50"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ommaviy ko'rinish
        </Link>
        <Link
          to={`/employer/vacancies/${v.id}/edit`}
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-brand-500 px-3 py-1.5 rounded-lg hover:bg-gray-50"
        >
          <Pencil className="w-3.5 h-3.5" />
          Tahrirlash
        </Link>
        <button
          type="button"
          onClick={() => onToggle(v.id)}
          disabled={isToggling}
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-50 disabled:opacity-40"
        >
          <Power className="w-3.5 h-3.5" />
          {v.is_active ? 'Yopish' : 'Faollash'}
        </button>
        <button
          type="button"
          onClick={() => onDelete(v.id)}
          disabled={isDeleting}
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-40 ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          O'chirish
        </button>
      </div>

      <AiTopCandidates vacancyId={v.id} vacancyActive={v.is_active} />
    </div>
  )
}

function EmployerVacanciesPage() {
  const { data: items = [], isLoading, isError, error } = useEmployerVacancies()
  const remove = useDeleteVacancy()
  const toggle = useToggleVacancyActive()

  const handleDelete = (id) => {
    if (!window.confirm('Vakansiyani o\'chirishni tasdiqlaysizmi? Barcha arizalar ham yo\'qoladi.')) return
    remove.mutate(id)
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vakansiyalarim</h1>
          <p className="text-gray-500 mt-1">Yaratgan vakansiyalaringiz</p>
        </div>
        <Link to="/employer/vacancies/new">
          <Button>
            <Plus className="w-4 h-4" />
            Yangi vakansiya
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Yuklanmoqda...
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error?.message || 'Xato yuz berdi'}</span>
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Briefcase className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sizda hali vakansiya yo'q
          </h2>
          <p className="text-gray-500 mb-6">
            Birinchi vakansiyangizni yaratib, nomzodlarni jalb qilishni boshlang
          </p>
          <Link to="/employer/vacancies/new">
            <Button size="lg">
              <Plus className="w-4 h-4" />
              Birinchi vakansiyani yaratish
            </Button>
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">{items.length} ta vakansiya</p>
          <div className="space-y-3">
            {items.map((v) => (
              <VacancyRow
                key={v.id}
                v={v}
                onDelete={handleDelete}
                onToggle={(id) => toggle.mutate(id)}
                isToggling={toggle.isPending}
                isDeleting={remove.isPending}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default EmployerVacanciesPage
