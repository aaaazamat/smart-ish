import { Routes, Route } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import RequireAuth from '@/components/auth/RequireAuth'
import RequireRole from '@/components/auth/RequireRole'
import HomePage from '@/pages/HomePage'
import VacancyListPage from '@/pages/VacancyListPage'
import VacancyDetailPage from '@/pages/VacancyDetailPage'
import ResumeListPage from '@/pages/ResumeListPage'
import MyResumePage from '@/pages/MyResumePage'
import LikedVacanciesPage from '@/pages/LikedVacanciesPage'
import ApplicationListPage from '@/pages/ApplicationListPage'
import NotificationListPage from '@/pages/NotificationListPage'
import ProfilePage from '@/pages/ProfilePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import NotFoundPage from '@/pages/NotFoundPage'
import EmployerDashboardPage from '@/pages/employer/DashboardPage'
import EmployerVacanciesPage from '@/pages/employer/VacanciesPage'
import EmployerVacancyFormPage from '@/pages/employer/VacancyFormPage'
import EmployerApplicationsPage from '@/pages/employer/ApplicationsPage'
import EmployerApplicationDetailPage from '@/pages/employer/ApplicationDetailPage'
import EmployerResumesPage from '@/pages/employer/ResumesPage'
import EmployerResumeDetailPage from '@/pages/employer/ResumeDetailPage'
import AdminDashboardPage from '@/pages/admin/DashboardPage'
import AdminUsersPage from '@/pages/admin/UsersPage'
import AdminModerationPage from '@/pages/admin/ModerationPage'
import AdminReferencePage from '@/pages/admin/ReferencePage'
import AdminReportsPage from '@/pages/admin/ReportsPage'

function App() {
  return (
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
          <Route path="/applications" element={<ApplicationListPage />} />
          <Route path="/vacancies/liked" element={<LikedVacanciesPage />} />
        </Route>

        <Route element={<RequireRole role="employer" />}>
          <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
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
  )
}

export default App
