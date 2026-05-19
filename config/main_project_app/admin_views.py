"""
Admin (platform administrator) uchun REST API endpoint'lari.
Barcha endpoint'lar IsAuthenticated + IsAdmin permission talab qiladi.
"""
from datetime import timedelta
from django.conf import settings
from django.core.cache import cache
from django.db import models as db_models
from django.db.models.functions import TruncDate
from django.utils import timezone

from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    User, Organization,
    Region, District, Profession, Skill,
    University, UniversityDirection, Industry,
    Resume, Vacancy, Application, Notification,
    Report,
)
from .permissions import IsAdmin
from .admin_serializers import (
    AdminUserListSerializer, AdminUserUpdateSerializer, AdminUserBanSerializer,
    AdminVacancySerializer, AdminResumeSerializer,
    AdminOrganizationSerializer,
    AdminRegionSerializer, AdminDistrictSerializer,
    AdminProfessionSerializer, AdminSkillSerializer,
    AdminIndustrySerializer,
    AdminUniversitySerializer, AdminUniversityDirectionSerializer,
    ReportCreateSerializer, AdminReportListSerializer, AdminReportResolveSerializer,
)


# ══════════════════════════════════════════════
# USER MANAGEMENT
# ══════════════════════════════════════════════

class AdminUserListView(generics.ListAPIView):
    """
    GET /api/admin/users/
    Filter: ?role=&is_active=&search=
    """
    serializer_class = AdminUserListSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["phone_number", "email"]
    ordering_fields = ["created_at", "last_login", "phone_number"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = User.objects.select_related("organization").all()
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ("true", "1", "yes"))
        return qs


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """
    GET    /api/admin/users/{id}/
    PATCH  /api/admin/users/{id}/   — body: {role, is_active, is_staff, organization}
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = User.objects.select_related("organization").all()

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return AdminUserUpdateSerializer
        return AdminUserListSerializer


class AdminUserToggleActiveView(APIView):
    """
    POST /api/admin/users/{id}/toggle-active/
    Bloklash / blokdan chiqarish
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Foydalanuvchi topilmadi"}, status=404)

        if user == request.user:
            return Response(
                {"detail": "O'zingizni bloklab qo'ymang"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AdminUserBanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])

        # Bildirishnoma yuborish
        if not user.is_active:
            Notification.objects.create(
                user=user,
                notification_type=Notification.Type.SYSTEM,
                title="Akkauntingiz bloklandi",
                message=serializer.validated_data.get("reason", "")
                        or "Administrator tomonidan bloklandi",
            )

        return Response({
            "id": user.id,
            "is_active": user.is_active,
            "detail": "Foydalanuvchi blokdan chiqarildi" if user.is_active
                      else "Foydalanuvchi bloklandi",
        })


class AdminUserDeleteView(APIView):
    """
    DELETE /api/admin/users/{id}/delete/
    Foydalanuvchini butunlay o'chirish
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if user == request.user:
            return Response(
                {"detail": "O'zingizni o'chira olmaysiz"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ══════════════════════════════════════════════
# VACANCY MODERATION
# ══════════════════════════════════════════════

class AdminVacancyListView(generics.ListAPIView):
    """
    GET /api/admin/vacancies/
    Filter: ?is_active=&employer=&organization=&search=
    """
    serializer_class = AdminVacancySerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["profession__name", "organization__name", "description"]
    ordering_fields = ["created_at", "updated_at", "views_count"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Vacancy.objects.select_related(
            "employer", "organization", "profession", "region",
        )
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ("true", "1", "yes"))

        employer = self.request.query_params.get("employer")
        if employer:
            qs = qs.filter(employer_id=employer)

        organization = self.request.query_params.get("organization")
        if organization:
            qs = qs.filter(organization_id=organization)

        return qs


class AdminVacancyDetailView(generics.RetrieveDestroyAPIView):
    """
    GET    /api/admin/vacancies/{id}/
    DELETE /api/admin/vacancies/{id}/   — majburan o'chirish
    """
    serializer_class = AdminVacancySerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Vacancy.objects.select_related(
        "employer", "organization", "profession", "region",
    )


class AdminVacancyToggleActiveView(APIView):
    """
    POST /api/admin/vacancies/{id}/toggle-active/
    Vakansiyani admin tomonidan faollashtirish/yopish
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            vacancy = Vacancy.objects.get(pk=pk)
        except Vacancy.DoesNotExist:
            return Response({"detail": "Vakansiya topilmadi"}, status=404)

        vacancy.is_active = not vacancy.is_active
        vacancy.save(update_fields=["is_active", "updated_at"])

        if not vacancy.is_active:
            Notification.objects.create(
                user=vacancy.employer,
                notification_type=Notification.Type.SYSTEM,
                title="Vakansiyangiz administrator tomonidan yopildi",
                message=request.data.get("reason", "") or "Qoidalarga zid kontent",
                vacancy=vacancy,
            )

        return Response({
            "id": vacancy.id,
            "is_active": vacancy.is_active,
            "detail": "Vakansiya yopildi" if not vacancy.is_active else "Vakansiya faollashtirildi",
        })


# ══════════════════════════════════════════════
# RESUME MODERATION
# ══════════════════════════════════════════════

class AdminResumeListView(generics.ListAPIView):
    """
    GET /api/admin/resumes/
    Filter: ?is_published=&user=&search=
    """
    serializer_class = AdminResumeSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["first_name", "last_name", "user__phone_number", "user__email"]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-updated_at"]

    def get_queryset(self):
        qs = Resume.objects.select_related("user", "profession", "region")
        is_published = self.request.query_params.get("is_published")
        if is_published is not None:
            qs = qs.filter(is_published=is_published.lower() in ("true", "1", "yes"))
        user_id = self.request.query_params.get("user")
        if user_id:
            qs = qs.filter(user_id=user_id)
        return qs


class AdminResumeDetailView(generics.RetrieveDestroyAPIView):
    """
    GET    /api/admin/resumes/{id}/
    DELETE /api/admin/resumes/{id}/
    """
    serializer_class = AdminResumeSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Resume.objects.select_related("user", "profession", "region")


class AdminResumeTogglePublishedView(APIView):
    """POST /api/admin/resumes/{id}/toggle-published/"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            resume = Resume.objects.get(pk=pk)
        except Resume.DoesNotExist:
            return Response({"detail": "Rezyume topilmadi"}, status=404)

        resume.is_published = not resume.is_published
        resume.save(update_fields=["is_published", "updated_at"])

        if not resume.is_published:
            Notification.objects.create(
                user=resume.user,
                notification_type=Notification.Type.SYSTEM,
                title="Rezyumengiz administrator tomonidan yopildi",
                message=request.data.get("reason", "") or "Qoidalarga zid kontent",
                resume=resume,
            )
        return Response({
            "id": resume.id,
            "is_published": resume.is_published,
        })


# ══════════════════════════════════════════════
# ORGANIZATION CRUD
# ══════════════════════════════════════════════

class AdminOrganizationListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/admin/organizations/
    POST /api/admin/organizations/
    """
    serializer_class = AdminOrganizationSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "inn", "description"]
    ordering = ["name"]
    pagination_class = None   # Reference-style — bir sahifada hammasini ko'rsatadi
    queryset = Organization.objects.select_related("region", "district").all()


class AdminOrganizationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/organizations/{id}/
    PUT    /api/admin/organizations/{id}/
    PATCH  /api/admin/organizations/{id}/
    DELETE /api/admin/organizations/{id}/
    """
    serializer_class = AdminOrganizationSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Organization.objects.select_related("region", "district").all()


# ══════════════════════════════════════════════
# REFERENCE DATA CRUD
# ══════════════════════════════════════════════

class _BaseReferenceCRUD:
    """Reference data uchun umumiy permissions.

    Pagination o'chirilgan — kichik to'plamlar (kasblar 30-60 ta,
    viloyatlar 8 ta, ko'nikmalar 60-80 ta) bir sahifada to'liq ko'rinishi
    uchun. Aks holda admin yangi qo'shilgan elementni topa olmaydi
    (2-sahifaga tushib ketadi).
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    pagination_class = None


class AdminRegionListCreateView(_BaseReferenceCRUD, generics.ListCreateAPIView):
    queryset = Region.objects.all()
    serializer_class = AdminRegionSerializer
    search_fields = ["name"]
    ordering = ["name"]


class AdminRegionDetailView(_BaseReferenceCRUD, generics.RetrieveUpdateDestroyAPIView):
    queryset = Region.objects.all()
    serializer_class = AdminRegionSerializer


class AdminDistrictListCreateView(_BaseReferenceCRUD, generics.ListCreateAPIView):
    queryset = District.objects.select_related("region").all()
    serializer_class = AdminDistrictSerializer
    search_fields = ["name"]
    ordering = ["name"]

    def get_queryset(self):
        qs = super().get_queryset()
        region_id = self.request.query_params.get("region")
        if region_id:
            qs = qs.filter(region_id=region_id)
        return qs


class AdminDistrictDetailView(_BaseReferenceCRUD, generics.RetrieveUpdateDestroyAPIView):
    queryset = District.objects.all()
    serializer_class = AdminDistrictSerializer


class AdminProfessionListCreateView(_BaseReferenceCRUD, generics.ListCreateAPIView):
    queryset = Profession.objects.all()
    serializer_class = AdminProfessionSerializer
    search_fields = ["name"]
    ordering = ["name"]


class AdminProfessionDetailView(_BaseReferenceCRUD, generics.RetrieveUpdateDestroyAPIView):
    queryset = Profession.objects.all()
    serializer_class = AdminProfessionSerializer


class AdminSkillListCreateView(_BaseReferenceCRUD, generics.ListCreateAPIView):
    queryset = Skill.objects.all()
    serializer_class = AdminSkillSerializer
    search_fields = ["name"]
    ordering = ["name"]


class AdminSkillDetailView(_BaseReferenceCRUD, generics.RetrieveUpdateDestroyAPIView):
    queryset = Skill.objects.all()
    serializer_class = AdminSkillSerializer


class AdminIndustryListCreateView(_BaseReferenceCRUD, generics.ListCreateAPIView):
    queryset = Industry.objects.all()
    serializer_class = AdminIndustrySerializer
    search_fields = ["name"]
    ordering = ["name"]


class AdminIndustryDetailView(_BaseReferenceCRUD, generics.RetrieveUpdateDestroyAPIView):
    queryset = Industry.objects.all()
    serializer_class = AdminIndustrySerializer


class AdminUniversityListCreateView(_BaseReferenceCRUD, generics.ListCreateAPIView):
    queryset = University.objects.all()
    serializer_class = AdminUniversitySerializer
    search_fields = ["name"]
    ordering = ["name"]


class AdminUniversityDetailView(_BaseReferenceCRUD, generics.RetrieveUpdateDestroyAPIView):
    queryset = University.objects.all()
    serializer_class = AdminUniversitySerializer


class AdminUniversityDirectionListCreateView(_BaseReferenceCRUD, generics.ListCreateAPIView):
    queryset = UniversityDirection.objects.select_related("university").all()
    serializer_class = AdminUniversityDirectionSerializer
    search_fields = ["name"]
    ordering = ["name"]

    def get_queryset(self):
        qs = super().get_queryset()
        university_id = self.request.query_params.get("university")
        if university_id:
            qs = qs.filter(university_id=university_id)
        return qs


class AdminUniversityDirectionDetailView(_BaseReferenceCRUD, generics.RetrieveUpdateDestroyAPIView):
    queryset = UniversityDirection.objects.all()
    serializer_class = AdminUniversityDirectionSerializer


# ══════════════════════════════════════════════
# PLATFORM STATISTICS
# ══════════════════════════════════════════════

class AdminStatsOverviewView(APIView):
    """
    GET /api/admin/stats/overview/
    Platforma umumiy statistikasi (10 daqiqaga keshlanadi)
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    CACHE_KEY = "admin_stats_overview"

    def get(self, request):
        # Avval keshdan tekshiramiz — admin har 10 daqiqada faqat 1 marta DB'ga so'rov yuboradi
        cached = cache.get(self.CACHE_KEY)
        if cached is not None:
            cached["_cached"] = True
            return Response(cached)

        now = timezone.now()
        last_7_days = now - timedelta(days=7)
        last_30_days = now - timedelta(days=30)

        S = Application.Status

        users_qs = User.objects.all()
        data = {
            "users": {
                "total": users_qs.count(),
                "active": users_qs.filter(is_active=True).count(),
                "blocked": users_qs.filter(is_active=False).count(),
                "by_role": {
                    "job_seeker": users_qs.filter(role=User.Role.JOB_SEEKER).count(),
                    "employer": users_qs.filter(role=User.Role.EMPLOYER).count(),
                    "admin": users_qs.filter(role=User.Role.ADMIN).count(),
                },
                "new_last_7_days": users_qs.filter(created_at__gte=last_7_days).count(),
                "new_last_30_days": users_qs.filter(created_at__gte=last_30_days).count(),
            },
            "vacancies": {
                "total": Vacancy.objects.count(),
                "active": Vacancy.objects.filter(is_active=True).count(),
                "closed": Vacancy.objects.filter(is_active=False).count(),
                "new_last_7_days": Vacancy.objects.filter(created_at__gte=last_7_days).count(),
                "total_views": Vacancy.objects.aggregate(
                    total=db_models.Sum("views_count")
                )["total"] or 0,
            },
            "resumes": {
                "total": Resume.objects.count(),
                "published": Resume.objects.filter(is_published=True).count(),
                "hidden": Resume.objects.filter(is_published=False).count(),
                "new_last_7_days": Resume.objects.filter(created_at__gte=last_7_days).count(),
            },
            "applications": {
                "total": Application.objects.count(),
                "pending": Application.objects.filter(status=S.PENDING).count(),
                "interview": Application.objects.filter(status=S.INTERVIEW).count(),
                "hired": Application.objects.filter(status=S.HIRED).count(),
                "rejected": Application.objects.filter(status=S.REJECTED).count(),
                "new_last_7_days": Application.objects.filter(applied_at__gte=last_7_days).count(),
            },
            "organizations": {
                "total": Organization.objects.count(),
            },
            "reports": {
                "total": Report.objects.count(),
                "pending": Report.objects.filter(status=Report.Status.PENDING).count(),
                "resolved": Report.objects.filter(status=Report.Status.RESOLVED).count(),
            },
            "_cached": False,
        }
        ttl = getattr(settings, "CACHE_TTL_ADMIN_STATS", 600)
        cache.set(self.CACHE_KEY, data, timeout=ttl)
        return Response(data)


class AdminStatsTimelineView(APIView):
    """
    GET /api/admin/stats/timeline/
    Sana bo'yicha registratsiyalar/vakansiyalar/arizalar timeline
    Filter: ?days=30
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        days = int(request.query_params.get("days", 30))
        since = timezone.now() - timedelta(days=days)

        users = (
            User.objects.filter(created_at__gte=since)
            .annotate(day=TruncDate("created_at"))
            .values("day").annotate(count=db_models.Count("id"))
            .order_by("day")
        )
        vacancies = (
            Vacancy.objects.filter(created_at__gte=since)
            .annotate(day=TruncDate("created_at"))
            .values("day").annotate(count=db_models.Count("id"))
            .order_by("day")
        )
        applications = (
            Application.objects.filter(applied_at__gte=since)
            .annotate(day=TruncDate("applied_at"))
            .values("day").annotate(count=db_models.Count("id"))
            .order_by("day")
        )

        return Response({
            "since": since.date().isoformat(),
            "until": timezone.now().date().isoformat(),
            "days": days,
            "users":        [{"date": r["day"].isoformat(), "count": r["count"]} for r in users],
            "vacancies":    [{"date": r["day"].isoformat(), "count": r["count"]} for r in vacancies],
            "applications": [{"date": r["day"].isoformat(), "count": r["count"]} for r in applications],
        })


class AdminStatsTopView(APIView):
    """
    GET /api/admin/stats/top/
    Top kasblar, hududlar, tashkilotlar
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        top_professions = (
            Profession.objects
            .annotate(count=db_models.Count("vacancies", filter=db_models.Q(vacancies__is_active=True)))
            .order_by("-count")[:10]
            .values("id", "name", "count")
        )
        top_regions = (
            Region.objects
            .annotate(count=db_models.Count("vacancy", filter=db_models.Q(vacancy__is_active=True)))
            .order_by("-count")[:10]
            .values("id", "name", "count")
        )
        top_organizations = (
            Organization.objects
            .annotate(count=db_models.Count("vacancies", filter=db_models.Q(vacancies__is_active=True)))
            .order_by("-count")[:10]
            .values("id", "name", "count")
        )
        return Response({
            "top_professions": list(top_professions),
            "top_regions": list(top_regions),
            "top_organizations": list(top_organizations),
        })


# ══════════════════════════════════════════════
# REPORTS / ABUSE
# ══════════════════════════════════════════════

class ReportCreateView(APIView):
    """
    POST /api/reports/
    Foydalanuvchi shikoyat yuboradi
    body: {target_type, target_id, reason, description}
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "report"

    def post(self, request):
        serializer = ReportCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save(reporter=request.user)
        return Response(
            AdminReportListSerializer(report).data,
            status=status.HTTP_201_CREATED,
        )


class AdminReportListView(generics.ListAPIView):
    """
    GET /api/admin/reports/
    Filter: ?status=&target_type=
    """
    serializer_class = AdminReportListSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at", "resolved_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Report.objects.select_related("reporter", "resolved_by")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        target_type = self.request.query_params.get("target_type")
        if target_type:
            qs = qs.filter(target_type=target_type)
        return qs


class AdminReportDetailView(generics.RetrieveAPIView):
    """GET /api/admin/reports/{id}/"""
    serializer_class = AdminReportListSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Report.objects.select_related("reporter", "resolved_by")


class AdminReportResolveView(APIView):
    """
    PATCH /api/admin/reports/{id}/resolve/
    body: {status: "resolved"|"rejected", resolution_note: "..."}
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        try:
            report = Report.objects.get(pk=pk)
        except Report.DoesNotExist:
            return Response({"detail": "Shikoyat topilmadi"}, status=404)

        serializer = AdminReportResolveSerializer(
            report, data=request.data, partial=True, context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AdminReportListSerializer(report).data)
