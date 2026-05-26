import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, Send, Globe, Camera, Video } from 'lucide-react'
import Logo from '@/components/ui/Logo'

function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-950 text-white mt-12 sm:mt-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Logo */}
          <div>
            <Logo invert />
            <p className="text-sm text-brand-200 mt-4 max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              {t('footer.contact_us')}
            </h3>
            <ul className="space-y-2 text-sm text-brand-200">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="tel:+998712000140" className="hover:text-white transition">
                  +998 (71) 200-01-40
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="tel:+998712030140" className="hover:text-white transition">
                  +998 (71) 203-01-40
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="mailto:info@osonish.local" className="hover:text-white transition">
                  info@osonish.local
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              {t('footer.follow_social')}
            </h3>
            <div className="flex items-center gap-2">
              {[
                { icon: Send, href: '#', label: 'Telegram' },
                { icon: Video, href: '#', label: 'YouTube' },
                { icon: Camera, href: '#', label: 'Instagram' },
                { icon: Globe, href: '#', label: 'Facebook' },
              ].map((s) => {
                const Icon = s.icon
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-brand-500 flex items-center justify-center transition"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                )
              })}
            </div>
            <Link
              to="/login"
              className="mt-5 inline-block px-4 py-2 bg-white/10 hover:bg-white/20 text-sm rounded-lg transition"
            >
              {t('footer.moderator_login')}
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-brand-300">
          <div>{t('footer.copyright', { year })}</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-white transition">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
