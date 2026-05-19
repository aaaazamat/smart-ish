import { useNavigate, useParams, Link } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useEmployerVacancy, useCreateVacancy, useUpdateVacancy } from '@/hooks/useEmployer'
import { applyApiErrorsToForm } from '@/lib/apiError'
import VacancyForm from '@/components/employer/VacancyForm'

function VacancyFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: vacancy, isLoading } = useEmployerVacancy(id)
  const create = useCreateVacancy()
  const update = useUpdateVacancy()

  const handleSubmit = (payload, setError) => {
    if (isEdit) {
      update.mutate({ id, data: payload }, {
        onSuccess: () => navigate('/employer/vacancies', { replace: true }),
        onError: (e) => applyApiErrorsToForm(e, setError),
      })
    } else {
      create.mutate(payload, {
        onSuccess: () => navigate('/employer/vacancies', { replace: true }),
        onError: (e) => applyApiErrorsToForm(e, setError),
      })
    }
  }

  if (isEdit && isLoading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-16 flex items-center justify-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Yuklanmoqda...
      </div>
    )
  }

  if (isEdit && !vacancy) {
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <p className="text-gray-500">Vakansiya topilmadi</p>
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link
        to="/employer/vacancies"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Vakansiyalarga qaytish
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Vakansiyani tahrirlash' : 'Yangi vakansiya'}
      </h1>

      <VacancyForm
        initialData={vacancy}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/employer/vacancies')}
        isPending={create.isPending || update.isPending}
        error={create.error || update.error}
      />
    </div>
  )
}

export default VacancyFormPage
