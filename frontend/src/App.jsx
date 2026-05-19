import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import RequireAuth from '@/components/auth/RequireAuth'
import RequireRole from '@/components/auth/RequireRole'

// ─── Public sahifalar — darhol yuklanadi (asosiy oqim) ───
import HomePage from '@/pages/HomePage'
import VacancyListPage from '@/pages/VacancyListPage'
import VacancyDetailPage from '@/pages/VacancyDetailPage'
import ResumeListPage from '@/pages/ResumeListPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import NotFoundPage from '@/pages/NotFoundPage'

// ─── Job seeker sahifalari — lazy ───
const MyResumePage = lazy(() => import('@/pages/MyResumePage'))
const ResumeViewsPage = lazy(() => import('@/pages/ResumeViewsPage'))
const LikedVacanciesPage = lazy(() => import('@/pages/LikedVacanciesPage'))
const ApplicationListPage = lazy(() => import('@/pages/ApplicationListPage'))
const NotificationListPage = lazy(() => import('@/pages/NotificationListPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))

// ─── Employer sahifalari — lazy (faqat employer kirsa yuklanadi) ───
const EmployerDashboardPage = lazy(() => import('@/pages/employer/DashboardPage'))
const EmployerOrganizationPage = lazy(() => import('@/pages/employer/OrganizationPage'))
const EmployerVacanciesPage = lazy(() => import('@/pages/employer/VacanciesPage'))
const EmployerVacancyFormPage = lazy(() => import('@/pages/employer/VacancyFormPage'))
const EmployerApplicationsPage = lazy(() => import('@/pages/employer/ApplicationsPage'))
const EmployerApplicationDetailPage = lazy(() => import('@/pages/employer/ApplicationDetailPage'))
const EmployerResumesPage = lazy(() => import('@/pages/employer/ResumesPage'))
const EmployerResumeDetailPage = lazy(() => import('@/pages/employer/ResumeDetailPage'))

// ─── Admin sahifalari — lazy (kam ishlatiladi) ───
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/UsersPage'))
const AdminModerationPage = lazy(() => import('@/pages/admin/ModerationPage'))
const AdminReferencePage = lazy(() => import('@/pages/admin/ReferencePage'))
const AdminReportsPage = lazy(() => import('@/pages/admin/ReportsPage'))

// Lazy sahifalar yuklanayotgan paytda ko'rsatiladigan placeholder
function PageLoader() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-16 flex items-center justify-center text-gray-400">
      <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/vacancies" element={<VacancyListPage />} />
          <Route path="/vacancies/:id" element={<VacancyDetailPage />} />
          <Route path="/resumes" element={<ResumeListPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationListPage />} />
          </Route>

          <Route element={<RequireRole role="job_seeker" />}>
            <Route path="/resumes/my" element={<MyResumePage />} />
            <Route path="/resumes/my/views" element={<ResumeViewsPage />} />
            <Route path="/applications" element={<ApplicationListPage />} />
            <Route path="/vacancies/liked" element={<LikedVacanciesPage />} />
          </Route>

          <Route element={<RequireRole role="employer" />}>
            <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
            <Route path="/employer/organization" element={<EmployerOrganizationPage />} />
            <Route path="/employer/vacancies" element={<EmployerVacanciesPage />} />
            <Route path="/employer/vacancies/new" element={<EmployerVacancyFormPage />} />
            <Route path="/employer/vacancies/:id/edit" element={<EmployerVacancyFormPage />} />
            <Route path="/employer/applications" element={<EmployerApplicationsPage />} />
            <Route path="/employer/applications/:id" element={<EmployerApplicationDetailPage />} />
            <Route path="/employer/resumes" element={<EmployerResumesPage />} />
            <Route path="/employer/resumes/:id" element={<EmployerResumeDetailPage />} />
          </Route>

          <Route element={<RequireRole role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/moderation" element={<AdminModerationPage />} />
            <Route path="/admin/reference" element={<AdminReferencePage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
          </Route>
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
