from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsJobSeeker(BasePermission):
    """Faqat ish izlovchilar uchun"""
    message = "Bu amal faqat ish izlovchilar uchun mavjud"

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            getattr(request.user, "role", None) == "job_seeker"
        )


class IsEmployer(BasePermission):
    """Faqat ish beruvchilar uchun"""
    message = "Bu amal faqat ish beruvchilar uchun mavjud"

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            getattr(request.user, "role", None) == "employer"
        )


class IsAdmin(BasePermission):
    """Faqat platforma administratori uchun"""
    message = "Bu amal faqat administrator uchun mavjud"

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            getattr(request.user, "role", None) == "admin"
        )


class IsOwnerOrReadOnly(BasePermission):
    """Ob'ekt egasi tahrirlashi mumkin"""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if hasattr(obj, "user"):
            return obj.user == request.user
        if hasattr(obj, "employer"):
            return obj.employer == request.user
        return False


class IsResumeOwner(BasePermission):
    """Rezyume egasi"""

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsVacancyOwner(BasePermission):
    """Vakansiya egasi (employer)"""
    message = "Bu vakansiya sizga tegishli emas"

    def has_object_permission(self, request, view, obj):
        # obj — Vacancy yoki uning bog'liq ob'ekti bo'lishi mumkin
        if hasattr(obj, "employer"):
            return obj.employer == request.user
        if hasattr(obj, "vacancy"):
            return obj.vacancy.employer == request.user
        return False


class IsApplicationEmployer(BasePermission):
    """Application'ni ko'rish/o'zgartirish — vakansiya egasi (employer)"""
    message = "Bu ariza sizning vakansiyangizga tegishli emas"

    def has_object_permission(self, request, view, obj):
        # obj — Application
        return obj.vacancy.employer == request.user