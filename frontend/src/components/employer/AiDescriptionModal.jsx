import { useState, useEffect } from 'react'
import { Sparkles, AlertCircle, RefreshCw, Wand2 } from 'lucide-react'
import { useGenerateVacancyDescription } from '@/hooks/useAi'
import { getApiError } from '@/lib/apiError'
import Modal from '@/components/ui/Modal'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

function AiDescriptionModal({ open, onClose, profession, industry, onApply }) {
  const [keywords, setKeywords] = useState('')
  const generate = useGenerateVacancyDescription()

  useEffect(() => {
    if (!open) {
      setKeywords('')
      generate.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleGenerate = () => {
    if (!profession) return
    generate.mutate({
      profession: Number(profession),
      industry: industry ? Number(industry) : undefined,
      keywords: keywords.trim() || undefined,
    })
  }

  const handleApply = () => {
    if (generate.data?.description) {
      onApply(generate.data.description)
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="✨ AI yordamida tavsif yozish" size="lg">
      {!profession && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg flex items-start gap-2 text-sm mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Avval forma yuqorisida <strong>Kasb / Lavozim</strong> ni tanlang.</span>
        </div>
      )}

      {profession && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Qo'shimcha kalit so'zlar (ixtiyoriy)
            </label>
            <Textarea
              rows={3}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Masalan: masofaviy ish, JavaScript, React, 3 yil tajriba, jamoaviy ishlash..."
              disabled={generate.isPending}
            />
            <p className="mt-1.5 text-xs text-gray-500">
              AI shu kalit so'zlarni hisobga olib professional tavsif yozadi
            </p>
          </div>

          {!generate.data && (
            <Button
              onClick={handleGenerate}
              loading={generate.isPending}
              size="lg"
              className="w-full"
            >
              <Wand2 className="w-4 h-4" />
              {generate.isPending ? 'AI yozayapti...' : 'Yaratish'}
            </Button>
          )}

          {generate.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm mt-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{getApiError(generate.error)}</span>
            </div>
          )}

          {generate.data?.description && (
            <>
              <div className="mt-4 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span className="text-sm font-medium text-gray-700">AI yaratgan tavsif</span>
              </div>
              <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4 text-sm text-gray-800 whitespace-pre-line max-h-[400px] overflow-y-auto">
                {generate.data.description}
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => generate.reset()}
                >
                  <RefreshCw className="w-4 h-4" />
                  Qaytadan yaratish
                </Button>
                <Button type="button" size="sm" onClick={handleApply}>
                  <Sparkles className="w-4 h-4" />
                  Forma'ga qo'shish
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  )
}

export default AiDescriptionModal
