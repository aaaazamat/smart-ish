/**
 * AvatarUploader — ProfilePage'da rasm yuklash uchun komponent.
 *
 * - Drag & drop yo'q (sodda variant — fayl tanlash dialogi)
 * - Client-side validatsiya:
 *   • Faqat rasm fayllari (image/*)
 *   • Maksimal 5 MB
 *   • Kvadrat shaklida tavsiya etiladi (lekin majburiy emas)
 * - Yuklashdan oldin local preview
 * - Backendga jo'natilgandan keyin server URL bilan almashtiriladi
 * - "O'chirish" tugmasi mavjud rasmni olib tashlaydi
 */
import { useRef, useState } from 'react'
import { Camera, Trash2, AlertCircle, UserCircle, Loader2 } from 'lucide-react'
import { useUploadAvatar, useRemoveAvatar } from '@/hooks/useAuth'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

function AvatarUploader({ currentAvatarUrl, name = "User" }) {
  const fileRef = useRef(null)
  const [error, setError] = useState(null)
  const [localPreview, setLocalPreview] = useState(null)
  const upload = useUploadAvatar()
  const remove = useRemoveAvatar()

  const displayUrl = localPreview || currentAvatarUrl
  const initial = (name?.[0] || 'U').toUpperCase()

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validatsiya
    if (!file.type.startsWith('image/')) {
      setError("Faqat rasm fayli (JPG, PNG, WEBP) yuklash mumkin")
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`Fayl hajmi 5 MB dan oshmasligi kerak (${(file.size / 1024 / 1024).toFixed(1)} MB)`)
      return
    }

    // Lokal preview
    const reader = new FileReader()
    reader.onload = (ev) => setLocalPreview(ev.target.result)
    reader.readAsDataURL(file)

    // Backendga yuklash
    upload.mutate(file, {
      onError: (err) => {
        setError(err?.response?.data?.detail || "Yuklashda xato yuz berdi")
        setLocalPreview(null)
      },
      onSuccess: () => {
        // Server javobida URL bor — local preview olib tashlanadi
        setTimeout(() => setLocalPreview(null), 500)
      },
    })
  }

  const handleRemove = () => {
    if (!confirm("Rasmni o'chirishni xohlaysizmi?")) return
    setError(null)
    setLocalPreview(null)
    remove.mutate()
  }

  const busy = upload.isPending || remove.isPending

  return (
    <div className="flex items-center gap-5">
      {/* Avatar */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center ring-4 ring-white shadow-sm">
          {displayUrl ? (
            <img src={displayUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-brand-700">{initial}</span>
          )}
        </div>

        {busy && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Tugmalar va xato */}
      <div className="flex-1 min-w-0">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium
              bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-4 h-4" />
            {currentAvatarUrl ? "Almashtirish" : "Rasm yuklash"}
          </button>

          {currentAvatarUrl && !busy && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm
                text-gray-600 rounded-lg hover:bg-gray-100 hover:text-red-600 transition"
            >
              <Trash2 className="w-4 h-4" />
              O'chirish
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          JPG, PNG yoki WEBP — maksimal 5 MB.
          <br />
          Kvadrat shaklidagi rasm tavsiya etiladi.
        </p>

        {error && (
          <div className="mt-2 text-xs text-red-600 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AvatarUploader
