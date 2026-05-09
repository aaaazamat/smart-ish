from django.contrib import admin
from .models import (
    Region, District, Organization, User,
    Profession, Skill, University, UniversityDirection, Industry,
    Resume, ResumeLanguage, WorkExperience, Education, Certificate,
    Vacancy, VacancyLanguageRequirement, VacancyLike,
    Application, OTPCode, ResumeView, Notification, Report,
)


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "region")
    list_filter = ("region",)
    search_fields = ("name",)


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "inn", "region", "district", "created_at")
    list_filter = ("region",)
    search_fields = ("name", "inn")


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "phone_number", "email", "role", "is_active", "is_staff", "created_at")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("phone_number", "email")


@admin.register(Profession)
class ProfessionAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(UniversityDirection)
class UniversityDirectionAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "university")
    list_filter = ("university",)
    search_fields = ("name",)


@admin.register(Industry)
class IndustryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


class ResumeLanguageInline(admin.TabularInline):
    model = ResumeLanguage
    extra = 0


class WorkExperienceInline(admin.TabularInline):
    model = WorkExperience
    extra = 0


class EducationInline(admin.TabularInline):
    model = Education
    extra = 0


class CertificateInline(admin.TabularInline):
    model = Certificate
    extra = 0


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ("id", "last_name", "first_name", "profession", "region", "is_published", "updated_at")
    list_filter = ("is_published", "career_level", "employment_type", "work_mode", "region")
    search_fields = ("first_name", "last_name", "phone_number")
    inlines = [ResumeLanguageInline, WorkExperienceInline, EducationInline, CertificateInline]


class VacancyLanguageInline(admin.TabularInline):
    model = VacancyLanguageRequirement
    extra = 0


@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ("id", "profession", "organization", "region", "is_active", "views_count", "created_at")
    list_filter = ("is_active", "employment_type", "work_mode", "region", "industry")
    search_fields = ("description", "profession__name", "organization__name")
    inlines = [VacancyLanguageInline]


@admin.register(VacancyLike)
class VacancyLikeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "vacancy", "created_at")


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("id", "vacancy", "resume", "direction", "status", "applied_at")
    list_filter = ("direction", "status")
    search_fields = ("resume__first_name", "resume__last_name")


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "code", "purpose", "is_used", "expires_at", "created_at")
    list_filter = ("purpose", "is_used")
    search_fields = ("email",)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "notification_type", "title", "is_read", "created_at")
    list_filter = ("notification_type", "is_read", "created_at")
    search_fields = ("user__phone_number", "user__email", "title", "message")
    raw_id_fields = ("user", "application", "vacancy", "resume")
    date_hierarchy = "created_at"
    list_per_page = 50


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("id", "target_type", "target_id", "reason", "status", "reporter", "created_at")
    list_filter = ("status", "target_type", "reason", "created_at")
    search_fields = ("description", "resolution_note", "reporter__phone_number")
    raw_id_fields = ("reporter", "resolved_by")
    date_hierarchy = "created_at"
    list_per_page = 50
@admin.register(ResumeView)
class ResumeViewAdmin(admin.ModelAdmin):
    list_display = ("id", "viewer", "resume", "viewed_at")
    list_filter = ("viewed_at",)
    search_fields = ("viewer__phone_number", "resume__first_name", "resume__last_name")
    raw_id_fields = ("viewer", "resume")