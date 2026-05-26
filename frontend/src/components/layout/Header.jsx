import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Heart, Bell, ChevronDown, LogOut, UserCircle, FileText,
  Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/store/authStore'
import { useMe, useLogout } from '@/hooks/useAuth'
import { useUnreadCount } from '@/hooks/useNotifications'
import Logo from '@/components/ui/Logo'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

// Navigatsiya kalitlari (i18n orqali tarjima qilinadi)
const NAV_BY_ROLE = {
  guest: [
    { to: '/vacancies', key: 'nav.vacancies' },
    { to: '/resumes', key: 'nav.resumes' },
  ],
  job_seeker: [
    { to: '/vacancies', key: 'nav.vacancies' },
    { to: '/applications', key: 'nav.applications' },
    { to: '/resumes/my', key: 'nav.my_resume' },
  ],
  employer: [
    { to: '/employer/dashboard', key: 'nav.employer_dashboard' },
    { to: '/employer/vacancies', key: 'nav.vacancies' },
    { to: '/employer/resumes', key: 'nav.resumes' },
    { to: '/employer/applications', key: 'application.status' },
  ],
  admin: [
    { to: '/admin/dashboard', key: 'nav.admin_panel' },
    { to: '/admin/users', key: 'nav.profile' },
    { to: '/admin/moderation', key: 'common.edit' },
    { to: '/admin/reference', key: 'common.search' },
    { to: '/admin/reports', key: 'common.error' },
  ],
}


function IconLink({ to, label, badge, children }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="relative p-2 rounded-full text-gray-500 hover:text-brand-500 hover:bg-gray-50 transition"
    >
      {children}
      {badge > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}


function ProfileMenu() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = () => {
    setOpen(false)
    logout.mutate(undefined, {
      onSettled: () => navigate('/', { replace: true }),
    })
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 p-1 sm:pr-2 rounded-full hover:bg-gray-50 transition"
      >
        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <UserCircle className="w-5 h-5 text-brand-500" />
          )}
        </div>
        <ChevronDown className="hidden sm:block w-4 h-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {user?.phone_number || t('nav.profile')}
            </div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <UserCircle className="w-4 h-4" />
            {t('nav.profile')}
          </Link>
          {user?.role === 'job_seeker' && (
            <Link
              to="/resumes/my"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FileText className="w-4 h-4" />
              {t('nav.my_resume')}
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
          >
            <LogOut className="w-4 h-4" />
            {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  )
}


/**
 * MobileMenu — telefon ekranida slide-in panel.
 * Hamburger tugma bosilganda chiqadi. Backdrop'ga bosish bilan yopiladi.
 */
function MobileMenu({ open, onClose, links, isAuthenticated, t }) {
  // Body scroll'ni bloklash menu ochilganda
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer (o'ngdan chiqadi) */}
      <div className="fixed inset-y-0 right-0 w-[85vw] max-w-sm bg-white z-50 lg:hidden shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => cn(
                'block px-4 py-3 rounded-xl text-base font-medium transition',
                isActive
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              {t(link.key)}
            </NavLink>
          ))}

          {!isAuthenticated && (
            <Link
              to="/login"
              onClick={onClose}
              className="block mt-4 px-4 py-3 rounded-xl text-center text-white font-semibold bg-brand-500 hover:bg-brand-600 transition"
            >
              {t('nav.login')}
            </Link>
          )}
        </nav>

        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">{t('mobile_menu.language')}:</span>
          <LanguageSwitcher compact />
        </div>
      </div>
    </>
  )
}


function Header() {
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  useMe()
  const { data: unreadCount = 0 } = useUnreadCount()
  const [mobileOpen, setMobileOpen] = useState(false)

  const role = !isAuthenticated ? 'guest' : user?.role || 'guest'
  const isEmployer = role === 'employer'
  const isAdmin = role === 'admin'
  const visibleLinks = NAV_BY_ROLE[role] || NAV_BY_ROLE.guest
  const unreadCountValue = isAuthenticated ? (unreadCount?.unread_count ?? unreadCount ?? 0) : 0

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-6">
        {/* Logo (har doim ko'rinadi) */}
        <Logo />

        {/* Desktop nav (lg dan boshlab) */}
        <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'text-base font-medium transition whitespace-nowrap',
                  isActive
                    ? 'text-brand-500'
                    : 'text-gray-700 hover:text-brand-500'
                )
              }
            >
              {t(link.key)}
            </NavLink>
          ))}
        </nav>

        {/* O'ng tomon: faqat muhim icon'lar mobile'da */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Til (faqat desktopda, mobile'da drawer ichida) */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* Sevimlilar — faqat job_seeker uchun, desktopda */}
          {isAuthenticated && !isEmployer && !isAdmin && (
            <div className="hidden sm:block">
              <IconLink to="/vacancies/liked" label={t('nav.liked')}>
                <Heart className="w-6 h-6" />
              </IconLink>
            </div>
          )}

          {/* Bildirishnomalar */}
          {isAuthenticated && (
            <IconLink to="/notifications" label={t('nav.notifications')} badge={unreadCountValue}>
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            </IconLink>
          )}

          {/* Profile yoki Kirish */}
          {isAuthenticated ? (
            <ProfileMenu />
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex ml-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition whitespace-nowrap"
            >
              {t('nav.login')}
            </Link>
          )}

          {/* Hamburger — faqat mobile'da */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            aria-label={t('mobile_menu.open')}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile drawer menyu */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={visibleLinks}
        isAuthenticated={isAuthenticated}
        t={t}
      />
    </header>
  )
}

export default Header
