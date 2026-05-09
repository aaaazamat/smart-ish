"""
Admin (platform administrator) uchun maxsus serializerlar.
Foydalanuvchi tarafidagi serializer'lardan farqli — admin barcha ma'lumotni ko'radi
va ko'pchilik maydonlarni o'zgartira oladi.
"""
from django.utils import timezone
from rest_framework import serializers

from .models import (
    User, Organization,
    Region, District, Profession, Skill,
    University, UniversityDirection, Industry,
    Resume, Vacancy, Application,
    Report,
)


# ══════════════════════════════════════════════
# USER MANAGEMENT
# ══════════════════════════════════════════════

class AdminUserListSerializer(serializers.ModelSerializer):
    """Admin uchun foydalanuvchi ro'yxati"""
    role_display = serializers.CharField(source="get_role_display", read_only=True)
    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "phone_number", "email",
            "role", "role_display",
            "organization", "organization_name",
            "is_active", "is_staff", "is_superuser",
            "created_at", "last_login",
        ]


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Admin foydalanuvchini tahrirlay oladi (rol, holat)"""

    class Meta:
        model = User
        fields = ["role", "is_active", "is_staff", "organization"]

    def validate_role(self, value):
        if value not in dict(User.Role.choices):
            raise serializers.ValidationError("Noma'lum rol")
        return value


class AdminUserBanSerializer(serializers.Serializer):
    """Foydalanuvchini bloklash uchun maxsus serializer"""
    reason = serializers.CharField(required=False, allow_blank=True, max_length=500)


# ══════════════════════════════════════════════
# CONTENT MODERATION (Vacancy / Resume)
# ══════════════════════════════════════════════

class AdminVacancySerializer(serializers.ModelSerializer):
    """Admin uchun vakansiya ro'yxati/detali"""
    employer_phone = serializers.CharField(source="employer.phone_number", read_only=True)
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    profession_name = serializers.CharField(source="profession.name", read_only=True)
    region_name = serializers.CharField(source="region.name", read_only=True)
    applications_count = serializers.IntegerField(source="applications.count", read_only=True)
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)
    reports_count = serializers.SerializerMethodField()

    class Meta:
        model = Vacancy
        fields = [
            "id", "profession", "profession_name",
            "employer", "employer_phone",
            "organization", "organization_name",
            "region_name", "salary_from", "salary_to",
            "is_active", "views_count",
            "applications_count", "likes_count", "reports_count",
            "created_at", "updated_at", "expires_at",
        ]

    def get_reports_count(self, obj):
        return Report.objects.filter(
            target_type=Report.TargetType.VACANCY,
            target_id=obj.id,
            status=Report.Status.PENDING,
        ).count()


class AdminResumeSerializer(serializers.ModelSerializer):
    """Admin uchun rezyume ro'yxati/detali"""
    user_phone = serializers.CharField(source="user.phone_number", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    profession_name = serializers.CharField(source="profession.name", read_only=True)
    region_name = serializers.CharField(source="region.name", read_only=True)
    full_name = serializers.SerializerMethodField()
    reports_count = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = [
            "id", "full_name", "user_phone", "user_email",
            "profession", "profession_name",
            "region_name",
            "career_level", "expected_salary",
            "is_published", "reports_count",
            "created_at", "updated_at",
        ]

    def get_full_name(self, obj):
        return f"{obj.last_name} {obj.first_name}".strip()

    def get_reports_count(self, obj):
        return Report.objects.filter(
            target_type=Report.TargetType.RESUME,
            target_id=obj.id,
            status=Report.Status.PENDING,
        ).count()


# ══════════════════════════════════════════════
# ORGANIZATION CRUD
# ══════════════════════════════════════════════

class AdminOrganizationSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source="region.name", read_only=True)
    district_name = serializers.CharField(source="district.name", read_only=True)
    employees_count = serializers.IntegerField(source="employees.count", read_only=True)
    vacancies_count = serializers.IntegerField(source="vacancies.count", read_only=True)

    class Meta:
        model = Organization
        fields = [
            "id", "name", "inn", "logo", "website", "description",
            "region", "region_name", "district", "district_name",
            "employees_count", "vacancies_count", "created_at",
        ]


# ══════════════════════════════════════════════
# REFERENCE DATA CRUD
# ══════════════════════════════════════════════

class AdminRegionSerializer(serializers.ModelSerializer):
    districts_count = serializers.IntegerField(source="districts.count", read_only=True)

    class Meta:
        model = Region
        fields = ["id", "name", "districts_count"]


class AdminDistrictSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source="region.name", read_only=True)

    class Meta:
        model = District
        fields = ["id", "name", "region", "region_name"]


class AdminProfessionSerializer(serializers.ModelSerializer):
    vacancies_count = serializers.IntegerField(source="vacancies.count", read_only=True)
    resumes_count = serializers.IntegerField(source="resumes.count", read_only=True)

    class Meta:
        model = Profession
        fields = ["id", "name", "vacancies_count", "resumes_count"]


class AdminSkillSerializer(serializers.ModelSerializer):
    resumes_count = serializers.IntegerField(source="resumes.count", read_only=True)

    class Meta:
        model = Skill
        fields = ["id", "name", "resumes_count"]


class AdminIndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = ["id", "name"]


class AdminUniversitySerializer(serializers.ModelSerializer):
    directions_count = serializers.IntegerField(source="directions.count", read_only=True)

    class Meta:
        model = University
        fields = ["id", "name", "directions_count"]


class AdminUniversityDirectionSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source="university.name", read_only=True)

    class Meta:
        model = UniversityDirection
        fields = ["id", "name", "university", "university_name"]


# ══════════════════════════════════════════════
# REPORTS / ABUSE
# ══════════════════════════════════════════════

class ReportCreateSerializer(serializers.ModelSerializer):
    """Foydalanuvchi shikoyat yuborish uchun"""

    class Meta:
        model = Report
        fields = ["id", "target_type", "target_id", "reason", "description"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        target_type = attrs["target_type"]
        target_id = attrs["target_id"]

        # Ob'ekt mavjudligini tekshirish
        model_map = {
            Report.TargetType.VACANCY: Vacancy,
            Report.TargetType.RESUME: Resume,
            Report.TargetType.ORGANIZATION: Organization,
            Report.TargetType.USER: User,
        }
        model = model_map.get(target_type)
        if not model or not model.objects.filter(pk=target_id).exists():
            raise serializers.ValidationError(
                {"target_id": f"{target_type} ID={target_id} topilmadi"}
            )
        return attrs


class AdminReportListSerializer(serializers.ModelSerializer):
    """Admin uchun shikoyat ro'yxati"""
    reporter_phone = serializers.CharField(source="reporter.phone_number", read_only=True)
    target_type_display = serializers.CharField(source="get_target_type_display", read_only=True)
    reason_display = serializers.CharField(source="get_reason_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Report
        fields = [
            "id",
            "reporter", "reporter_phone",
            "target_type", "target_type_display", "target_id",
            "reason", "reason_display",
            "description",
            "status", "status_display",
            "resolved_by", "resolved_at",
            "created_at",
        ]


class AdminReportResolveSerializer(serializers.ModelSerializer):
    """Admin shikoyatni hal qiladi"""

    class Meta:
        model = Report
        fields = ["status", "resolution_note"]

    def validate_status(self, value):
        allowed = {Report.Status.RESOLVED, Report.Status.REJECTED}
        if value not in allowed:
            raise serializers.ValidationError(
                "Faqat 'resolved' yoki 'rejected' bo'lishi mumkin"
            )
        return value

    def update(self, instance, validated_data):
        request = self.context.get("request")
        instance.status = validated_data.get("status", instance.status)
        instance.resolution_note = validated_data.get("resolution_note", instance.resolution_note)
        if request and request.user.is_authenticated:
            instance.resolved_by = request.user
        instance.resolved_at = timezone.now()
        instance.save()
        return instance
