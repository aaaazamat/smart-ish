import { Link } from 'react-router-dom'
import { Heart, MapPin, Building2 } from 'lucide-react'
import { formatSalary, formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

function VacancyCard({ vacancy }) {
  const {
    id,
    profession_name,
    organization_name,
    organization_logo,
    region_name,
    district_name,
    salary_from,
    salary_to,
    is_liked,
    created_at,
  } = vacancy

  const location = [region_name, district_name].filter(Boolean).join(', ')

  return (
    <Link
      to={`/vacancies/${id}`}
      className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-brand-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-brand-500 transition mb-1">
            {profession_name}
          </h3>
          <p className="text-sm text-gray-500 uppercase tracking-wide line-clamp-2">
            {organization_name}
          </p>

          <div className="mt-4 text-base text-gray-900 font-medium">
            {formatSalary(salary_from, salary_to)}
          </div>

          {location && (
            <div className="mt-3 flex items-center gap-1.5 text-brand-500">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="text-sm">{location}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
            }}
            aria-label="Sevimlilarga qo'shish"
            className={cn(
              'p-2 rounded-full hover:bg-gray-50 transition',
              is_liked ? 'text-red-500' : 'text-gray-300 hover:text-red-500'
            )}
          >
            <Heart className={cn('w-6 h-6', is_liked && 'fill-current')} />
          </button>

          <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
            {organization_logo ? (
              <img
                src={organization_logo}
                alt=""
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className="w-6 h-6 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-4 text-xs text-gray-400">
        <span>ID: {id}</span>
        <span>E'lon qilingan: {formatDate(created_at)}</span>
      </div>
    </Link>
  )
}

export default VacancyCard
