import { apiClient } from './client'

// ─── helpers ─────────────────────────────────────
const unwrapList = (data) =>
  Array.isArray(data) ? data : data?.results ?? []

const crud = (basePath) => ({
  list: () => apiClient.get(basePath).then((r) => unwrapList(r.data)),
  create: (data) => apiClient.post(basePath, data).then((r) => r.data),
  update: (id, data) => apiClient.patch(`${basePath}${id}/`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`${basePath}${id}/`).then((r) => r.data),
})

// ─── auth ────────────────────────────────────────
export const authApi = {
  sendOtp: (email) =>
    apiClient.post('/auth/otp/send/', { email }).then((r) => r.data),
  registerJobSeeker: (data) =>
    apiClient.post('/auth/register/job-seeker/', data).then((r) => r.data),
  registerEmployer: (data) =>
    apiClient.post('/auth/register/employer/', data).then((r) => r.data),
  login: (data) =>
    apiClient.post('/auth/login/', data).then((r) => r.data),
  logout: (refresh) =>
    apiClient.post('/auth/logout/', { refresh }).then((r) => r.data),
  me: () =>
    apiClient.get('/auth/me/').then((r) => r.data),
}

// ─── reference ──────────────────────────────────
export const referenceApi = {
  regions: () =>
    apiClient.get('/reference/regions/').then((r) => r.data),
  districts: (regionId) =>
    apiClient
      .get('/reference/districts/', {
        params: regionId ? { region: regionId } : {},
      })
      .then((r) => r.data),
  professions: () =>
    apiClient.get('/reference/professions/').then((r) => r.data),
  industries: () =>
    apiClient.get('/reference/industries/').then((r) => r.data),
  skills: () =>
    apiClient.get('/reference/skills/').then((r) => r.data),
}

export const organizationsApi = {
  list: (params) =>
    apiClient.get('/organizations/', { params }).then((r) => r.data),
  detail: (id) =>
    apiClient.get(`/organizations/${id}/`).then((r) => r.data),
}

// ─── job seeker — vacancies ─────────────────────
export const vacanciesApi = {
  list: (params) =>
    apiClient.get('/vacancies/', { params }).then((r) => r.data),
  liked: (params) =>
    apiClient.get('/vacancies/liked/', { params }).then((r) => r.data),
  detail: (id) =>
    apiClient.get(`/vacancies/${id}/`).then((r) => r.data),
  similar: (id) =>
    apiClient.get(`/vacancies/${id}/similar/`).then((r) => r.data),
  toggleLike: (id) =>
    apiClient.post(`/vacancies/${id}/like/`).then((r) => r.data),
}

// ─── job seeker — resume ────────────────────────
export const resumeApi = {
  getMy: () => apiClient.get('/resumes/my/').then((r) => r.data),
  create: (data) => apiClient.post('/resumes/my/', data).then((r) => r.data),
  update: (data) => apiClient.patch('/resumes/my/', data).then((r) => r.data),
}

export const workExperienceApi = crud('/resumes/my/work-experiences/')
export const educationApi = crud('/resumes/my/educations/')
export const certificateApi = crud('/resumes/my/certificates/')

// ─── job seeker — applications ──────────────────
export const applicationsApi = {
  apply: (vacancyId, data) =>
    apiClient
      .post(`/vacancies/${vacancyId}/apply/`, data)
      .then((r) => r.data),
  list: (params) =>
    apiClient.get('/applications/my/', { params }).then((r) => r.data),
  detail: (id) =>
    apiClient.get(`/applications/my/${id}/`).then((r) => r.data),
  withdraw: (id) =>
    apiClient.delete(`/applications/my/${id}/`).then((r) => r.data),
  stats: () =>
    apiClient.get('/applications/my/stats/').then((r) => r.data),
}

// ─── notifications (both roles) ─────────────────
export const notificationsApi = {
  list: (params) =>
    apiClient.get('/notifications/', { params }).then((r) => r.data),
  unreadCount: () =>
    apiClient.get('/notifications/unread-count/').then((r) => r.data),
  markRead: (id) =>
    apiClient.post(`/notifications/${id}/read/`).then((r) => r.data),
  markAllRead: () =>
    apiClient.post('/notifications/read-all/').then((r) => r.data),
  remove: (id) =>
    apiClient.delete(`/notifications/${id}/`).then((r) => r.data),
}

// ─── ai ─────────────────────────────────────────
export const aiApi = {
  generateVacancyDescription: (data) =>
    apiClient
      .post('/employer/ai/generate-description/', data)
      .then((r) => r.data),
  chat: (data) =>
    apiClient.post('/ai/chat/', data).then((r) => r.data),
  match: (data) =>
    apiClient.post('/ai/match/', data).then((r) => r.data),
  topMatchedResumes: (vacancyId) =>
    apiClient
      .get(`/employer/vacancies/${vacancyId}/ai-top-resumes/`)
      .then((r) => r.data),
  topVacanciesForMe: () =>
    apiClient.get('/ai/top-vacancies-for-me/').then((r) => r.data),
}

// ─── employer ───────────────────────────────────
export const employerApi = {
  dashboard: () =>
    apiClient.get('/employer/monitoring/dashboard/').then((r) => r.data),
  vacancies: crud('/employer/vacancies/'),
  vacancyToggleActive: (id) =>
    apiClient
      .post(`/employer/vacancies/${id}/toggle-active/`)
      .then((r) => r.data),
  vacancyApplications: (vacancyId, params) =>
    apiClient
      .get(`/employer/vacancies/${vacancyId}/applications/`, { params })
      .then((r) => r.data),
  vacancyMatchedResumes: (vacancyId, params) =>
    apiClient
      .get(`/employer/vacancies/${vacancyId}/matched-resumes/`, { params })
      .then((r) => r.data),
  applications: (params) =>
    apiClient.get('/employer/applications/', { params }).then((r) => r.data),
  applicationDetail: (id) =>
    apiClient.get(`/employer/applications/${id}/`).then((r) => r.data),
  applicationStatusUpdate: (id, status) =>
    apiClient
      .patch(`/employer/applications/${id}/status/`, { status })
      .then((r) => r.data),
  applicationStats: () =>
    apiClient.get('/employer/applications/stats/').then((r) => r.data),
  resumes: (params) =>
    apiClient.get('/employer/resumes/', { params }).then((r) => r.data),
  resumeDetail: (id) =>
    apiClient.get(`/employer/resumes/${id}/`).then((r) => r.data),
  inviteToVacancy: (resumeId, data) =>
    apiClient
      .post(`/employer/resumes/${resumeId}/invite/`, data)
      .then((r) => r.data),
}

// ─── admin ──────────────────────────────────────
export const adminApi = {
  // users
  users: (params) =>
    apiClient.get('/admin/users/', { params }).then((r) => r.data),
  userDetail: (id) =>
    apiClient.get(`/admin/users/${id}/`).then((r) => r.data),
  userToggleActive: (id) =>
    apiClient.post(`/admin/users/${id}/toggle-active/`).then((r) => r.data),
  userDelete: (id) =>
    apiClient.delete(`/admin/users/${id}/delete/`).then((r) => r.data),

  // vacancies moderation
  vacancies: (params) =>
    apiClient.get('/admin/vacancies/', { params }).then((r) => r.data),
  vacancyDetail: (id) =>
    apiClient.get(`/admin/vacancies/${id}/`).then((r) => r.data),
  vacancyToggleActive: (id) =>
    apiClient.post(`/admin/vacancies/${id}/toggle-active/`).then((r) => r.data),

  // resumes moderation
  resumes: (params) =>
    apiClient.get('/admin/resumes/', { params }).then((r) => r.data),
  resumeDetail: (id) =>
    apiClient.get(`/admin/resumes/${id}/`).then((r) => r.data),
  resumeTogglePublished: (id) =>
    apiClient.post(`/admin/resumes/${id}/toggle-published/`).then((r) => r.data),

  // organizations
  organizations: crud('/admin/organizations/'),

  // reference data
  reference: {
    regions: crud('/admin/reference/regions/'),
    districts: crud('/admin/reference/districts/'),
    professions: crud('/admin/reference/professions/'),
    skills: crud('/admin/reference/skills/'),
    industries: crud('/admin/reference/industries/'),
    universities: crud('/admin/reference/universities/'),
    directions: crud('/admin/reference/directions/'),
  },

  // stats
  statsOverview: () =>
    apiClient.get('/admin/stats/overview/').then((r) => r.data),
  statsTimeline: (params) =>
    apiClient.get('/admin/stats/timeline/', { params }).then((r) => r.data),
  statsTop: (params) =>
    apiClient.get('/admin/stats/top/', { params }).then((r) => r.data),

  // reports
  reports: (params) =>
    apiClient.get('/admin/reports/', { params }).then((r) => r.data),
  reportDetail: (id) =>
    apiClient.get(`/admin/reports/${id}/`).then((r) => r.data),
  reportResolve: (id, data) =>
    apiClient.post(`/admin/reports/${id}/resolve/`, data).then((r) => r.data),
}
