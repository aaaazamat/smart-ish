import django_filters
from django.db import models as db_models

from .models import Vacancy, Resume, Organization


# ──────────────────────────────────────────────
# VAKANSIYA FILTRI
# ──────────────────────────────────────────────

class VacancyFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="filter_search", label="Qidiruv (kasb, tashkilot, tavsif)")

    region = django_filters.NumberFilter(field_name="region__id")
    district = django_filters.NumberFilter(field_name="district__id")

    profession = django_filters.NumberFilter(field_name="profession__id")
    industry = django_filters.NumberFilter(field_name="industry__id")

    salary_min = django_filters.NumberFilter(field_name="salary_from", lookup_expr="gte")
    salary_max = django_filters.NumberFilter(field_name="salary_to", lookup_expr="lte")
    payment_type = django_filters.CharFilter(field_name="payment_type")

    experience_required = django_filters.CharFilter(field_name="experience_required")
    education_level = django_filters.CharFilter(field_name="education_level")
    employment_type = django_filters.CharFilter(field_name="employment_type")
    work_mode = django_filters.CharFilter(field_name="work_mode")
    work_schedule = django_filters.CharFilter(field_name="work_schedule")

    for_disabled = django_filters.BooleanFilter(field_name="for_disabled")
    for_graduates = django_filters.BooleanFilter(field_name="for_graduates")
    for_students = django_filters.BooleanFilter(field_name="for_students")

    gender = django_filters.CharFilter(field_name="gender")

    age_min = django_filters.NumberFilter(field_name="age_from", lookup_expr="gte")
    age_max = django_filters.NumberFilter(field_name="age_to", lookup_expr="lte")

    organization = django_filters.NumberFilter(field_name="organization__id")

    created_after = django_filters.DateFilter(field_name="created_at", lookup_expr="date__gte")
    created_before = django_filters.DateFilter(field_name="created_at", lookup_expr="date__lte")

    class Meta:
        model = Vacancy
        fields = []

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            db_models.Q(profession__name__icontains=value) |
            db_models.Q(organization__name__icontains=value) |
            db_models.Q(description__icontains=value)
        ).distinct()


# ──────────────────────────────────────────────
# REZYUME FILTRI
# ──────────────────────────────────────────────

class ResumeFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="filter_search", label="Qidiruv (ism, kasb, ko'nikma)")

    region = django_filters.NumberFilter(field_name="region__id")
    district = django_filters.NumberFilter(field_name="district__id")

    profession = django_filters.NumberFilter(field_name="profession__id")
    career_level = django_filters.CharFilter(field_name="career_level")

    salary_min = django_filters.NumberFilter(field_name="expected_salary", lookup_expr="gte")
    salary_max = django_filters.NumberFilter(field_name="expected_salary", lookup_expr="lte")

    employment_type = django_filters.CharFilter(field_name="employment_type")
    work_mode = django_filters.CharFilter(field_name="work_mode")
    employment_status = django_filters.CharFilter(field_name="employment_status")

    is_disabled = django_filters.BooleanFilter(field_name="is_disabled")
    is_social_registry = django_filters.BooleanFilter(field_name="is_social_registry")
    has_driving_license = django_filters.BooleanFilter(field_name="has_driving_license")

    skills = django_filters.BaseInFilter(field_name="skills__id", lookup_expr="in")

    gender = django_filters.CharFilter(field_name="gender")

    age_min = django_filters.NumberFilter(method="filter_age_min")
    age_max = django_filters.NumberFilter(method="filter_age_max")

    class Meta:
        model = Resume
        fields = []

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            db_models.Q(first_name__icontains=value) |
            db_models.Q(last_name__icontains=value) |
            db_models.Q(profession__name__icontains=value) |
            db_models.Q(skills__name__icontains=value) |
            db_models.Q(profession_detail__icontains=value)
        ).distinct()

    def filter_age_min(self, queryset, name, value):
        from datetime import date
        today = date.today()
        try:
            max_birth_date = today.replace(year=today.year - int(value))
        except ValueError:
            # 29 fevral holatlari uchun
            max_birth_date = today.replace(year=today.year - int(value), day=28)
        return queryset.filter(birth_date__lte=max_birth_date)

    def filter_age_max(self, queryset, name, value):
        from datetime import date
        today = date.today()
        try:
            min_birth_date = today.replace(year=today.year - int(value) - 1)
        except ValueError:
            min_birth_date = today.replace(year=today.year - int(value) - 1, day=28)
        return queryset.filter(birth_date__gte=min_birth_date)


# ──────────────────────────────────────────────
# TASHKILOT FILTRI
# ──────────────────────────────────────────────

class OrganizationFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="filter_search")
    region = django_filters.NumberFilter(field_name="region__id")
    district = django_filters.NumberFilter(field_name="district__id")
    has_vacancies = django_filters.BooleanFilter(method="filter_has_vacancies")

    class Meta:
        model = Organization
        fields = []

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            db_models.Q(name__icontains=value) |
            db_models.Q(description__icontains=value)
        )

    def filter_has_vacancies(self, queryset, name, value):
        if value:
            return queryset.filter(vacancies__is_active=True).distinct()
        return queryset