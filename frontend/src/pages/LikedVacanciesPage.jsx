import { Link } from 'react-router-dom'
import { Loader2, AlertCircle, Heart } from 'lucide-react'
import { useLikedVacancies } from '@/hooks/useVacancies'
import VacancyCard from '@/components/vacancy/VacancyCard'

function LikedVacanciesPage() {
  const { data, isLoading, isError, error } = useLikedVacancies()

  const items = data?.results || []
  const total = data?.count || 0

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-7 h-7 text-red-500 fill-current" />
        <h1 className="text-3xl font-bold text-gray-900">Sevimli vakansiyalar</h1>
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
          <Heart className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sevimli vakansiyalar yo'q
          </h2>
          <p className="text-gray-500 mb-6">
            Vakansiya kartochkasidagi ❤️ tugmasi orqali saqlang — keyin shu yerda topasiz
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition"
          >
            Vakansiyalarni ko'rish
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {total} ta sevimli vakansiya
          </p>
          <div className="space-y-3">
            {items.map((v) => (
              <VacancyCard key={v.id} vacancy={v} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default LikedVacanciesPage
