/**
 * i18n konfiguratsiyasi — uz/ru tarjimalari.
 *
 * Tilni o'zgartirish:
 *   import { useTranslation } from 'react-i18next'
 *   const { i18n } = useTranslation()
 *   i18n.changeLanguage('ru')
 *
 * Brauzer tilini avtomatik aniqlash:
 *   - localStorage > navigator.language > fallback (uz)
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import uz from './locales/uz.json'
import ru from './locales/ru.json'

export const SUPPORTED_LANGUAGES = [
  { code: 'uz', name: "O'zbek", flag: '🇺🇿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      ru: { translation: ru },
    },
    fallbackLng: 'uz',
    supportedLngs: ['uz', 'ru'],
    nonExplicitSupportedLngs: true,
    debug: false,
    interpolation: {
      escapeValue: false, // React allaqachon XSS dan himoyalaydi
    },
    detection: {
      // Tartib: avval localStorage, keyin brauzer tili
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18n_language',
    },
    react: {
      useSuspense: false, // Suspense'siz, lazy yuklash uchun
    },
  })

// HTML lang atribut'ini sinxronlash
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})
document.documentElement.lang = i18n.language || 'uz'

export default i18n
