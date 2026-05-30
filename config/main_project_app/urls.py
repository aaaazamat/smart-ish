from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .admin_views import (
    # users
    AdminUserListView, AdminUserDetailView,
    AdminUserToggleActiveView, AdminUserDeleteView,
    # vacancies / resumes
    AdminVacancyListView, AdminVacancyDetailView, AdminVacancyToggleActiveView,
    AdminResumeListView, AdminResumeDetailView, AdminResumeTogglePublishedView,
    # organizations
    AdminOrganizationListCreateView, AdminOrganizationDetailView,
    # reference data
    AdminRegionListCreateView, AdminRegionDetailView,
    AdminDistrictListCreateView, AdminDistrictDetailView,
    AdminProfessionListCreateView, AdminProfessionDetailView,
    AdminSkillListCreateView, AdminSkillDetailView,
    AdminIndustryListCreateView, AdminIndustryDetailView,
    AdminUniversityListCreateView, AdminUniversityDetailView,
    AdminUniversityDirectionListCreateView, AdminUniversityDirectionDetailView,
    # stats
    AdminStatsOverviewView, AdminStatsTimelineView, AdminStatsTopView,
    # reports
    ReportCreateView, AdminReportListView, AdminReportDetailView, AdminReportResolveView,
)

from .views import (
    # auth
    OTPSendView, RegisterJobSeekerView, RegisterEmployerView,
    LoginView, LogoutView, ProfileView,
    PasswordResetRequestView, PasswordResetConfirmView,
    PasswordChangeView,
    # reference
    RegionListView, DistrictListView, ProfessionListView, SkillListView,
    UniversityListView, UniversityDirectionListView, IndustryListView,
    # organization
    OrganizationListView, OrganizationDetailView,
    # vacancy
    PublicVacancyListView, PublicVacancyDetailView, PublicVacancySimilarView,
    VacancyLikeToggleView, LikedVacancyListView,
    # resume
    PublicResumeListView, PublicResumeDetailView, PublicResumeSimilarView,
    MyResumeView, MyResumeViewsView, ImportResumeDocxView,
    WorkExperienceListCreateView, WorkExperienceDetailView,
    EducationListCreateView, EducationDetailView,
    CertificateListCreateView, CertificateDetailView,
    # application
    ApplyToVacancyView, MyApplicationListView,
    MyApplicationDetailView, MyApplicationStatsView,
    # 🟢 EMPLOYER
    EmployerOrganizationView,
    EmployerVacancyListCreateView, EmployerVacancyDetailView,
    EmployerVacancyToggleActiveView, EmployerVacancyApplicationsView,
    EmployerVacancyMatchedResumesView,
    EmployerResumeListView, EmployerResumeDetailView, EmployerResumeSimilarView,
    InvitationCreateView, InvitationQuickCreateView,
    EmployerApplicationListView, EmployerApplicationDetailView,
    EmployerApplicationStatusUpdateView, EmployerApplicationStatsView,
    EmployerMonitoringDashboardView, EmployerOrganizationsReportView,
    EmployerVacancyTimelineView,
    GenerateVacancyDescriptionView, AiChatView, AiMatchView,
    AiVacancyTopMatchedResumesView, AiTopVacanciesForMeView,
    AiTaskStatusView,
    # 🔔 NOTIFICATIONS
    NotificationListView, NotificationUnreadCountView,
    NotificationMarkReadView, NotificationMarkAllReadView,
    NotificationDeleteView,
)
urlpatterns = [
    # ─── AUTH ───────────────────────────────────
    path("auth/otp/send/",                OTPSendView.as_view(),            name="otp-send"),
    path("auth/register/job-seeker/",     RegisterJobSeekerView.as_view(),  name="register-job-seeker"),
    path("auth/register/employer/",       RegisterEmployerView.as_view(),   name="register-employer"),
    path("auth/login/",                   LoginView.as_view(),              name="login"),
    path("auth/logout/",                  LogoutView.as_view(),             name="logout"),
    path("auth/token/refresh/",           TokenRefreshView.as_view(),       name="token-refresh"),
    path("auth/me/",                      ProfileView.as_view(),            name="profile"),
    path("auth/password-reset/request/",  PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("auth/password-reset/confirm/",  PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("auth/change-password/",         PasswordChangeView.as_view(),       name="change-password"),

    # ─── REFERENCE ──────────────────────────────
    path("reference/regions/",            RegionListView.as_view(),             name="regions"),
    path("reference/districts/",          DistrictListView.as_view(),           name="districts"),
    path("reference/professions/",        ProfessionListView.as_view(),         name="professions"),
    path("reference/skills/",             SkillListView.as_view(),              name="skills"),
    path("reference/universities/",       UniversityListView.as_view(),         name="universities"),
    path("reference/directions/",         UniversityDirectionListView.as_view(),name="directions"),
    path("reference/industries/",         IndustryListView.as_view(),           name="industries"),

    # ─── TASHKILOTLAR ───────────────────────────
    path("organizations/",                OrganizationListView.as_view(),   name="org-list"),
    path("organizations/<int:pk>/",       OrganizationDetailView.as_view(), name="org-detail"),

    # ─── VAKANSIYALAR ───────────────────────────
    # Diqqat: tartib muhim — "liked/" "<int:pk>/" dan oldin turishi kerak
    path("vacancies/liked/",                  LikedVacancyListView.as_view(),     name="liked-vacancies"),
    path("vacancies/",                        PublicVacancyListView.as_view(),    name="vacancy-list"),
    path("vacancies/<int:pk>/",               PublicVacancyDetailView.as_view(),  name="vacancy-detail"),
    path("vacancies/<int:pk>/similar/",       PublicVacancySimilarView.as_view(), name="vacancy-similar"),
    path("vacancies/<int:pk>/like/",          VacancyLikeToggleView.as_view(),    name="vacancy-like"),
    path("vacancies/<int:vacancy_id>/apply/", ApplyToVacancyView.as_view(),       name="vacancy-apply"),

    # ─── REZYUMELAR ─────────────────────────────
    # Diqqat: "my/" "<int:pk>/" dan oldin
    path("resumes/my/",                                 MyResumeView.as_view(),                    name="my-resume"),
    path("resumes/import-docx/",                        ImportResumeDocxView.as_view(),            name="resume-import-docx"),
    path("resumes/my/views/",                           MyResumeViewsView.as_view(),               name="my-resume-views"),
    path("resumes/my/work-experiences/",                WorkExperienceListCreateView.as_view(),    name="work-exp-list"),
    path("resumes/my/work-experiences/<int:pk>/",       WorkExperienceDetailView.as_view(),        name="work-exp-detail"),
    path("resumes/my/educations/",                      EducationListCreateView.as_view(),         name="education-list"),
    path("resumes/my/educations/<int:pk>/",             EducationDetailView.as_view(),             name="education-detail"),
    path("resumes/my/certificates/",                    CertificateListCreateView.as_view(),       name="certificate-list"),
    path("resumes/my/certificates/<int:pk>/",           CertificateDetailView.as_view(),           name="certificate-detail"),
    path("resumes/",                                    PublicResumeListView.as_view(),            name="resume-list"),
    path("resumes/<int:pk>/",                           PublicResumeDetailView.as_view(),          name="resume-detail"),
    path("resumes/<int:pk>/similar/",                   PublicResumeSimilarView.as_view(),         name="resume-similar"),

    # ─── ARIZALAR ───────────────────────────────
    path("applications/my/",              MyApplicationListView.as_view(),   name="my-applications"),
    path("applications/my/stats/",        MyApplicationStatsView.as_view(),  name="my-applications-stats"),
    path("applications/my/<int:pk>/",     MyApplicationDetailView.as_view(), name="my-application-detail"),
    # ═══════════════════════════════════════════
    # 🤖 AI YORDAMCHI
    # ═══════════════════════════════════════════
    path("ai/chat/",
         AiChatView.as_view(), name="ai-chat"),
    path("ai/match/",
         AiMatchView.as_view(), name="ai-match"),
    path("ai/top-vacancies-for-me/",
         AiTopVacanciesForMeView.as_view(), name="ai-top-vacancies-for-me"),
    path("ai/tasks/<str:task_id>/",
         AiTaskStatusView.as_view(), name="ai-task-status"),
    path("employer/vacancies/<int:vacancy_id>/ai-top-resumes/",
         AiVacancyTopMatchedResumesView.as_view(), name="ai-top-resumes"),
    path("employer/ai/generate-description/",
         GenerateVacancyDescriptionView.as_view(), name="ai-generate-description"),

    # ═══════════════════════════════════════════
    # 🟢 EMPLOYER — VAKANSIYA BOSHQARUVI
    # ═══════════════════════════════════════════
    path("employer/organization/",
         EmployerOrganizationView.as_view(), name="employer-organization"),
    path("employer/vacancies/",
         EmployerVacancyListCreateView.as_view(), name="employer-vacancy-list"),
    path("employer/vacancies/<int:pk>/",
         EmployerVacancyDetailView.as_view(), name="employer-vacancy-detail"),
    path("employer/vacancies/<int:pk>/toggle-active/",
         EmployerVacancyToggleActiveView.as_view(), name="employer-vacancy-toggle"),
    path("employer/vacancies/<int:vacancy_id>/applications/",
         EmployerVacancyApplicationsView.as_view(), name="employer-vacancy-applications"),
    path("employer/vacancies/<int:vacancy_id>/matched-resumes/",
         EmployerVacancyMatchedResumesView.as_view(), name="employer-vacancy-matched"),

    # ═══════════════════════════════════════════
    # 🟢 EMPLOYER — REZYUMELAR
    # ═══════════════════════════════════════════
    path("employer/resumes/",
         EmployerResumeListView.as_view(), name="employer-resume-list"),
    path("employer/resumes/<int:pk>/",
         EmployerResumeDetailView.as_view(), name="employer-resume-detail"),
    path("employer/resumes/<int:pk>/similar/",
         EmployerResumeSimilarView.as_view(), name="employer-resume-similar"),
    path("employer/resumes/<int:resume_id>/invite/",
         InvitationQuickCreateView.as_view(), name="employer-resume-invite"),

    # ═══════════════════════════════════════════
    # 🟢 EMPLOYER — TAKLIFLAR / ARIZALAR
    # ═══════════════════════════════════════════
    path("employer/invitations/",
         InvitationCreateView.as_view(), name="employer-invitation-create"),
    path("employer/applications/",
         EmployerApplicationListView.as_view(), name="employer-applications"),
    path("employer/applications/stats/",
         EmployerApplicationStatsView.as_view(), name="employer-applications-stats"),
    path("employer/applications/<int:pk>/",
         EmployerApplicationDetailView.as_view(), name="employer-application-detail"),
    path("employer/applications/<int:pk>/status/",
         EmployerApplicationStatusUpdateView.as_view(), name="employer-application-status"),

    # ═══════════════════════════════════════════
    # 🟢 EMPLOYER — MONITORING
    # ═══════════════════════════════════════════
    path("employer/monitoring/dashboard/",
         EmployerMonitoringDashboardView.as_view(), name="employer-monitoring-dashboard"),
    path("employer/monitoring/organizations/",
         EmployerOrganizationsReportView.as_view(), name="employer-monitoring-orgs"),
    path("employer/monitoring/vacancy-timeline/",
         EmployerVacancyTimelineView.as_view(), name="employer-monitoring-timeline"),

    # ═══════════════════════════════════════════
    # 🔔 NOTIFICATIONS
    # ═══════════════════════════════════════════
    # Diqqat: tartib muhim — "unread-count/" va "read-all/" "<int:pk>/" dan oldin
    path("notifications/",
         NotificationListView.as_view(),         name="notification-list"),
    path("notifications/unread-count/",
         NotificationUnreadCountView.as_view(),  name="notification-unread-count"),
    path("notifications/read-all/",
         NotificationMarkAllReadView.as_view(),  name="notification-read-all"),
    path("notifications/<int:pk>/read/",
         NotificationMarkReadView.as_view(),     name="notification-read"),
    path("notifications/<int:pk>/",
         NotificationDeleteView.as_view(),       name="notification-delete"),

    # ═══════════════════════════════════════════
    # 🚨 SHIKOYATLAR (foydalanuvchi tarafi)
    # ═══════════════════════════════════════════
    path("reports/", ReportCreateView.as_view(), name="report-create"),

    # ═══════════════════════════════════════════
    # 👑 ADMIN — USER MANAGEMENT
    # ═══════════════════════════════════════════
    path("admin/users/",
         AdminUserListView.as_view(),         name="admin-user-list"),
    path("admin/users/<int:pk>/",
         AdminUserDetailView.as_view(),       name="admin-user-detail"),
    path("admin/users/<int:pk>/toggle-active/",
         AdminUserToggleActiveView.as_view(), name="admin-user-toggle"),
    path("admin/users/<int:pk>/delete/",
         AdminUserDeleteView.as_view(),       name="admin-user-delete"),

    # ═══════════════════════════════════════════
    # 👑 ADMIN — VACANCY / RESUME MODERATION
    # ═══════════════════════════════════════════
    path("admin/vacancies/",
         AdminVacancyListView.as_view(),         name="admin-vacancy-list"),
    path("admin/vacancies/<int:pk>/",
         AdminVacancyDetailView.as_view(),       name="admin-vacancy-detail"),
    path("admin/vacancies/<int:pk>/toggle-active/",
         AdminVacancyToggleActiveView.as_view(), name="admin-vacancy-toggle"),

    path("admin/resumes/",
         AdminResumeListView.as_view(),             name="admin-resume-list"),
    path("admin/resumes/<int:pk>/",
         AdminResumeDetailView.as_view(),           name="admin-resume-detail"),
    path("admin/resumes/<int:pk>/toggle-published/",
         AdminResumeTogglePublishedView.as_view(),  name="admin-resume-toggle"),

    # ═══════════════════════════════════════════
    # 👑 ADMIN — ORGANIZATIONS
    # ═══════════════════════════════════════════
    path("admin/organizations/",
         AdminOrganizationListCreateView.as_view(), name="admin-org-list"),
    path("admin/organizations/<int:pk>/",
         AdminOrganizationDetailView.as_view(),     name="admin-org-detail"),

    # ═══════════════════════════════════════════
    # 👑 ADMIN — REFERENCE DATA CRUD
    # ═══════════════════════════════════════════
    path("admin/reference/regions/",                AdminRegionListCreateView.as_view(),     name="admin-region-list"),
    path("admin/reference/regions/<int:pk>/",       AdminRegionDetailView.as_view(),         name="admin-region-detail"),
    path("admin/reference/districts/",              AdminDistrictListCreateView.as_view(),   name="admin-district-list"),
    path("admin/reference/districts/<int:pk>/",     AdminDistrictDetailView.as_view(),       name="admin-district-detail"),
    path("admin/reference/professions/",            AdminProfessionListCreateView.as_view(), name="admin-profession-list"),
    path("admin/reference/professions/<int:pk>/",   AdminProfessionDetailView.as_view(),     name="admin-profession-detail"),
    path("admin/reference/skills/",                 AdminSkillListCreateView.as_view(),      name="admin-skill-list"),
    path("admin/reference/skills/<int:pk>/",        AdminSkillDetailView.as_view(),          name="admin-skill-detail"),
    path("admin/reference/industries/",             AdminIndustryListCreateView.as_view(),   name="admin-industry-list"),
    path("admin/reference/industries/<int:pk>/",    AdminIndustryDetailView.as_view(),       name="admin-industry-detail"),
    path("admin/reference/universities/",           AdminUniversityListCreateView.as_view(), name="admin-univ-list"),
    path("admin/reference/universities/<int:pk>/",  AdminUniversityDetailView.as_view(),     name="admin-univ-detail"),
    path("admin/reference/directions/",             AdminUniversityDirectionListCreateView.as_view(), name="admin-direction-list"),
    path("admin/reference/directions/<int:pk>/",    AdminUniversityDirectionDetailView.as_view(),     name="admin-direction-detail"),

    # ═══════════════════════════════════════════
    # 👑 ADMIN — STATISTICS
    # ═══════════════════════════════════════════
    path("admin/stats/overview/", AdminStatsOverviewView.as_view(), name="admin-stats-overview"),
    path("admin/stats/timeline/", AdminStatsTimelineView.as_view(), name="admin-stats-timeline"),
    path("admin/stats/top/",      AdminStatsTopView.as_view(),      name="admin-stats-top"),

    # ═══════════════════════════════════════════
    # 👑 ADMIN — REPORTS / SHIKOYATLAR
    # ═══════════════════════════════════════════
    path("admin/reports/",                  AdminReportListView.as_view(),     name="admin-report-list"),
    path("admin/reports/<int:pk>/",         AdminReportDetailView.as_view(),   name="admin-report-detail"),
    path("admin/reports/<int:pk>/resolve/", AdminReportResolveView.as_view(),  name="admin-report-resolve"),
]