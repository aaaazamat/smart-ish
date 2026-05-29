import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, ArrowLeft, ShieldAlert } from 'lucide-react'
import { adminApi } from '@/api/endpoints'
import { applyApiErrorsToForm } from '@/lib/apiError'
import VacancyForm from '@/components/employer/VacancyForm'

/**
 * Admin tomonidan har qanday vakansiyani tahrirlash sahifasi.
 * Employer'ning VacancyForm komponentini qayta ishlatadi, lekin
 * admin API endpoint'lari bilan (/admin/vacancies/:id/).
 */
function AdminVacancyEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: vacancy, isLoading } = useQuery({
    queryKey: ['admin-vacancy', id],
    queryFn: () => adminApi.vacancyDetail(id),
  })

  const update = useMutation({
    mutationFn: (data) => adminApi.vacancyUpdate(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-vacancies'] })
      qc.invalidateQueries({ queryKey: ['admin-vacancy', id] })
      navigate('/admin/moderation', { replace: true })
    },
  })

  const handleSubmit = (payload, setError) => {
    update.mutate(payload, {
      onError: (e) => applyApiErrorsToForm(e, setError),
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-16 flex items-center justify-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Yuklanmoqda...
      </div>
    )
  }

  if (!vacancy) {
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <p className="text-gray-500">Vakansiya topilmadi</p>
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        to="/admin/moderation"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Moderatsiyaga qaytish
      </Link>

      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="w-6 h-6 text-brand-500" />
        <h1 className="text-3xl font-bold text-gray-900">Vakansiyani tahrirlash</h1>
      </div>
      <p className="text-gray-500 mb-6">
        Administrator sifatida tahrirlamoqdasiz
        {vacancy.organization?.name ? ` · ${vacancy.organization.name}` : ''}
      </p>

      <VacancyForm
        initialData={vacancy}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/moderation')}
        isPending={update.isPending}
        error={update.error}
      />
    </div>
  )
}

export default AdminVacancyEditPage
