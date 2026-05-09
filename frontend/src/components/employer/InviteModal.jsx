import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Briefcase } from 'lucide-react'
import { useEmployerVacancies, useInviteToVacancy } from '@/hooks/useEmployer'
import { getApiError } from '@/lib/apiError'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

function InviteModal({ open, onClose, resume }) {
  const [vacancyId, setVacancyId] = useState('')
  const [note, setNote] = useState('')

  const { data: vacancies = [] } = useEmployerVacancies()
  const invite = useInviteToVacancy()
  const activeVacancies = vacancies.filter((v) => v.is_active)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!vacancyId) return
    invite.mutate(
      {
        resumeId: resume.id,
        data: { vacancy: Number(vacancyId), note },
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            onClose()
            setVacancyId('')
            setNote('')
            invite.reset()
          }, 1500)
        },
      }
    )
  }

  const handleClose = () => {
    onClose()
    invite.reset()
    setVacancyId('')
    setNote('')
  }

  const fullName = resume ? [resume.last_name, resume.first_name].filter(Boolean).join(' ') : ''

  return (
    <Modal open={open} onClose={handleClose} title="Nomzodga taklif yuborish" size="lg">
      <div className="mb-5 pb-4 border-b border-gray-100">
        <p className="text-sm text-gray-500">Nomzod:</p>
        <p className="font-semibold text-gray-900 mt-1">{fullName}</p>
      </div>

      {activeVacancies.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start gap-3">
          <Briefcase className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium mb-1">Faol vakansiya yo'q</p>
            <p className="text-sm mb-3">Avval kamida bitta faol vakansiya yarating.</p>
            <Link to="/employer/vacancies/new" onClick={handleClose}>
              <Button size="sm">Vakansiya yaratish</Button>
            </Link>
          </div>
        </div>
      )}

      {activeVacancies.length > 0 && invite.isSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Taklif muvaffaqiyatli yuborildi!</p>
            <p className="text-sm mt-1">Nomzod sizning taklifingizni ko'rib chiqadi.</p>
          </div>
        </div>
      )}

      {activeVacancies.length > 0 && !invite.isSuccess && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {invite.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{getApiError(invite.error)}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Vakansiya *
            </label>
            <Select value={vacancyId} onChange={(e) => setVacancyId(e.target.value)}>
              <option value="">Vakansiyani tanlang</option>
              {activeVacancies.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.profession_name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Xabar (ixtiyoriy)
            </label>
            <Textarea
              rows={5}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nomzodga xabar yozing — nima uchun aynan u sizning vakansiyangizga mos..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Bekor qilish
            </Button>
            <Button type="submit" loading={invite.isPending} disabled={!vacancyId}>
              Taklif yuborish
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default InviteModal
