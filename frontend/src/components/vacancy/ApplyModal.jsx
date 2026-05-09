import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, FileText } from 'lucide-react'
import { useApplyToVacancy } from '@/hooks/useApplications'
import { useMyResume } from '@/hooks/useResume'
import { getApiError } from '@/lib/apiError'
import Modal from '@/components/ui/Modal'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

function ApplyModal({ open, onClose, vacancy }) {
  const [coverLetter, setCoverLetter] = useState('')
  const { data: resume } = useMyResume()
  const apply = useApplyToVacancy()

  const handleSubmit = (e) => {
    e.preventDefault()
    apply.mutate(
      { vacancyId: vacancy.id, data: { cover_letter: coverLetter } },
      {
        onSuccess: () => {
          setTimeout(() => {
            onClose()
            setCoverLetter('')
            apply.reset()
          }, 1500)
        },
      }
    )
  }

  const handleClose = () => {
    onClose()
    apply.reset()
    setCoverLetter('')
  }

  return (
    <Modal open={open} onClose={handleClose} title="Vakansiyaga ariza yuborish" size="lg">
      <div className="mb-5 pb-4 border-b border-gray-100">
        <p className="text-sm text-gray-500">Quyidagi vakansiyaga ariza yuborayapsiz:</p>
        <p className="font-semibold text-gray-900 mt-1">{vacancy?.profession_name}</p>
        <p className="text-sm text-gray-600">{vacancy?.organization?.name}</p>
      </div>

      {!resume && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start gap-3">
          <FileText className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium mb-1">Avval rezyume yarating</p>
            <p className="text-sm mb-3">
              Ariza yuborish uchun sizda rezyume bo'lishi kerak.
            </p>
            <Link to="/resumes/my" onClick={handleClose}>
              <Button size="sm">Rezyume yaratish</Button>
            </Link>
          </div>
        </div>
      )}

      {resume && apply.isSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Ariza muvaffaqiyatli yuborildi!</p>
            <p className="text-sm mt-1">
              Mening arizalarim sahifasida holatni kuzatib turing.
            </p>
          </div>
        </div>
      )}

      {resume && !apply.isSuccess && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {apply.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{getApiError(apply.error)}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Sopromorat xat (ixtiyoriy)
            </label>
            <Textarea
              rows={6}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Nima uchun aynan siz bu lavozim uchun mosligingizni ish beruvchiga tushuntiring..."
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Yaxshi xat ish beruvchini sizga e'tibor qaratishga undaydi
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Bekor qilish
            </Button>
            <Button type="submit" loading={apply.isPending}>
              Ariza yuborish
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default ApplyModal
