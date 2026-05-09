from datetime import timedelta
import random

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    User, OTPCode,
    Region, District, Profession, Skill,
    University, UniversityDirection, Industry,
    Organization,
    Resume, ResumeLanguage, WorkExperience, Education, Certificate,
    Vacancy, VacancyLanguageRequirement, VacancyLike,
    Application, Notification,
)


# ──────────────────────────────────────────────
# REFERENCE
# ──────────────────────────────────────────────

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ["id", "name"]


class DistrictSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source="region.name", read_only=True)

    class Meta:
        model = District
        fields = ["id", "name", "region", "region_name"]


class ProfessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profession
        fields = ["id", "name"]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ["id", "name"]


class UniversityDirectionSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source="university.name", read_only=True)

    class Meta:
        model = UniversityDirection
        fields = ["id", "name", "university", "university_name"]


class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = ["id", "name"]


# ──────────────────────────────────────────────
# TASHKILOT
# ──────────────────────────────────────────────

class OrganizationListSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source="region.name", read_only=True)
    district_name = serializers.CharField(source="district.name", read_only=True)
    vacancies_count = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            "id", "name", "inn", "logo", "website",
            "region", "region_name", "district", "district_name",
            "vacancies_count", "created_at",
        ]

    def get_vacancies_count(self, obj):
        return obj.vacancies.filter(is_active=True).count()


class OrganizationDetailSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source="region.name", read_only=True)
    district_name = serializers.CharField(source="district.name", read_only=True)
    active_vacancies_count = serializers.SerializerMethodField()
    active_vacancies = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            "id", "name", "inn", "logo", "website", "description",
            "region", "region_name", "district", "district_name",
            "active_vacancies_count", "active_vacancies", "created_at",
        ]

    def get_active_vacancies_count(self, obj):
        return obj.vacancies.filter(is_active=True).count()

    def get_active_vacancies(self, obj):
        qs = obj.vacancies.filter(is_active=True).select_related(
            "profession", "region", "district", "organization"
        )[:5]
        return VacancyListSerializer(qs, many=True, context=self.context).data


# ──────────────────────────────────────────────
# REZYUME — yordamchi
# ──────────────────────────────────────────────

class ResumeLanguageSerializer(serializers.ModelSerializer):
    language_display = serializers.CharField(source="get_language_display", read_only=True)
    level_display = serializers.CharField(source="get_level_display", read_only=True)

    class Meta:
        model = ResumeLanguage
        fields = ["id", "language", "language_display", "level", "level_display"]


class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = [
            "id", "organization_name", "position",
            "start_month", "start_year",
            "end_month", "end_year", "is_current",
            "responsibilities",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        if not attrs.get("is_current"):
            if not attrs.get("end_year") or not attrs.get("end_month"):
                raise serializers.ValidationError(
                    "Hozirda ishlamayotgan bo'lsangiz, end_month va end_year majburiy"
                )
        return attrs


class EducationSerializer(serializers.ModelSerializer):
    degree_level_display = serializers.CharField(source="get_degree_level_display", read_only=True)
    university_name = serializers.CharField(source="university.name", read_only=True)
    direction_name = serializers.CharField(source="direction.name", read_only=True)

    class Meta:
        model = Education
        fields = [
            "id", "degree_level", "degree_level_display",
            "university", "university_name",
            "direction", "direction_name",
            "start_year", "end_year", "is_studying",
        ]


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = ["id", "name", "issued_date", "file_url", "file"]


# ──────────────────────────────────────────────
# REZYUME — asosiy
# ──────────────────────────────────────────────

class ResumeListSerializer(serializers.ModelSerializer):
    profession_name = serializers.CharField(source="profession.name", read_only=True)
    region_name = serializers.CharField(source="region.name", read_only=True)
    district_name = serializers.CharField(source="district.name", read_only=True)
    full_name = serializers.SerializerMethodField()
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Resume
        fields = [
            "id", "full_name", "first_name", "last_name",
            "profession", "profession_name",
            "region_name", "district_name",
            "career_level", "expected_salary",
            "employment_type", "work_mode",
            "skills", "is_published",
            "created_at", "updated_at",
        ]

    def get_full_name(self, obj):
        return f"{obj.last_name} {obj.first_name}".strip()


class ResumeDetailSerializer(serializers.ModelSerializer):
    profession = ProfessionSerializer(read_only=True)
    region = RegionSerializer(read_only=True)
    district = DistrictSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    languages = ResumeLanguageSerializer(many=True, read_only=True)
    work_experiences = WorkExperienceSerializer(many=True, read_only=True)
    educations = EducationSerializer(many=True, read_only=True)
    certificates = CertificateSerializer(many=True, read_only=True)

    gender_display = serializers.CharField(source="get_gender_display", read_only=True)
    career_level_display = serializers.CharField(source="get_career_level_display", read_only=True)
    employment_type_display = serializers.CharField(source="get_employment_type_display", read_only=True)
    work_mode_display = serializers.CharField(source="get_work_mode_display", read_only=True)
    employment_status_display = serializers.CharField(source="get_employment_status_display", read_only=True)

    class Meta:
        model = Resume
        fields = [
            "id", "first_name", "last_name", "middle_name",
            "phone_number", "email", "birth_date",
            "gender", "gender_display",
            "region", "district",
            "profession", "profession_detail",
            "career_level", "career_level_display",
            "expected_salary",
            "employment_type", "employment_type_display",
            "work_mode", "work_mode_display",
            "employment_status", "employment_status_display",
            "is_disabled", "is_social_registry",
            "has_driving_license", "driving_license_categories",
            "skills", "languages",
            "work_experiences", "educations", "certificates",
            "is_published", "created_at", "updated_at",
        ]


class ResumeWriteSerializer(serializers.ModelSerializer):
    skills = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), many=True, required=False
    )

    class Meta:
        model = Resume
        fields = [
            "first_name", "last_name", "middle_name",
            "phone_number", "email", "birth_date", "gender",
            "region", "district",
            "profession", "profession_detail",
            "career_level", "expected_salary",
            "employment_type", "work_mode",
            "skills",
            "is_disabled", "is_social_registry",
            "has_driving_license", "driving_license_categories",
            "employment_status", "is_published",
        ]

    def create(self, validated_data):
        skills = validated_data.pop("skills", [])
        resume = Resume.objects.create(**validated_data)
        if skills:
            resume.skills.set(skills)
        return resume

    def update(self, instance, validated_data):
        skills = validated_data.pop("skills", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if skills is not None:
            instance.skills.set(skills)
        return instance


class ResumeSimilarSerializer(serializers.ModelSerializer):
    profession_name = serializers.CharField(source="profession.name", read_only=True)
    region_name = serializers.CharField(source="region.name", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = ["id", "full_name", "profession_name", "region_name", "expected_salary"]

    def get_full_name(self, obj):
        return f"{obj.last_name} {obj.first_name}"


# ──────────────────────────────────────────────
# VAKANSIYA
# ──────────────────────────────────────────────

class VacancyLanguageSerializer(serializers.ModelSerializer):
    language_display = serializers.CharField(source="get_language_display", read_only=True)
    min_level_display = serializers.CharField(source="get_min_level_display", read_only=True)

    class Meta:
        model = VacancyLanguageRequirement
        fields = ["id", "language", "language_display", "min_level", "min_level_display"]


class VacancyListSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    organization_logo = serializers.ImageField(source="organization.logo", read_only=True)
    profession_name = serializers.CharField(source="profession.name", read_only=True)
    region_name = serializers.CharField(source="region.name", read_only=True)
    district_name = serializers.CharField(source="district.name", read_only=True)
    is_liked = serializers.SerializerMethodField()
    applications_count = serializers.IntegerField(source="applications.count", read_only=True)

    class Meta:
        model = Vacancy
        fields = [
            "id", "profession_name", "organization_name", "organization_logo",
            "region_name", "district_name",
            "payment_type", "salary_from", "salary_to",
            "employment_type", "work_mode", "work_schedule",
            "experience_required", "is_active",
            "views_count", "applications_count",
            "is_liked", "created_at",
        ]

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class VacancyDetailSerializer(serializers.ModelSerializer):
    organization = OrganizationListSerializer(read_only=True)
    profession_name = serializers.CharField(source="profession.name", read_only=True)
    industry_name = serializers.CharField(source="industry.name", read_only=True)
    region_name = serializers.CharField(source="region.name", read_only=True)
    district_name = serializers.CharField(source="district.name", read_only=True)
    language_requirements = VacancyLanguageSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    applications_count = serializers.IntegerField(source="applications.count", read_only=True)

    payment_type_display = serializers.CharField(source="get_payment_type_display", read_only=True)
    experience_required_display = serializers.CharField(source="get_experience_required_display", read_only=True)
    education_level_display = serializers.CharField(source="get_education_level_display", read_only=True)
    employment_type_display = serializers.CharField(source="get_employment_type_display", read_only=True)
    work_mode_display = serializers.CharField(source="get_work_mode_display", read_only=True)
    work_schedule_display = serializers.CharField(source="get_work_schedule_display", read_only=True)
    gender_display = serializers.CharField(source="get_gender_display", read_only=True)

    class Meta:
        model = Vacancy
        fields = [
            "id", "organization", "profession", "profession_name",
            "industry", "industry_name", "description",
            "region", "region_name", "district", "district_name",
            "payment_type", "payment_type_display", "salary_from", "salary_to",
            "experience_required", "experience_required_display",
            "education_level", "education_level_display",
            "employment_type", "employment_type_display",
            "work_mode", "work_mode_display",
            "work_schedule", "work_schedule_display",
            "gender", "gender_display",
            "age_from", "age_to",
            "for_disabled", "for_graduates", "for_students",
            "language_requirements",
            "is_active", "views_count", "applications_count",
            "is_liked", "has_applied",
            "created_at", "updated_at", "expires_at",
        ]

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_has_applied(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            resume = getattr(request.user, "resume", None)
            if resume:
                return obj.applications.filter(
                    resume=resume,
                    direction=Application.Direction.APPLIED
                ).exists()
        return False


class VacancySimilarSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    profession_name = serializers.CharField(source="profession.name", read_only=True)
    region_name = serializers.CharField(source="region.name", read_only=True)

    class Meta:
        model = Vacancy
        fields = [
            "id", "profession_name", "organization_name",
            "region_name", "salary_from", "salary_to",
        ]


# ──────────────────────────────────────────────
# ARIZA
# ──────────────────────────────────────────────

class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["id", "vacancy", "cover_letter"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Avtorizatsiya talab qilinadi")

        resume = getattr(request.user, "resume", None)
        if not resume:
            raise serializers.ValidationError("Avval rezyume yarating")

        vacancy = attrs["vacancy"]
        if Application.objects.filter(
            vacancy=vacancy,
            resume=resume,
            direction=Application.Direction.APPLIED,
        ).exists():
            raise serializers.ValidationError("Siz allaqachon ushbu vakansiyaga ariza yuborgansiz")

        attrs["resume"] = resume
        attrs["direction"] = Application.Direction.APPLIED
        return attrs

    def create(self, validated_data):
        application = Application.objects.create(**validated_data)
        # Employer'ga bildirishnoma
        vacancy = application.vacancy
        candidate = f"{application.resume.last_name} {application.resume.first_name}".strip()
        profession = vacancy.profession.name if vacancy.profession else "vakansiyangiz"
        _create_notification(
            user=vacancy.employer,
            notification_type=Notification.Type.APPLICATION_RECEIVED,
            title="Yangi ariza qabul qilindi",
            message=f"{candidate} '{profession}' vakansiyasiga ariza yubordi.",
            application=application,
            vacancy=vacancy,
            resume=application.resume,
        )
        return application


class ApplicationListSerializer(serializers.ModelSerializer):
    vacancy_title = serializers.CharField(source="vacancy.profession.name", read_only=True)
    organization_name = serializers.CharField(source="vacancy.organization.name", read_only=True)
    region_name = serializers.CharField(source="vacancy.region.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id", "vacancy", "vacancy_title", "organization_name",
            "region_name", "status", "status_display",
            "applied_at", "updated_at",
        ]


class ApplicationDetailSerializer(serializers.ModelSerializer):
    vacancy = VacancyListSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    direction_display = serializers.CharField(source="get_direction_display", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id", "vacancy", "direction", "direction_display",
            "status", "status_display",
            "cover_letter", "note",
            "applied_at", "updated_at",
        ]


class ApplicationStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    pending = serializers.IntegerField()
    viewed = serializers.IntegerField()
    invited = serializers.IntegerField()
    interview = serializers.IntegerField()
    accepted = serializers.IntegerField()
    hired = serializers.IntegerField()
    rejected = serializers.IntegerField()


# ──────────────────────────────────────────────
# OTP
# ──────────────────────────────────────────────

def _create_notification(
    *, user, notification_type: str, title: str,
    message: str = "",
    application=None, vacancy=None, resume=None,
):
    """Bildirishnoma yaratish uchun yordamchi funksiya."""
    return Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        application=application,
        vacancy=vacancy,
        resume=resume,
    )


def _send_otp_email(email: str, code: str) -> None:
    """OTP kodni emailga yuboradi. DEV rejimda konsolga chiqadi."""
    subject = "Tasdiqlash kodi"
    message = (
        f"Sizning tasdiqlash kodingiz: {code}\n\n"
        f"Kod {settings.OTP_CODE_LIFETIME_MINUTES} daqiqa ichida amal qiladi.\n"
        f"Agar siz ushbu so'rovni yubormagan bo'lsangiz, ushbu xatni e'tiborsiz qoldiring."
    )
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )


class OTPSendSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, attrs):
        email = attrs["email"]
        cooldown = settings.OTP_RESEND_COOLDOWN_SECONDS
        last = OTPCode.objects.filter(email=email).order_by("-created_at").first()
        if last and (timezone.now() - last.created_at).total_seconds() < cooldown:
            wait = int(cooldown - (timezone.now() - last.created_at).total_seconds())
            raise serializers.ValidationError(
                {"email": f"Iltimos, {wait} soniyadan so'ng qayta urinib ko'ring"}
            )
        return attrs

    def save(self, **kwargs):
        email = self.validated_data["email"]
        code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timedelta(minutes=settings.OTP_CODE_LIFETIME_MINUTES)

        OTPCode.objects.filter(email=email, is_used=False).update(is_used=True)
        otp = OTPCode.objects.create(email=email, code=code, expires_at=expires_at)
        _send_otp_email(email, code)
        return otp


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, attrs):
        otp = OTPCode.objects.filter(
            email=attrs["email"],
            code=attrs["code"],
            is_used=False,
            expires_at__gt=timezone.now(),
        ).order_by("-created_at").first()

        if not otp:
            raise serializers.ValidationError({"code": "Kod noto'g'ri yoki muddati o'tgan"})

        attrs["otp"] = otp
        return attrs


# ──────────────────────────────────────────────
# RO'YXATDAN O'TISH
# ──────────────────────────────────────────────

class _BaseRegisterSerializer(serializers.Serializer):
    phone_number = serializers.RegexField(
        regex=r"^\+?998\d{9}$",
        error_messages={"invalid": "Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak"},
    )
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6, help_text="Emailga yuborilgan 6 xonali kod")
    password = serializers.CharField(min_length=6, write_only=True)
    password_confirm = serializers.CharField(min_length=6, write_only=True)

    def _validate_common(self, attrs):
        phone = attrs["phone_number"]
        if not phone.startswith("+"):
            phone = "+" + phone
        attrs["phone_number"] = phone

        email = attrs["email"].strip().lower()
        attrs["email"] = email

        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Parollar mos kelmadi"})

        otp = OTPCode.objects.filter(
            email=email,
            code=attrs["code"],
            is_used=False,
            expires_at__gt=timezone.now(),
        ).order_by("-created_at").first()

        if not otp:
            raise serializers.ValidationError({"code": "Kod noto'g'ri yoki muddati o'tgan"})
        attrs["otp"] = otp

        if User.objects.filter(phone_number=phone).exists():
            raise serializers.ValidationError({"phone_number": "Bu telefon raqami allaqachon ro'yxatdan o'tgan"})
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Bu email allaqachon ro'yxatdan o'tgan"})

        return attrs


class RegisterJobSeekerSerializer(_BaseRegisterSerializer):
    def validate(self, attrs):
        return self._validate_common(attrs)

    def save(self, **kwargs):
        data = self.validated_data
        user = User.objects.create_user(
            phone_number=data["phone_number"],
            email=data["email"],
            password=data["password"],
            role=User.Role.JOB_SEEKER,
        )
        otp = data["otp"]
        otp.is_used = True
        otp.save(update_fields=["is_used"])

        refresh = RefreshToken.for_user(user)
        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class RegisterEmployerSerializer(_BaseRegisterSerializer):
    organization_id = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.all(),
        help_text="Tashkilot ID (bazadan tanlanadi)",
    )

    def validate(self, attrs):
        return self._validate_common(attrs)

    def save(self, **kwargs):
        data = self.validated_data
        user = User.objects.create_user(
            phone_number=data["phone_number"],
            email=data["email"],
            password=data["password"],
            role=User.Role.EMPLOYER,
            organization=data["organization_id"],
        )
        otp = data["otp"]
        otp.is_used = True
        otp.save(update_fields=["is_used"])

        refresh = RefreshToken.for_user(user)
        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


# ──────────────────────────────────────────────
# LOGIN
# ──────────────────────────────────────────────

class LoginSerializer(serializers.Serializer):
    phone_number = serializers.RegexField(regex=r"^\+?998\d{9}$")
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        phone = attrs["phone_number"]
        if not phone.startswith("+"):
            phone = "+" + phone

        try:
            user = User.objects.get(phone_number=phone)
        except User.DoesNotExist:
            raise serializers.ValidationError({"phone_number": "Foydalanuvchi topilmadi"})

        if not user.check_password(attrs["password"]):
            raise serializers.ValidationError({"password": "Parol noto'g'ri"})

        if not user.is_active:
            raise serializers.ValidationError({"detail": "Akkaunt bloklangan"})

        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role,
            "phone_number": user.phone_number,
        }


# ──────────────────────────────────────────────
# USER PROFILE
# ──────────────────────────────────────────────

class UserProfileSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    has_resume = serializers.SerializerMethodField()
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "phone_number", "email", "role", "role_display",
            "organization", "organization_name",
            "has_resume", "created_at",
        ]
        read_only_fields = ["phone_number", "email", "role", "created_at"]

    def get_has_resume(self, obj):
        return hasattr(obj, "resume")
class VacancyLanguageWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VacancyLanguageRequirement
        fields = ["id", "language", "min_level"]
        read_only_fields = ["id"]


class EmployerVacancyWriteSerializer(serializers.ModelSerializer):
    """Ish beruvchi vakansiya yaratadi/tahrirlayadi"""
    language_requirements = VacancyLanguageWriteSerializer(many=True, required=False)

    class Meta:
        model = Vacancy
        fields = [
            "id",
            "profession", "industry", "description",
            "region", "district",
            "payment_type", "salary_from", "salary_to",
            "experience_required", "education_level",
            "employment_type", "work_mode", "work_schedule",
            "gender", "age_from", "age_to",
            "for_disabled", "for_graduates", "for_students",
            "is_active", "expires_at",
            "language_requirements",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        sf = attrs.get("salary_from")
        st = attrs.get("salary_to")
        if sf and st and sf > st:
            raise serializers.ValidationError(
                {"salary_to": "salary_to salary_from dan kichik bo'lmasligi kerak"}
            )
        af = attrs.get("age_from")
        at = attrs.get("age_to")
        if af and at and af > at:
            raise serializers.ValidationError(
                {"age_to": "age_to age_from dan kichik bo'lmasligi kerak"}
            )
        return attrs

    def create(self, validated_data):
        languages = validated_data.pop("language_requirements", [])
        request = self.context.get("request")
        validated_data["employer"] = request.user
        validated_data["organization"] = request.user.organization
        vacancy = Vacancy.objects.create(**validated_data)
        for lang in languages:
            VacancyLanguageRequirement.objects.create(vacancy=vacancy, **lang)
        return vacancy

    def update(self, instance, validated_data):
        languages = validated_data.pop("language_requirements", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if languages is not None:
            instance.language_requirements.all().delete()
            for lang in languages:
                VacancyLanguageRequirement.objects.create(vacancy=instance, **lang)
        return instance


class EmployerVacancyListSerializer(serializers.ModelSerializer):
    """Ish beruvchi o'z vakansiyalarini ko'rishi"""
    profession_name = serializers.CharField(source="profession.name", read_only=True)
    region_name = serializers.CharField(source="region.name", read_only=True)
    district_name = serializers.CharField(source="district.name", read_only=True)
    applications_count = serializers.SerializerMethodField()
    new_applications_count = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)

    class Meta:
        model = Vacancy
        fields = [
            "id", "profession", "profession_name",
            "region_name", "district_name",
            "salary_from", "salary_to", "payment_type",
            "employment_type", "work_mode",
            "is_active", "views_count",
            "applications_count", "new_applications_count", "likes_count",
            "created_at", "updated_at", "expires_at",
        ]

    def get_applications_count(self, obj):
        return obj.applications.filter(direction=Application.Direction.APPLIED).count()

    def get_new_applications_count(self, obj):
        return obj.applications.filter(
            direction=Application.Direction.APPLIED,
            status=Application.Status.PENDING,
        ).count()


# ══════════════════════════════════════════════
# EMPLOYER — REZYUME KO'RISH (kengaytirilgan)
# ══════════════════════════════════════════════

class EmployerResumeListSerializer(serializers.ModelSerializer):
    """Ish beruvchi uchun ro'yxat — qo'shimcha ma'lumot bilan"""
    profession_name = serializers.CharField(source="profession.name", read_only=True)
    region_name = serializers.CharField(source="region.name", read_only=True)
    district_name = serializers.CharField(source="district.name", read_only=True)
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    skills = SkillSerializer(many=True, read_only=True)
    has_invited = serializers.SerializerMethodField()
    career_level_display = serializers.CharField(source="get_career_level_display", read_only=True)
    employment_status_display = serializers.CharField(source="get_employment_status_display", read_only=True)

    class Meta:
        model = Resume
        fields = [
            "id", "full_name", "age",
            "profession", "profession_name",
            "region_name", "district_name",
            "career_level", "career_level_display",
            "employment_status", "employment_status_display",
            "expected_salary", "employment_type", "work_mode",
            "is_disabled", "is_social_registry",
            "skills", "has_invited",
            "updated_at",
        ]

    def get_full_name(self, obj):
        return f"{obj.last_name} {obj.first_name}".strip()

    def get_age(self, obj):
        from datetime import date
        if not obj.birth_date:
            return None
        today = date.today()
        return today.year - obj.birth_date.year - (
            (today.month, today.day) < (obj.birth_date.month, obj.birth_date.day)
        )

    def get_has_invited(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return Application.objects.filter(
            resume=obj,
            vacancy__employer=request.user,
            direction=Application.Direction.INVITED,
        ).exists()


# ══════════════════════════════════════════════
# EMPLOYER — TAKLIF YUBORISH
# ══════════════════════════════════════════════

class InvitationCreateSerializer(serializers.ModelSerializer):
    """Ish beruvchi rezyumega taklif yuboradi"""

    class Meta:
        model = Application
        fields = ["id", "vacancy", "resume", "note"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        request = self.context.get("request")
        vacancy = attrs["vacancy"]
        resume = attrs["resume"]

        # Vakansiya egasi tekshiruvi
        if vacancy.employer != request.user:
            raise serializers.ValidationError(
                {"vacancy": "Bu vakansiya sizga tegishli emas"}
            )

        # Vakansiya faolligi
        if not vacancy.is_active:
            raise serializers.ValidationError(
                {"vacancy": "Yopilgan vakansiyaga taklif yuborish mumkin emas"}
            )

        # Rezyume nashr etilganligi
        if not resume.is_published:
            raise serializers.ValidationError(
                {"resume": "Rezyume nashr etilmagan"}
            )

        # Takror tekshiruvi
        if Application.objects.filter(
            vacancy=vacancy,
            resume=resume,
            direction=Application.Direction.INVITED,
        ).exists():
            raise serializers.ValidationError(
                "Siz bu rezyumega ushbu vakansiya uchun allaqachon taklif yuborgansiz"
            )

        attrs["direction"] = Application.Direction.INVITED
        attrs["status"] = Application.Status.INVITED
        return attrs

    def create(self, validated_data):
        invitation = Application.objects.create(**validated_data)
        # Job seeker'ga bildirishnoma (rezyume egasi)
        vacancy = invitation.vacancy
        org_name = vacancy.organization.name if vacancy.organization else "Tashkilot"
        profession = vacancy.profession.name if vacancy.profession else "vakansiya"
        _create_notification(
            user=invitation.resume.user,
            notification_type=Notification.Type.INVITATION_RECEIVED,
            title="Sizga taklif keldi",
            message=f"{org_name} sizni '{profession}' lavozimiga taklif qildi.",
            application=invitation,
            vacancy=vacancy,
            resume=invitation.resume,
        )
        return invitation


# ══════════════════════════════════════════════
# EMPLOYER — ARIZA / TAKLIFNI BOSHQARISH
# ══════════════════════════════════════════════

class EmployerApplicationListSerializer(serializers.ModelSerializer):
    """Ish beruvchi uchun ariza/taklif ro'yxati"""
    resume_id = serializers.IntegerField(source="resume.id", read_only=True)
    resume_full_name = serializers.SerializerMethodField()
    resume_profession = serializers.CharField(source="resume.profession.name", read_only=True)
    vacancy_id = serializers.IntegerField(source="vacancy.id", read_only=True)
    vacancy_title = serializers.CharField(source="vacancy.profession.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    direction_display = serializers.CharField(source="get_direction_display", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id", "direction", "direction_display",
            "status", "status_display",
            "resume_id", "resume_full_name", "resume_profession",
            "vacancy_id", "vacancy_title",
            "cover_letter", "note",
            "applied_at", "updated_at",
        ]

    def get_resume_full_name(self, obj):
        return f"{obj.resume.last_name} {obj.resume.first_name}".strip()


class EmployerApplicationDetailSerializer(serializers.ModelSerializer):
    """Application'ning to'liq ma'lumoti — rezyume bilan"""
    resume = ResumeDetailSerializer(read_only=True)
    vacancy = VacancyListSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    direction_display = serializers.CharField(source="get_direction_display", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id", "direction", "direction_display",
            "status", "status_display",
            "resume", "vacancy",
            "cover_letter", "note",
            "applied_at", "updated_at",
        ]


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """Status yangilash uchun (employer)"""

    class Meta:
        model = Application
        fields = ["id", "status", "note"]
        read_only_fields = ["id"]

    def validate_status(self, value):
        # Faqat employer ishlatishi mumkin bo'lgan statuslar
        allowed = {
            Application.Status.VIEWED,
            Application.Status.ACCEPTED,
            Application.Status.INTERVIEW,
            Application.Status.HIRED,
            Application.Status.REJECTED,
        }
        if value not in allowed:
            raise serializers.ValidationError(
                f"Bu status uchun ruxsat yo'q. Ruxsat etilganlari: {', '.join(allowed)}"
            )
        return value

    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data.get("status", old_status)
        instance = super().update(instance, validated_data)

        # Status haqiqatan o'zgargan bo'lsa va job_seeker yo'naltirilgan bo'lsa
        if old_status != new_status:
            vacancy = instance.vacancy
            org_name = vacancy.organization.name if vacancy.organization else "Tashkilot"
            profession = vacancy.profession.name if vacancy.profession else "vakansiya"
            _create_notification(
                user=instance.resume.user,
                notification_type=Notification.Type.APPLICATION_STATUS_CHANGED,
                title="Ariza holati o'zgardi",
                message=(
                    f"{org_name} ('{profession}') sizning arizangiz holatini "
                    f"\"{instance.get_status_display()}\" ga o'zgartirdi."
                ),
                application=instance,
                vacancy=vacancy,
                resume=instance.resume,
            )
        return instance


# ══════════════════════════════════════════════
# EMPLOYER — STATISTIKA
# ══════════════════════════════════════════════

class EmployerApplicationStatsSerializer(serializers.Serializer):
    """Takliflar bo'limi statistikasi"""
    total = serializers.IntegerField()
    received = serializers.IntegerField(help_text="Kelib tushgan (job_seeker → employer)")
    sent = serializers.IntegerField(help_text="Yuborilgan (employer → job_seeker)")
    accepted = serializers.IntegerField()
    interview = serializers.IntegerField(help_text="Suhbatga chaqirilgan")
    hired = serializers.IntegerField(help_text="Ishga qabul qilingan")
    rejected = serializers.IntegerField()


# ══════════════════════════════════════════════
# NOTIFICATIONS
# ══════════════════════════════════════════════

class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source="get_notification_type_display", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id", "notification_type", "type_display",
            "title", "message",
            "application", "vacancy", "resume",
            "is_read", "created_at",
        ]
        read_only_fields = [
            "id", "notification_type", "type_display",
            "title", "message",
            "application", "vacancy", "resume", "created_at",
        ]


# ══════════════════════════════════════════════
# PASSWORD RESET
# ══════════════════════════════════════════════

class PasswordResetRequestSerializer(serializers.Serializer):
    """Parolni tiklash uchun email orqali OTP yuborish"""
    email = serializers.EmailField()

    def validate_email(self, value):
        value = value.strip().lower()
        if not User.objects.filter(email=value).exists():
            # Xavfsizlik: emailning mavjudligini bildirmaslik mumkin,
            # lekin diplom UX uchun aniq xato qaytaramiz
            raise serializers.ValidationError("Bunday email ro'yxatdan o'tmagan")
        return value

    def validate(self, attrs):
        email = attrs["email"]
        cooldown = settings.OTP_RESEND_COOLDOWN_SECONDS
        last = (
            OTPCode.objects
            .filter(email=email, purpose=OTPCode.Purpose.PASSWORD_RESET)
            .order_by("-created_at")
            .first()
        )
        if last and (timezone.now() - last.created_at).total_seconds() < cooldown:
            wait = int(cooldown - (timezone.now() - last.created_at).total_seconds())
            raise serializers.ValidationError(
                {"email": f"Iltimos, {wait} soniyadan so'ng qayta urinib ko'ring"}
            )
        return attrs

    def save(self, **kwargs):
        email = self.validated_data["email"]
        code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timedelta(minutes=settings.OTP_CODE_LIFETIME_MINUTES)

        # Eski parol-tiklash kodlarini bekor qilish
        OTPCode.objects.filter(
            email=email,
            purpose=OTPCode.Purpose.PASSWORD_RESET,
            is_used=False,
        ).update(is_used=True)

        otp = OTPCode.objects.create(
            email=email,
            code=code,
            expires_at=expires_at,
            purpose=OTPCode.Purpose.PASSWORD_RESET,
        )
        # Maxsus matn — parolni tiklash uchun
        subject = "Parolni tiklash kodi"
        message = (
            f"Salom!\n\n"
            f"Parolingizni tiklash uchun kod: {code}\n\n"
            f"Kod {settings.OTP_CODE_LIFETIME_MINUTES} daqiqa ichida amal qiladi.\n"
            f"Agar siz ushbu so'rovni yubormagan bo'lsangiz, ushbu xatni e'tiborsiz qoldiring."
        )
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return otp


class PasswordResetConfirmSerializer(serializers.Serializer):
    """OTP kod orqali yangi parolni o'rnatish"""
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(min_length=6, write_only=True)
    new_password_confirm = serializers.CharField(min_length=6, write_only=True)

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Parollar mos kelmadi"})

        otp = (
            OTPCode.objects
            .filter(
                email=attrs["email"],
                code=attrs["code"],
                purpose=OTPCode.Purpose.PASSWORD_RESET,
                is_used=False,
                expires_at__gt=timezone.now(),
            )
            .order_by("-created_at")
            .first()
        )
        if not otp:
            raise serializers.ValidationError({"code": "Kod noto'g'ri yoki muddati o'tgan"})

        try:
            user = User.objects.get(email=attrs["email"])
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "Foydalanuvchi topilmadi"})

        attrs["otp"] = otp
        attrs["user"] = user
        return attrs

    def save(self, **kwargs):
        user: User = self.validated_data["user"]
        otp: OTPCode = self.validated_data["otp"]

        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])

        otp.is_used = True
        otp.save(update_fields=["is_used"])
        return user