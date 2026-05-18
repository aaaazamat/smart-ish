import { Outlet } from 'react-router-dom'
import { Bell, UserPlus, Briefcase, FileText } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import ChatWidget from '@/components/ai/ChatWidget'
import { useNotificationsWS } from '@/hooks/useNotificationsWS'
import { useToast } from '@/components/ui/Toast'

// Bildirishnoma turi → icon mapping (toast'ni chiroyli ko'rsatish uchun)
const NOTIFICATION_ICONS = {
  application_received: FileText,
  application_status_changed: Briefcase,
  invitation_received: UserPlus,
  invitation_accepted: UserPlus,
  vacancy_liked: Briefcase,
  system: Bell,
}

function MainLayout() {
  const { showToast } = useToast()

  // Real-time bildirishnomalar — login bo'lganda avtomatik ulanadi,
  // logout'da uziladi (hook ichida `accessToken` o'zgarishini kuzatadi)
  useNotificationsWS({
    onNotification: (data) => {
      const Icon = NOTIFICATION_ICONS[data.notification_type] || Bell
      showToast({
        title: data.title,
        message: data.message,
        icon: Icon,
        linkTo: '/notifications',
      })
    },
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

export default MainLayout
