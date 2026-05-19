/**
 * Employer'ning tashkilot ma'lumotlarini tahrirlash sahifasi.
 *
 * Boshqariladigan maydonlar:
 *   - Logo (rasm yuklash)
 *   - Nomi
 *   - Veb-sayt
 *   - Tavsif (description)
 *   - Hudud va tuman
 *
 * O'zgartirilmaydigan:
 *   - INN (yuridik raqam — admin tomonidan boshqariladi)
 *
 * Logo yuklash multipart/form-data sifatida yuboriladi.
 */
import { useRef, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Building2, Camera, Trash2, Globe, MapPin, FileText, Save,
  ArrowLeft, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react'
import { useEmployerOrganization, useUpdateEmployerOrganization } from '@/hooks/useEmployer'
import { useRegions, useDistricts } from '@/hooks/useReferences'
import { getApiError } from '@/lib/apiError'
import Button from '@/components/ui/Button'
import { StatCardSkeleton } from '@/components/ui/Skeletons'

const MAX_LOGO_SIZE = 5 * 1024 * 1024

function OrganizationPage() {
  const navigate = useNavigate()
  const { data: org, isLoading } = useEmployerOrganization()
  const update = useUpdateEmployerOrganization()
  const regions = useRegions()

  // Forma holati
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [description, setDescription] = useState('')
  const [regionId, setRegionId] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoError, setLogoError] = useState(null)
  const [success, setSuccess] = useState(false)
  const fileRef = useRef(null)

  const districts = useDistricts(regionId)

  // Backenddan kelgan ma'lumotni formaga o'tkazish
  useEffect(() => {
    if (!org) return
    setName(org.name || '')
    setWebsite(org.website || '')
    setDescription(org.description || '')
    setRegionId(org.region ? String(org.region) : '')
    setDistrictId(org.district ? String(org.district) : '')
  }, [org])

  const handleLogoChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setLogoError(null)

    if (!f.type.startsWith('image/')) {
      setLogoError('Faqat rasm fayli yuklash mumkin')
      return
    }
    if (f.size > MAX_LOGO_SIZE) {
      setLogoError(`Fayl 5 MB dan oshmasligi kerak (${(f.size / 1024 / 1024).toFixed(1)} MB)`)
      return
    }

    setLogoFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target.result)
    reader.readAsDataURL(f)
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    // null logo yuborish hozir backend'da to'g'ridan-to'g'ri tushunilmaydi.
    // Faqat formdan olib tashlanadi (mavjud rasm saqlanib qoladi)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSuccess(false)
    const payload = {
      name,
      website: website || '',
      description,
      region: regionId || null,
      district: districtId || null,
    }
    if (logoFile) {
      payload.logo = logoFile
    }
    update.mutate(payload, {
      onSuccess: () => {
        setSuccess(true)
        setLogoFile(null)
        setLogoPreview(null)
        setTimeout(() => setSuccess(false), 5000)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-amber-500" />
          <h2 className="font-semibold mb-2">Tashkilot biriktirilmagan</h2>
          <p className="text-sm">
            Administrator bilan bog'laning yoki ro'yxatdan qaytadan o'ting.
          </p>
        </div>
      </div>
    )
  }

  const apiError = update.error ? getApiError(update.error) : null
  const displayLogo = logoPreview || org.logo

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Sarlavha */}
      <div>
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Profilga qaytish
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Tashkilot sozlamalari</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sizning vakansiyalaringizda ko'rsatiladigan tashkilot ma'lumotlari.
        </p>
      </div>

      {/* Holat xabarlari */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg flex items-start gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Ma'lumotlar muvaffaqiyatli yangilandi</span>
        </div>
      )}
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Logo */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Camera className="w-4 h-4 text-brand-500" />
          Logo
        </h2>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center shrink-0 ring-1 ring-gray-200">
            {displayLogo ? (
              <img src={displayLogo} alt={org.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-10 h-10 text-brand-500" />
            )}
          </div>
          <div className="flex-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleLogoChange}
              className="hidden"
            />
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
              >
                <Camera className="w-4 h-4" />
                {org.logo || logoPreview ? 'Almashtirish' : 'Logo yuklash'}
              </button>
              {logoPreview && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Trash2 className="w-4 h-4" />
                  Tanlovni bekor qilish
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">JPG/PNG, maksimal 5 MB</p>
            {logoError && (
              <p className="text-xs text-red-600 mt-1.5 flex items-start gap-1">
                <AlertCircle className="w-3 h-3 mt-0.5" />
                {logoError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Asosiy maydonlar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-500" />
          Asosiy ma'lumotlar
        </h2>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Nomi *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={255}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">INN (raqamga tegmaydi)</label>
          <input
            type="text"
            value={org.inn || ''}
            disabled
            className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> Veb-sayt
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.uz"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Tavsif</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Tashkilot haqida qisqacha — faoliyat, missiya, qadriyatlar..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Viloyat
            </label>
            <select
              value={regionId}
              onChange={(e) => { setRegionId(e.target.value); setDistrictId('') }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
            >
              <option value="">— Tanlanmagan —</option>
              {regions.data?.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Tuman/Shahar</label>
            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              disabled={!regionId}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">— Tanlanmagan —</option>
              {districts.data?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Yuborish tugmasi */}
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          type="button"
          onClick={() => navigate(-1)}
        >
          Bekor qilish
        </Button>
        <Button type="submit" loading={update.isPending}>
          <Save className="w-4 h-4" />
          Saqlash
        </Button>
      </div>
    </form>
  )
}

export default OrganizationPage
