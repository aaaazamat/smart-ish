import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  Heart,
  Bell,
  MoreHorizontal,
  HelpCircle,
  ChevronDown,
  LogOut,
  UserCircle,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/store/authStore'
import { useMe, useLogout } from '@/hooks/useAuth'
import { useUnreadCount } from '@/hooks/useNotifications'

const NAV_BY_ROLE = {
  guest: [
    { to: '/vacancies', label: "Bo'sh ish o'rinlari" },
    { to: '/resumes', label: 'Rezyumelar' },
  ],
  job_seeker: [
    { to: '/vacancies', label: 'Vakansiyalar' },
    { to: '/applications', label: 'Arizalarim' },
    { to: '/resumes/my', label: 'Mening rezyumem' },
  ],
  employer: [
    { to: '/employer/dashboard', label: 'Dashboard' },
    { to: '/employer/vacancies', label: 'Vakansiyalarim' },
    { to: '/employer/resumes', label: 'Rezyumelarni qidirish' },
    { to: '/employer/applications', label: 'Arizalar' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Statistika' },
    { to: '/admin/users', label: 'Foydalanuvchilar' },
    { to: '/admin/moderation', label: 'Moderatsiya' },
    { to: '/admin/reference', label: 'Ma\'lumotnoma' },
    { to: '/admin/reports', label: 'Shikoyatlar' },
  ],
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 shrink-0">
      <div className="w-11 h-11 rounded-full bg-brand-500 flex items-center justify-center shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-xl font-extrabold text-brand-500 tracking-wide">
          OSON ISH
        </div>
        <div className="text-[9px] text-gray-400 tracking-[0.18em] mt-0.5">
          BIZ BILAN BARCHASI OSON
        </div>
      </div>
    </Link>
  )
}

function IconButton({ children, label, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="p-2 rounded-full text-gray-500 hover:text-brand-500 hover:bg-gray-50 transition"
      {...props}
    >
      {children}
    </button>
  )
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
        className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-gray-50 transition"
      >
        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
          <UserCircle className="w-5 h-5 text-brand-500" />
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {user?.phone_number || 'Foydalanuvchi'}
            </div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <UserCircle className="w-4 h-4" />
            Mening profilim
          </Link>
          {user?.role === 'job_seeker' && (
            <Link
              to="/resumes/my"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <FileText className="w-4 h-4" />
              Mening rezyumem
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
          >
            <LogOut className="w-4 h-4" />
            Tizimdan chiqish
          </button>
        </div>
      )}
    </div>
  )
}

function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  useMe()
  const { data: unreadCount = 0 } = useUnreadCount()

  const role = !isAuthenticated ? 'guest' : user?.role || 'guest'
  const isEmployer = role === 'employer'
  const isAdmin = role === 'admin'
  const visibleLinks = NAV_BY_ROLE[role] || NAV_BY_ROLE.guest

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between gap-6">
        <Logo />

        <nav className="hidden lg:flex items-center gap-8">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'text-base font-medium transition',
                  isActive
                    ? 'text-brand-500'
                    : 'text-gray-700 hover:text-brand-500'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <IconButton label="Yordam">
            <HelpCircle className="w-6 h-6" />
          </IconButton>

          <button
            type="button"
            className="hidden sm:flex items-center gap-1 px-2 py-1.5 text-gray-700 hover:bg-gray-50 rounded transition"
          >
            <span className="text-sm font-medium">O'zb</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {isAuthenticated && !isEmployer && !isAdmin ? (
            <IconLink to="/vacancies/liked" label="Sevimlilar">
              <Heart className="w-6 h-6" />
            </IconLink>
          ) : !isEmployer && !isAdmin && (
            <IconButton label="Sevimlilar" onClick={() => {}}>
              <Heart className="w-6 h-6" />
            </IconButton>
          )}

          {isAuthenticated ? (
            <IconLink to="/notifications" label="Bildirishnomalar" badge={unreadCount}>
              <Bell className="w-6 h-6" />
            </IconLink>
          ) : (
            <IconButton label="Bildirishnomalar">
              <Bell className="w-6 h-6" />
            </IconButton>
          )}

          <IconButton label="Boshqa">
            <MoreHorizontal className="w-6 h-6" />
          </IconButton>

          {isAuthenticated ? (
            <ProfileMenu />
          ) : (
            <Link
              to="/login"
              className="ml-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition"
            >
              Kirish
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
