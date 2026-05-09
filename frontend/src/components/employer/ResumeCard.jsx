import { Link } from 'react-router-dom'
import { MapPin, User, CheckCircle2 } from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

function ResumeCard({ resume }) {
  const location = [resume.region_name, resume.district_name].filter(Boolean).join(', ')

  return (
    <Link
      to={`/employer/resumes/${resume.id}`}
      className="block bg-white rounded-2xl border border-gray-200 p-5 hover:border-brand-300 hover:shadow-sm transition group"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
          <User className="w-6 h-6 text-brand-500" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-500 transition">
                {resume.full_name || 'Nomzod'}
                {resume.age && <span className="text-sm font-normal text-gray-500 ml-2">{resume.age} yosh</span>}
              </h3>
              {resume.profession_name && (
                <p className="text-sm text-brand-500 mt-0.5">{resume.profession_name}</p>
              )}
            </div>
            {resume.has_invited && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                Taklif yuborilgan
              </span>
            )}
          </div>

          {resume.career_level_display && (
            <p className="text-sm text-gray-600 mt-1.5">{resume.career_level_display}</p>
          )}

          {resume.expected_salary && (
            <p className="text-sm font-medium text-gray-900 mt-2">
              {formatNumber(resume.expected_salary)} so'm
            </p>
          )}

          {location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </div>
          )}

          {resume.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {resume.skills.slice(0, 5).map((s) => (
                <span key={s.id} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {s.name}
                </span>
              ))}
              {resume.skills.length > 5 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  +{resume.skills.length - 5}
                </span>
              )}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
            {resume.employment_status_display} · Yangilangan: {formatDate(resume.updated_at)}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ResumeCard
