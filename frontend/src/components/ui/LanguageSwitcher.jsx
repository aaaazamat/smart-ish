/**
 * LanguageSwitcher — UZ / RU tillarini almashtirish dropdown.
 *
 * Tanlov localStorage'da saqlanadi va keyingi sessiyalarda ham saqlanib turadi.
 * Hover'da chiroyli dropdown ochiladi (header'ga moslashgan kompakt o'lcham).
 */
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Check } from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '@/i18n'

function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Tashqarida bosilganda dropdown'ni yopish
  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Hozirgi til (uz, ru) — agar uzun (uz-UZ) bo'lsa, qisqartirish
  const currentCode = i18n.language?.split('-')[0] || 'uz'
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === currentCode) || SUPPORTED_LANGUAGES[0]

  const handleSelect = (code) => {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={`inline-flex items-center gap-1.5 rounded-lg
          ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
          font-medium text-gray-700 hover:bg-gray-100 transition`}
        aria-label={i18n.t('common.change_language')}
        aria-expanded={open}
      >
        <Globe className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>{current.flag}</span>
        <span className="uppercase">{current.code}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1.5 w-44 bg-white rounded-lg shadow-lg
            border border-gray-200 py-1 z-50 animate-in fade-in"
          style={{ animation: 'fadeInDown 0.15s ease-out' }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = lang.code === currentCode
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm
                  transition ${isActive
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
                {isActive && <Check className="w-4 h-4 text-brand-500" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
