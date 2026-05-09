from django.db import models as db_models
from django.db.models import F
from django.utils import timezone

from rest_framework import generics, status, filters
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    User, Organization,
    Region, District, Profession, Skill,
    University, UniversityDirection, Industry,
    Resume, WorkExperience, Education, Certificate,
    Vacancy, VacancyLike, VacancyLanguageRequirement,
    Application, ResumeView, Notification,
)
from .serializers import (
    # reference
    RegionSerializer, DistrictSerializer, ProfessionSerializer, SkillSerializer,
    UniversitySerializer, UniversityDirectionSerializer, IndustrySerializer,
    # organization
    OrganizationListSerializer, OrganizationDetailSerializer,
    # auth
    OTPSendSerializer,
    RegisterJobSeekerSerializer, RegisterEmployerSerializer,
    LoginSerializer, UserProfileSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    # resume
    ResumeListSerializer, ResumeDetailSerializer, ResumeWriteSerializer,
    ResumeSimilarSerializer,
    WorkExperienceSerializer, EducationSerializer, CertificateSerializer,
    # vacancy
    VacancyListSerializer, VacancyDetailSerializer, VacancySimilarSerializer,
    # application
    ApplicationCreateSerializer, ApplicationListSerializer,
    ApplicationDetailSerializer,
    # employer
    EmployerVacancyWriteSerializer, EmployerVacancyListSerializer,
    EmployerResumeListSerializer,
    InvitationCreateSerializer,
    EmployerApplicationListSerializer, EmployerApplicationDetailSerializer,
    ApplicationStatusUpdateSerializer,
    # notifications
    NotificationSerializer,
)
from .filters import VacancyFilter, ResumeFilter, OrganizationFilter
from .permissions import (
    IsJobSeeker, IsEmployer, IsResumeOwner,
    IsVacancyOwner, IsApplicationEmployer,
)


# ══════════════════════════════════════════════
# AUTH
# ══════════════════════════════════════════════

class OTPSendView(APIView):
    """POST /api/auth/otp/send/  body: {"email": "..."}"""
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "otp"

    def post(self, request):
        serializer = OTPSendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Tasdiqlash kodi emailingizga yuborildi"},
            status=status.HTTP_200_OK,
        )


class RegisterJobSeekerView(APIView):
    """POST /api/auth/register/job-seeker/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterJobSeekerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response({
            "access": result["access"],
            "refresh": result["refresh"],
            "user": UserProfileSerializer(result["user"]).data,
        }, status=status.HTTP_201_CREATED)


class RegisterEmployerView(APIView):
    """POST /api/auth/register/employer/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterEmployerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response({
            "access": result["access"],
            "refresh": result["refresh"],
            "user": UserProfileSerializer(result["user"]).data,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/auth/login/"""
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.save(), status=status.HTTP_200_OK)


class LogoutView(APIView):
    """POST /api/auth/logout/  body: {"refresh": "..."}"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "refresh token majburiy"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {"detail": "Token yaroqsiz yoki muddati o'tgan"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"detail": "Tizimdan chiqildi"}, status=status.HTTP_205_RESET_CONTENT)


class ProfileView(APIView):
    """GET / PATCH /api/auth/me/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)

    def patch(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PasswordResetRequestView(APIView):
    """POST /api/auth/password-reset/request/  body: {"email": "..."}"""
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Parolni tiklash kodi emailingizga yuborildi"},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """
    POST /api/auth/password-reset/confirm/
    body: {"email": "...", "code": "...", "new_password": "...", "new_password_confirm": "..."}
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Parol muvaffaqiyatli yangilandi. Endi login qilishingiz mumkin"},
            status=status.HTTP_200_OK,
        )


# ══════════════════════════════════════════════
# REFERENCE
# ══════════════════════════════════════════════

class RegionListView(generics.ListAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class DistrictListView(generics.ListAPIView):
    serializer_class = DistrictSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = District.objects.select_related("region").all()
        region_id = self.request.query_params.get("region")
        if region_id:
            qs = qs.filter(region_id=region_id)
        return qs


class ProfessionListView(generics.ListAPIView):
    queryset = Profession.objects.all()
    serializer_class = ProfessionSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]
    pagination_class = None


class SkillListView(generics.ListAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]
    pagination_class = None


class UniversityListView(generics.ListAPIView):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]
    pagination_class = None


class UniversityDirectionListView(generics.ListAPIView):
    serializer_class = UniversityDirectionSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = UniversityDirection.objects.select_related("university").all()
        university_id = self.request.query_params.get("university")
        if university_id:
            qs = qs.filter(university_id=university_id)
        return qs


class IndustryListView(generics.ListAPIView):
    queryset = Industry.objects.all()
    serializer_class = IndustrySerializer
    permission_classes = [AllowAny]
    pagination_class = None


# ══════════════════════════════════════════════
# TASHKILOT
# ══════════════════════════════════════════════

class OrganizationListView(generics.ListAPIView):
    queryset = Organization.objects.select_related("region", "district").all()
    serializer_class = OrganizationListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = OrganizationFilter
    search_fields = ["name", "description"]
    ordering_fields = ["created_at", "name"]


class OrganizationDetailView(generics.RetrieveAPIView):
    queryset = Organization.objects.select_related("region", "district").all()
    serializer_class = OrganizationDetailSerializer
    permission_classes = [AllowAny]


# ══════════════════════════════════════════════
# VAKANSIYA — UMUMIY
# ══════════════════════════════════════════════

class PublicVacancyListView(generics.ListAPIView):
    """GET /api/vacancies/"""
    serializer_class = VacancyListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = VacancyFilter
    search_fields = ["profession__name", "organization__name", "description"]
    ordering_fields = ["created_at", "salary_from", "salary_to", "views_count"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            Vacancy.objects
            .filter(is_active=True)
            .select_related("organization", "profession", "region", "district", "industry")
        )


class PublicVacancyDetailView(generics.RetrieveAPIView):
    """GET /api/vacancies/{id}/"""
    serializer_class = VacancyDetailSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Vacancy.objects
            .filter(is_active=True)
            .select_related("organization", "profession", "region", "district", "industry")
            .prefetch_related("language_requirements", "likes", "applications")
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # views_count atomik oshirish
        Vacancy.objects.filter(pk=instance.pk).update(views_count=F("views_count") + 1)
        instance.refresh_from_db(fields=["views_count"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class PublicVacancySimilarView(generics.ListAPIView):
    """GET /api/vacancies/{id}/similar/"""
    serializer_class = VacancySimilarSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        vacancy_id = self.kwargs["pk"]
        try:
            vacancy = Vacancy.objects.get(pk=vacancy_id, is_active=True)
        except Vacancy.DoesNotExist:
            return Vacancy.objects.none()

        return (
            Vacancy.objects
            .filter(is_active=True)
            .filter(
                db_models.Q(profession=vacancy.profession) |
                db_models.Q(region=vacancy.region) |
                db_models.Q(industry=vacancy.industry)
            )
            .exclude(pk=vacancy_id)
            .select_related("organization", "profession", "region")
            .order_by("-created_at")[:6]
        )


# ══════════════════════════════════════════════
# VAKANSIYA — LIKE
# ══════════════════════════════════════════════

class VacancyLikeToggleView(APIView):
    """POST /api/vacancies/{id}/like/  → like / unlike"""
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def post(self, request, pk):
        try:
            vacancy = Vacancy.objects.get(pk=pk, is_active=True)
        except Vacancy.DoesNotExist:
            return Response({"detail": "Vakansiya topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        like, created = VacancyLike.objects.get_or_create(user=request.user, vacancy=vacancy)
        if not created:
            like.delete()
            return Response({"liked": False, "detail": "O'chirildi"})
        return Response({"liked": True, "detail": "Saqlandi"}, status=status.HTTP_201_CREATED)


class LikedVacancyListView(generics.ListAPIView):
    """GET /api/vacancies/liked/"""
    serializer_class = VacancyListSerializer
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get_queryset(self):
        return (
            Vacancy.objects
            .filter(likes__user=self.request.user)
            .select_related("organization", "profession", "region", "district")
            .order_by("-likes__created_at")
        )


# ══════════════════════════════════════════════
# REZYUME — UMUMIY
# ══════════════════════════════════════════════

class PublicResumeListView(generics.ListAPIView):
    """GET /api/resumes/"""
    serializer_class = ResumeListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ResumeFilter
    search_fields = ["first_name", "last_name", "profession__name"]
    ordering_fields = ["updated_at", "expected_salary", "created_at"]
    ordering = ["-updated_at"]

    def get_queryset(self):
        return (
            Resume.objects
            .filter(is_published=True)
            .select_related("profession", "region", "district")
            .prefetch_related("skills")
        )


class PublicResumeDetailView(generics.RetrieveAPIView):
    """GET /api/resumes/{id}/"""
    serializer_class = ResumeDetailSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Resume.objects
            .filter(is_published=True)
            .select_related("profession", "region", "district", "user")
            .prefetch_related(
                "skills", "languages",
                "work_experiences",
                "educations", "educations__university", "educations__direction",
                "certificates",
            )
        )


class PublicResumeSimilarView(generics.ListAPIView):
    """GET /api/resumes/{id}/similar/"""
    serializer_class = ResumeSimilarSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        resume_id = self.kwargs["pk"]
        try:
            resume = Resume.objects.get(pk=resume_id, is_published=True)
        except Resume.DoesNotExist:
            return Resume.objects.none()

        return (
            Resume.objects
            .filter(is_published=True)
            .filter(
                db_models.Q(profession=resume.profession) |
                db_models.Q(region=resume.region)
            )
            .exclude(pk=resume_id)
            .select_related("profession", "region")
            .order_by("-updated_at")[:6]
        )


# ══════════════════════════════════════════════
# REZYUME — O'Z REZYUMESI
# ══════════════════════════════════════════════

class MyResumeView(APIView):
    """GET / POST / PUT / PATCH /api/resumes/my/"""
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get(self, request):
        if not hasattr(request.user, "resume"):
            return Response({"detail": "Rezyume hali yaratilmagan"}, status=status.HTTP_404_NOT_FOUND)
        return Response(ResumeDetailSerializer(request.user.resume).data)

    def post(self, request):
        if hasattr(request.user, "resume"):
            return Response(
                {"detail": "Rezyume allaqachon mavjud. Tahrirlash uchun PUT/PATCH dan foydalaning"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ResumeWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        resume = serializer.save(user=request.user)
        return Response(ResumeDetailSerializer(resume).data, status=status.HTTP_201_CREATED)

    def put(self, request):
        return self._update(request, partial=False)

    def patch(self, request):
        return self._update(request, partial=True)

    def _update(self, request, partial: bool):
        if not hasattr(request.user, "resume"):
            return Response({"detail": "Rezyume topilmadi"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ResumeWriteSerializer(request.user.resume, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        resume = serializer.save()
        return Response(ResumeDetailSerializer(resume).data)


# ── ish tajribasi ───────────────────────────────

class WorkExperienceListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkExperienceSerializer
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get_queryset(self):
        if not hasattr(self.request.user, "resume"):
            return WorkExperience.objects.none()
        return self.request.user.resume.work_experiences.all()

    def perform_create(self, serializer):
        if not hasattr(self.request.user, "resume"):
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Avval rezyume yarating")
        serializer.save(resume=self.request.user.resume)


class WorkExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkExperienceSerializer
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get_queryset(self):
        if not hasattr(self.request.user, "resume"):
            return WorkExperience.objects.none()
        return self.request.user.resume.work_experiences.all()


# ── ta'lim ──────────────────────────────────────

class EducationListCreateView(generics.ListCreateAPIView):
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get_queryset(self):
        if not hasattr(self.request.user, "resume"):
            return Education.objects.none()
        return self.request.user.resume.educations.select_related("university", "direction").all()

    def perform_create(self, serializer):
        if not hasattr(self.request.user, "resume"):
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Avval rezyume yarating")
        serializer.save(resume=self.request.user.resume)


class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EducationSerializer
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get_queryset(self):
        if not hasattr(self.request.user, "resume"):
            return Education.objects.none()
        return self.request.user.resume.educations.all()


# ── sertifikat ──────────────────────────────────

class CertificateListCreateView(generics.ListCreateAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get_queryset(self):
        if not hasattr(self.request.user, "resume"):
            return Certificate.objects.none()
        return self.request.user.resume.certificates.all()

    def perform_create(self, serializer):
        if not hasattr(self.request.user, "resume"):
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Avval rezyume yarating")
        serializer.save(resume=self.request.user.resume)


class CertificateDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get_queryset(self):
        if not hasattr(self.request.user, "resume"):
            return Certificate.objects.none()
        return self.request.user.resume.certificates.all()


# ══════════════════════════════════════════════
# ARIZA
# ══════════════════════════════════════════════

class ApplyToVacancyView(APIView):
    """POST /api/vacancies/{vacancy_id}/apply/"""
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def post(self, request, vacancy_id):
        if not Vacancy.objects.filter(pk=vacancy_id, is_active=True).exists():
            return Response({"detail": "Vakansiya topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data["vacancy"] = vacancy_id
        serializer = ApplicationCreateSerializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        return Response(
            ApplicationListSerializer(application).data,
            status=status.HTTP_201_CREATED,
        )


class MyApplicationListView(generics.ListAPIView):
    """GET /api/applications/my/  (?status=...)"""
    serializer_class = ApplicationListSerializer
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get_queryset(self):
        if not hasattr(self.request.user, "resume"):
            return Application.objects.none()

        qs = (
            Application.objects
            .filter(resume=self.request.user.resume)
            .select_related(
                "vacancy", "vacancy__profession",
                "vacancy__organization", "vacancy__region",
            )
            .order_by("-applied_at")
        )

        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class MyApplicationDetailView(generics.RetrieveDestroyAPIView):
    """GET / DELETE /api/applications/my/{id}/"""
    serializer_class = ApplicationDetailSerializer
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get_queryset(self):
        if not hasattr(self.request.user, "resume"):
            return Application.objects.none()
        return Application.objects.filter(resume=self.request.user.resume).select_related(
            "vacancy", "vacancy__organization", "vacancy__profession", "vacancy__region",
        )

    def destroy(self, request, *args, **kwargs):
        application = self.get_object()
        if application.status != Application.Status.PENDING:
            return Response(
                {"detail": "Faqat 'Kutilmoqda' holatidagi arizani qaytarib olish mumkin"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        application.delete()
        return Response({"detail": "Ariza qaytarib olindi"}, status=status.HTTP_204_NO_CONTENT)


class MyApplicationStatsView(APIView):
    """GET /api/applications/my/stats/"""
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get(self, request):
        empty = {
            "total": 0, "pending": 0, "viewed": 0, "invited": 0,
            "interview": 0, "accepted": 0, "hired": 0, "rejected": 0,
        }
        if not hasattr(request.user, "resume"):
            return Response(empty)

        apps = Application.objects.filter(resume=request.user.resume)
        S = Application.Status
        return Response({
            "total": apps.count(),
            "pending": apps.filter(status=S.PENDING).count(),
            "viewed": apps.filter(status=S.VIEWED).count(),
            "invited": apps.filter(status=S.INVITED).count(),
            "interview": apps.filter(status=S.INTERVIEW).count(),
            "accepted": apps.filter(status=S.ACCEPTED).count(),
            "hired": apps.filter(status=S.HIRED).count(),
            "rejected": apps.filter(status=S.REJECTED).count(),
        })


class AiTopVacanciesForMeView(APIView):
    """
    GET /api/ai/top-vacancies-for-me/
    Job seeker rezyumesiga mos top 5 vakansiya (AI tahlili bilan)
    """
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get(self, request):
        from main_project_app.ai_services import calculate_match, AIServiceError
        from concurrent.futures import ThreadPoolExecutor, as_completed

        user = request.user
        if not hasattr(user, "resume"):
            return Response(
                {"detail": "Avval rezyume yarating"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        resume = user.resume

        # Heuristic shortlist
        vacancies_qs = (
            Vacancy.objects.filter(is_active=True)
            .select_related("profession", "industry", "organization", "region")
        )

        primary = list(
            vacancies_qs.filter(
                db_models.Q(profession=resume.profession) |
                db_models.Q(region=resume.region)
            ).distinct()[:8]
        )
        if len(primary) < 3:
            extra_ids = [v.id for v in primary]
            primary += list(
                vacancies_qs.exclude(id__in=extra_ids)[: (8 - len(primary))]
            )

        if not primary:
            return Response({"matched": []})

        def score_vacancy(vacancy):
            try:
                m = calculate_match(resume, vacancy)
                return {
                    "vacancy_id": vacancy.id,
                    "profession_name": vacancy.profession.name if vacancy.profession else "Vakansiya",
                    "organization_name": vacancy.organization.name if vacancy.organization else None,
                    "region_name": vacancy.region.name if vacancy.region else None,
                    "salary_from": vacancy.salary_from,
                    "salary_to": vacancy.salary_to,
                    "score": m["score"],
                    "summary": m["summary"],
                    "matched": (m["matched"] or [])[:3],
                }
            except (AIServiceError, Exception):
                return None

        results = []
        try:
            with ThreadPoolExecutor(max_workers=4) as executor:
                futures = [executor.submit(score_vacancy, v) for v in primary]
                for f in as_completed(futures, timeout=90):
                    res = f.result()
                    if res:
                        results.append(res)
        except TimeoutError:
            pass

        if not results:
            return Response(
                {"detail": "AI tahlil qilolmadi, biroz keyinroq urinib ko'ring"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        results.sort(key=lambda x: x["score"], reverse=True)
        return Response({"matched": results[:5]})


class AiVacancyTopMatchedResumesView(APIView):
    """
    GET /api/employer/vacancies/{vacancy_id}/ai-top-resumes/
    AI yordamida top 5 mos nomzod (parallel Gemini chaqiriqlar)
    """
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request, vacancy_id):
        from main_project_app.ai_services import calculate_match, AIServiceError
        from concurrent.futures import ThreadPoolExecutor, as_completed

        try:
            vacancy = Vacancy.objects.select_related(
                "profession", "industry", "region"
            ).get(pk=vacancy_id, employer=request.user)
        except Vacancy.DoesNotExist:
            return Response(
                {"detail": "Vakansiya topilmadi"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Heuristic shortlist (AI uchun limit qilish maqsadida)
        candidates_qs = (
            Resume.objects.filter(is_published=True)
            .select_related("profession", "region")
            .prefetch_related("skills", "work_experiences")
            .distinct()
        )
        # Avval mos kasb yoki hudud bo'yicha
        primary = list(
            candidates_qs.filter(
                db_models.Q(profession=vacancy.profession) |
                db_models.Q(region=vacancy.region)
            )[:8]
        )
        if len(primary) < 3:
            # Fallback: barcha published rezyume
            extra_ids = [r.id for r in primary]
            primary += list(
                candidates_qs.exclude(id__in=extra_ids)[: (8 - len(primary))]
            )

        if not primary:
            return Response({"matched": []})

        def score_candidate(resume):
            try:
                m = calculate_match(resume, vacancy)
                full_name = " ".join(filter(None, [resume.last_name, resume.first_name]))
                return {
                    "resume_id": resume.id,
                    "full_name": full_name or "Nomzod",
                    "profession_name": resume.profession.name if resume.profession else None,
                    "career_level_display": resume.get_career_level_display(),
                    "region_name": resume.region.name if resume.region else None,
                    "expected_salary": resume.expected_salary,
                    "score": m["score"],
                    "summary": m["summary"],
                    "matched": (m["matched"] or [])[:3],
                }
            except (AIServiceError, Exception):
                return None

        results = []
        try:
            with ThreadPoolExecutor(max_workers=4) as executor:
                futures = [executor.submit(score_candidate, r) for r in primary]
                for f in as_completed(futures, timeout=90):
                    res = f.result()
                    if res:
                        results.append(res)
        except TimeoutError:
            pass

        if not results:
            return Response(
                {"detail": "AI tahlil qilolmadi, biroz keyinroq urinib ko'ring"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        results.sort(key=lambda x: x["score"], reverse=True)
        return Response({"matched": results[:5]})


class AiMatchView(APIView):
    """
    POST /api/ai/match/
    Body: {vacancy: <id>, resume?: <id>}
    Job seeker uchun: resume - o'zinikki ishlatiladi (avtomatik)
    Employer uchun: resume majburiy (qaysi rezyume taqqoslanadi)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from main_project_app.ai_services import calculate_match, AIServiceError

        vacancy_id = request.data.get("vacancy")
        resume_id = request.data.get("resume")

        if not vacancy_id:
            return Response(
                {"detail": "vacancy majburiy"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            vacancy = Vacancy.objects.select_related(
                "profession", "industry", "region"
            ).get(pk=vacancy_id)
        except Vacancy.DoesNotExist:
            return Response(
                {"detail": "Vakansiya topilmadi"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Determine resume
        user = request.user
        if resume_id:
            try:
                resume = Resume.objects.select_related(
                    "profession", "region"
                ).prefetch_related("skills", "work_experiences").get(pk=resume_id)
            except Resume.DoesNotExist:
                return Response(
                    {"detail": "Rezyume topilmadi"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            # Permission: employer can only check their vacancy's potential matches
            if user.role == "employer" and vacancy.employer_id != user.id:
                return Response(
                    {"detail": "Bu vakansiya sizniki emas"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        else:
            # Use own resume (job seeker)
            if not hasattr(user, "resume"):
                return Response(
                    {"detail": "Avval rezyume yarating"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            resume = user.resume

        try:
            result = calculate_match(resume, vacancy)
            return Response(result)
        except AIServiceError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class AiChatView(APIView):
    """
    POST /api/ai/chat/
    Body: {messages: [{role, content}, ...]}
    OSON ISH AI yordamchisi bilan suhbat
    """
    permission_classes = [AllowAny]

    def post(self, request):
        from main_project_app.ai_services import chat, AIServiceError

        messages = request.data.get("messages", [])
        if not isinstance(messages, list) or not messages:
            return Response(
                {"detail": "messages bo'sh bo'lmasligi kerak"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Cap message count and content length to avoid abuse
        clean = []
        for m in messages[-30:]:
            role = m.get("role")
            content = (m.get("content") or "").strip()[:2000]
            if role in ("user", "assistant") and content:
                clean.append({"role": role, "content": content})

        if not clean:
            return Response(
                {"detail": "messages noto'g'ri formatda"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_role = "guest"
        if request.user.is_authenticated:
            user_role = getattr(request.user, "role", "guest")

        try:
            reply = chat(clean, user_role=user_role)
            return Response({"reply": reply})
        except AIServiceError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class GenerateVacancyDescriptionView(APIView):
    """
    POST /api/employer/ai/generate-description/
    Body: {profession: <id>, industry?: <id>, keywords?: "..."}
    Vakansiya tavsifini AI yordamida yaratish (Google Gemini)
    """
    permission_classes = [IsAuthenticated, IsEmployer]

    def post(self, request):
        from main_project_app.ai_services import (
            generate_vacancy_description, AIServiceError,
        )

        profession_id = request.data.get("profession")
        if not profession_id:
            return Response(
                {"detail": "profession majburiy"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            profession = Profession.objects.get(pk=profession_id)
        except Profession.DoesNotExist:
            return Response(
                {"detail": "Kasb topilmadi"},
                status=status.HTTP_404_NOT_FOUND,
            )

        industry_name = ""
        industry_id = request.data.get("industry")
        if industry_id:
            industry_obj = Industry.objects.filter(pk=industry_id).first()
            if industry_obj:
                industry_name = industry_obj.name

        keywords = (request.data.get("keywords") or "").strip()[:500]

        try:
            text = generate_vacancy_description(
                profession=profession.name,
                industry=industry_name,
                keywords=keywords,
            )
            return Response({"description": text})
        except AIServiceError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class EmployerVacancyListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/employer/vacancies/        — o'z vakansiyalari (filter: ?is_active=true|false)
    POST /api/employer/vacancies/        — yangi vakansiya yaratish
    """
    permission_classes = [IsAuthenticated, IsEmployer]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["profession__name", "description"]
    ordering_fields = ["created_at", "updated_at", "views_count"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return EmployerVacancyWriteSerializer
        return EmployerVacancyListSerializer

    def get_queryset(self):
        D = Application.Direction
        S = Application.Status
        qs = (
            Vacancy.objects
            .filter(employer=self.request.user)
            .select_related("profession", "region", "district", "industry")
            .annotate(
                _applications_count=db_models.Count(
                    "applications",
                    filter=db_models.Q(applications__direction=D.APPLIED),
                    distinct=True,
                ),
                _new_applications_count=db_models.Count(
                    "applications",
                    filter=db_models.Q(
                        applications__direction=D.APPLIED,
                        applications__status=S.PENDING,
                    ),
                    distinct=True,
                ),
                _likes_count=db_models.Count("likes", distinct=True),
            )
        )
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ("true", "1", "yes"))
        return qs


class EmployerVacancyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/employer/vacancies/{id}/   — to'liq ma'lumot
    PUT    /api/employer/vacancies/{id}/   — to'liq yangilash
    PATCH  /api/employer/vacancies/{id}/   — qisman yangilash
    DELETE /api/employer/vacancies/{id}/   — o'chirish
    """
    permission_classes = [IsAuthenticated, IsEmployer, IsVacancyOwner]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return EmployerVacancyWriteSerializer
        return VacancyDetailSerializer

    def get_queryset(self):
        return (
            Vacancy.objects
            .filter(employer=self.request.user)
            .select_related("profession", "region", "district", "industry", "organization")
            .prefetch_related("language_requirements")
        )


class EmployerVacancyToggleActiveView(APIView):
    """
    POST /api/employer/vacancies/{id}/toggle-active/
    Vakansiyani faollashtirish/yopish
    """
    permission_classes = [IsAuthenticated, IsEmployer, IsVacancyOwner]

    def post(self, request, pk):
        try:
            vacancy = Vacancy.objects.get(pk=pk, employer=request.user)
        except Vacancy.DoesNotExist:
            return Response({"detail": "Vakansiya topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        vacancy.is_active = not vacancy.is_active
        vacancy.save(update_fields=["is_active", "updated_at"])
        return Response({
            "id": vacancy.id,
            "is_active": vacancy.is_active,
            "detail": "Vakansiya yopildi" if not vacancy.is_active else "Vakansiya faollashtirildi",
        })


class EmployerVacancyApplicationsView(generics.ListAPIView):
    """
    GET /api/employer/vacancies/{vacancy_id}/applications/
    Bitta vakansiyaga kelgan arizalar  (filter: ?status=...)
    """
    serializer_class = EmployerApplicationListSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        vacancy_id = self.kwargs["vacancy_id"]
        # Vakansiya egasini tekshirish
        if not Vacancy.objects.filter(pk=vacancy_id, employer=self.request.user).exists():
            return Application.objects.none()

        qs = (
            Application.objects
            .filter(vacancy_id=vacancy_id, direction=Application.Direction.APPLIED)
            .select_related("resume", "resume__profession", "vacancy", "vacancy__profession")
            .order_by("-applied_at")
        )
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


# ══════════════════════════════════════════════
# 🟢 EMPLOYER — REZYUME KO'RISH
# ══════════════════════════════════════════════

class EmployerResumeListView(generics.ListAPIView):
    """
    GET /api/employer/resumes/
    Barcha nashr etilgan rezyumelar (filterli)
    """
    serializer_class = EmployerResumeListSerializer
    permission_classes = [IsAuthenticated, IsEmployer]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ResumeFilter
    search_fields = ["first_name", "last_name", "profession__name", "skills__name"]
    ordering_fields = ["updated_at", "expected_salary", "created_at"]
    ordering = ["-updated_at"]

    def get_queryset(self):
        return (
            Resume.objects
            .filter(is_published=True)
            .select_related("profession", "region", "district")
            .prefetch_related("skills")
            .distinct()
        )


class EmployerResumeDetailView(generics.RetrieveAPIView):
    """
    GET /api/employer/resumes/{id}/
    Rezyume to'liq ma'lumoti — ko'rish kuzatuvi bilan
    """
    serializer_class = ResumeDetailSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        return (
            Resume.objects
            .filter(is_published=True)
            .select_related("profession", "region", "district", "user")
            .prefetch_related(
                "skills", "languages",
                "work_experiences",
                "educations", "educations__university", "educations__direction",
                "certificates",
            )
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Ko'rish kuzatuvini saqlash (1 soatda bir martaga cheklab qo'yamiz)
        from datetime import timedelta
        from django.utils import timezone
        last_view = ResumeView.objects.filter(
            resume=instance, viewer=request.user
        ).order_by("-viewed_at").first()
        if not last_view or (timezone.now() - last_view.viewed_at) > timedelta(hours=1):
            ResumeView.objects.create(resume=instance, viewer=request.user)

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class EmployerResumeSimilarView(generics.ListAPIView):
    """
    GET /api/employer/resumes/{id}/similar/
    O'xshash rezyumelar (kasb, hudud, ko'nikma asosida)
    """
    serializer_class = EmployerResumeListSerializer
    permission_classes = [IsAuthenticated, IsEmployer]
    pagination_class = None

    def get_queryset(self):
        resume_id = self.kwargs["pk"]
        try:
            resume = Resume.objects.prefetch_related("skills").get(pk=resume_id, is_published=True)
        except Resume.DoesNotExist:
            return Resume.objects.none()

        skill_ids = list(resume.skills.values_list("id", flat=True))

        return (
            Resume.objects
            .filter(is_published=True)
            .filter(
                db_models.Q(profession=resume.profession) |
                db_models.Q(region=resume.region) |
                db_models.Q(skills__id__in=skill_ids)
            )
            .exclude(pk=resume_id)
            .select_related("profession", "region", "district")
            .prefetch_related("skills")
            .distinct()
            .order_by("-updated_at")[:10]
        )


# ══════════════════════════════════════════════
# 🟢 EMPLOYER — TAKLIF (INVITATION)
# ══════════════════════════════════════════════

class InvitationCreateView(APIView):
    """
    POST /api/employer/invitations/
    Body: {"vacancy": <id>, "resume": <id>, "note": "..."}
    """
    permission_classes = [IsAuthenticated, IsEmployer]

    def post(self, request):
        serializer = InvitationCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        invitation = serializer.save()
        return Response(
            EmployerApplicationListSerializer(invitation).data,
            status=status.HTTP_201_CREATED,
        )


class InvitationQuickCreateView(APIView):
    """
    POST /api/employer/resumes/{resume_id}/invite/
    Body: {"vacancy": <id>, "note": "..."}
    Tezkor taklif yuborish (rezyume sahifasidan)
    """
    permission_classes = [IsAuthenticated, IsEmployer]

    def post(self, request, resume_id):
        data = request.data.copy()
        data["resume"] = resume_id
        serializer = InvitationCreateSerializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        invitation = serializer.save()
        return Response(
            EmployerApplicationListSerializer(invitation).data,
            status=status.HTTP_201_CREATED,
        )


# ══════════════════════════════════════════════
# 🟢 EMPLOYER — APPLICATIONS / TAKLIFLAR BO'LIMI
# ══════════════════════════════════════════════

class EmployerApplicationListView(generics.ListAPIView):
    """
    GET /api/employer/applications/
    Filter:
      ?direction=applied|invited
      ?status=pending|viewed|invited|interview|accepted|hired|rejected
      ?vacancy=<id>
    """
    serializer_class = EmployerApplicationListSerializer
    permission_classes = [IsAuthenticated, IsEmployer]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["applied_at", "updated_at", "status"]
    ordering = ["-applied_at"]

    def get_queryset(self):
        qs = (
            Application.objects
            .filter(vacancy__employer=self.request.user)
            .select_related(
                "resume", "resume__profession",
                "vacancy", "vacancy__profession",
            )
        )
        direction = self.request.query_params.get("direction")
        if direction:
            qs = qs.filter(direction=direction)

        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)

        vacancy_id = self.request.query_params.get("vacancy")
        if vacancy_id:
            qs = qs.filter(vacancy_id=vacancy_id)

        return qs


class EmployerApplicationDetailView(generics.RetrieveAPIView):
    """GET /api/employer/applications/{id}/"""
    serializer_class = EmployerApplicationDetailSerializer
    permission_classes = [IsAuthenticated, IsEmployer, IsApplicationEmployer]

    def get_queryset(self):
        return Application.objects.filter(
            vacancy__employer=self.request.user
        ).select_related(
            "resume", "resume__profession", "resume__region",
            "vacancy", "vacancy__profession", "vacancy__organization",
        ).prefetch_related(
            "resume__skills", "resume__languages",
            "resume__work_experiences", "resume__educations", "resume__certificates",
        )


class EmployerApplicationStatusUpdateView(APIView):
    """
    PATCH /api/employer/applications/{id}/status/
    Body: {"status": "viewed|interview|accepted|hired|rejected", "note": "..."}
    """
    permission_classes = [IsAuthenticated, IsEmployer, IsApplicationEmployer]

    def patch(self, request, pk):
        try:
            application = Application.objects.select_related("vacancy").get(
                pk=pk, vacancy__employer=request.user
            )
        except Application.DoesNotExist:
            return Response({"detail": "Ariza topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ApplicationStatusUpdateSerializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(EmployerApplicationDetailSerializer(application).data)


class EmployerApplicationStatsView(APIView):
    """
    GET /api/employer/applications/stats/
    Takliflar bo'limi statistikasi
    """
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request):
        qs = Application.objects.filter(vacancy__employer=request.user)
        S = Application.Status
        D = Application.Direction

        return Response({
            "total":    qs.count(),
            "received": qs.filter(direction=D.APPLIED).count(),
            "sent":     qs.filter(direction=D.INVITED).count(),
            "pending":  qs.filter(status=S.PENDING).count(),
            "viewed":   qs.filter(status=S.VIEWED).count(),
            "invited":  qs.filter(status=S.INVITED).count(),
            "accepted": qs.filter(status=S.ACCEPTED).count(),
            "interview": qs.filter(status=S.INTERVIEW).count(),
            "hired":    qs.filter(status=S.HIRED).count(),
            "rejected": qs.filter(status=S.REJECTED).count(),
        })


# ══════════════════════════════════════════════
# 🟢 EMPLOYER — MONITORING BO'LIMI
# ══════════════════════════════════════════════

def _calc_match_score(vacancy: Vacancy, resume: Resume) -> int:
    """
    Vakansiya va rezyume mosligini % da hisoblaydi (0-100).
    Asosiy mezonlar:
      - Kasb (40%)
      - Hudud (15%)
      - Ish turi (10%)
      - Ish rejimi (10%)
      - Maosh kutilishi (10%)
      - Yosh diapazoni (5%)
      - Ta'lim darajasi (10%)
    """
    score = 0
    weights_total = 0

    # 1) Kasb (40%)
    weights_total += 40
    if vacancy.profession_id and resume.profession_id and vacancy.profession_id == resume.profession_id:
        score += 40

    # 2) Hudud (15%)
    weights_total += 15
    if vacancy.region_id and resume.region_id and vacancy.region_id == resume.region_id:
        score += 15
    elif vacancy.region_id and resume.region_id:
        score += 5  # boshqa hudud, lekin hudud bor

    # 3) Ish turi (10%)
    weights_total += 10
    if vacancy.employment_type == resume.employment_type:
        score += 10

    # 4) Ish rejimi (10%)
    weights_total += 10
    if vacancy.work_mode == resume.work_mode:
        score += 10

    # 5) Maosh (10%)
    weights_total += 10
    if vacancy.salary_from and resume.expected_salary:
        if resume.expected_salary <= (vacancy.salary_to or vacancy.salary_from):
            score += 10
        elif resume.expected_salary <= vacancy.salary_from * 1.2:
            score += 5

    # 6) Yosh (5%)
    weights_total += 5
    if resume.birth_date and (vacancy.age_from or vacancy.age_to):
        from datetime import date
        today = date.today()
        age = today.year - resume.birth_date.year - (
            (today.month, today.day) < (resume.birth_date.month, resume.birth_date.day)
        )
        af = vacancy.age_from or 0
        at = vacancy.age_to or 200
        if af <= age <= at:
            score += 5

    # 7) Ta'lim (10%)
    weights_total += 10
    if vacancy.education_level == Vacancy.EducationLevel.ANY:
        score += 10
    else:
        # Eng yuqori ta'lim darajasini olish
        edu = resume.educations.order_by("-degree_level").first()
        if edu:
            edu_rank = {
                "secondary_special": 1,
                "bachelor": 2,
                "master": 3,
                "phd": 4,
            }
            req_rank = {
                "any": 0,
                "secondary_special": 1,
                "bachelor": 2,
                "master": 3,
                "phd": 4,
            }
            if edu_rank.get(edu.degree_level, 0) >= req_rank.get(vacancy.education_level, 0):
                score += 10

    return int(round(score * 100 / weights_total)) if weights_total else 0


class EmployerVacancyMatchedResumesView(APIView):
    """
    GET /api/employer/vacancies/{vacancy_id}/matched-resumes/
    Mos rezyumelar 3 toifaga ajratilgan:
      - high   (100%-71%)
      - medium (70%-51%)
      - low    (50%-30%)
    """
    permission_classes = [IsAuthenticated, IsEmployer, IsVacancyOwner]

    def get(self, request, vacancy_id):
        try:
            vacancy = Vacancy.objects.select_related("profession", "region").get(
                pk=vacancy_id, employer=request.user
            )
        except Vacancy.DoesNotExist:
            return Response({"detail": "Vakansiya topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        # Birinchi navbatda kasb yoki hudud bo'yicha asosiy filter
        candidates = (
            Resume.objects
            .filter(is_published=True)
            .filter(
                db_models.Q(profession=vacancy.profession) |
                db_models.Q(region=vacancy.region)
            )
            .select_related("profession", "region", "district")
            .prefetch_related("skills", "educations")
            .distinct()[:200]  # tezkor ishlash uchun limit
        )

        high, medium, low = [], [], []
        for resume in candidates:
            score = _calc_match_score(vacancy, resume)
            data = EmployerResumeListSerializer(resume, context={"request": request}).data
            data["match_score"] = score

            if 71 <= score <= 100:
                high.append(data)
            elif 51 <= score <= 70:
                medium.append(data)
            elif 30 <= score <= 50:
                low.append(data)

        # Har bir toifani score bo'yicha kamayish tartibida saralash
        high.sort(key=lambda x: -x["match_score"])
        medium.sort(key=lambda x: -x["match_score"])
        low.sort(key=lambda x: -x["match_score"])

        return Response({
            "vacancy_id": vacancy.id,
            "vacancy_title": vacancy.profession.name if vacancy.profession else "",
            "high":   {"range": "71-100%", "count": len(high),   "items": high[:50]},
            "medium": {"range": "51-70%",  "count": len(medium), "items": medium[:50]},
            "low":    {"range": "30-50%",  "count": len(low),    "items": low[:50]},
        })


class EmployerMonitoringDashboardView(APIView):
    """
    GET /api/employer/monitoring/dashboard/
    Umumiy monitoring sahifasi uchun ma'lumot
    """
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request):
        vacancies = Vacancy.objects.filter(employer=request.user)
        applications = Application.objects.filter(vacancy__employer=request.user)
        S = Application.Status

        return Response({
            "vacancies": {
                "total": vacancies.count(),
                "active": vacancies.filter(is_active=True).count(),
                "closed": vacancies.filter(is_active=False).count(),
                "total_views": vacancies.aggregate(total=db_models.Sum("views_count"))["total"] or 0,
                "total_likes": sum(v.likes.count() for v in vacancies),
            },
            "applications": {
                "total": applications.count(),
                "pending": applications.filter(status=S.PENDING).count(),
                "viewed": applications.filter(status=S.VIEWED).count(),
                "interview": applications.filter(status=S.INTERVIEW).count(),
                "accepted": applications.filter(status=S.ACCEPTED).count(),
                "hired": applications.filter(status=S.HIRED).count(),
                "rejected": applications.filter(status=S.REJECTED).count(),
            },
            "resume_views": {
                "total": ResumeView.objects.filter(viewer=request.user).count(),
            },
        })


class EmployerOrganizationsReportView(APIView):
    """
    GET /api/employer/monitoring/organizations/
    Tashkilotlar bo'yicha hisobot (filter: ?region=&search=)
    """
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request):
        # Foydalanuvchining barcha tashkilotlari (hozir bittadan ko'p bo'lishi ehtimoli kam)
        # Lekin platform doirasida — barcha tashkilotlar (admin uchun)
        qs = Organization.objects.annotate(
            vacancies_count=db_models.Count(
                "vacancies",
                filter=db_models.Q(vacancies__is_active=True),
                distinct=True,
            )
        ).select_related("region", "district")

        region_id = request.query_params.get("region")
        if region_id:
            qs = qs.filter(region_id=region_id)

        search = request.query_params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)

        # Faqat employer'ning vakansiyalari bor tashkilotlari
        my_only = request.query_params.get("my_only", "true").lower() in ("true", "1", "yes")
        if my_only:
            qs = qs.filter(vacancies__employer=request.user).distinct()

        page_size = int(request.query_params.get("page_size", 20))
        page = int(request.query_params.get("page", 1))
        total = qs.count()
        items = qs[(page - 1) * page_size: page * page_size]

        results = [{
            "id": o.id,
            "name": o.name,
            "region": o.region.name if o.region else None,
            "district": o.district.name if o.district else None,
            "vacancies_count": o.vacancies_count,
        } for o in items]

        return Response({
            "count": total,
            "page": page,
            "page_size": page_size,
            "showing": f"{(page - 1) * page_size + 1 if total else 0}-{min(page * page_size, total)} ta {total} tadan",
            "results": results,
        })


class EmployerVacancyTimelineView(APIView):
    """
    GET /api/employer/monitoring/vacancy-timeline/
    Vakansiyalar e'lon qilingan sana bo'yicha guruhlangan
    Filter: ?days=30 (oxirgi N kun)
    """
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request):
        from datetime import timedelta, date
        from django.db.models.functions import TruncDate

        days = int(request.query_params.get("days", 30))
        since = timezone.now() - timedelta(days=days)

        rows = (
            Vacancy.objects
            .filter(employer=request.user, created_at__gte=since)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(
                count=db_models.Count("id"),
                active=db_models.Count("id", filter=db_models.Q(is_active=True)),
                closed=db_models.Count("id", filter=db_models.Q(is_active=False)),
            )
            .order_by("day")
        )

        return Response({
            "since": since.date().isoformat(),
            "until": date.today().isoformat(),
            "days": days,
            "timeline": [
                {
                    "date": r["day"].isoformat() if r["day"] else None,
                    "total": r["count"],
                    "active": r["active"],
                    "closed": r["closed"],
                }
                for r in rows
            ],
        })


# ══════════════════════════════════════════════
# 🔔 BILDIRISHNOMALAR (NOTIFICATIONS)
# ══════════════════════════════════════════════

class NotificationListView(generics.ListAPIView):
    """
    GET /api/notifications/
    Filter: ?is_read=true|false
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Notification.objects.filter(user=self.request.user)
        is_read = self.request.query_params.get("is_read")
        if is_read is not None:
            qs = qs.filter(is_read=is_read.lower() in ("true", "1", "yes"))
        return qs


class NotificationUnreadCountView(APIView):
    """
    GET /api/notifications/unread-count/
    Badge counter — o'qilmagan bildirishnomalar soni
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count})


class NotificationMarkReadView(APIView):
    """POST /api/notifications/{pk}/read/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"detail": "Bildirishnoma topilmadi"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=["is_read"])
        return Response({"id": notification.id, "is_read": True})


class NotificationMarkAllReadView(APIView):
    """POST /api/notifications/read-all/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = (
            Notification.objects
            .filter(user=request.user, is_read=False)
            .update(is_read=True)
        )
        return Response({
            "updated": updated,
            "detail": "Barcha bildirishnomalar o'qildi",
        })


class NotificationDeleteView(APIView):
    """DELETE /api/notifications/{pk}/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"detail": "Bildirishnoma topilmadi"},
                status=status.HTTP_404_NOT_FOUND,
            )
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)