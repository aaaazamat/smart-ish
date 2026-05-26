"""Data migration: mavjud `name`/`description` qiymatlarini `*_uz` versiyalariga ko'chirish.

Idempotent: faqat `*_uz` bo'sh bo'lsa to'ldiradi (qayta migratsiya xavfsiz).
Reverse: hech narsa qilmaslik — ma'lumotlar yo'qotilmasin.
"""
from django.db import migrations


REFERENCE_MODELS = [
    "Region", "District", "Profession", "Skill",
    "University", "UniversityDirection", "Industry",
]


def copy_to_translation_fields(apps, schema_editor):
    """name -> name_uz, description -> description_uz ko'chirish."""
    # Referens modellar (name)
    for model_name in REFERENCE_MODELS:
        Model = apps.get_model("main_project_app", model_name)
        # Faqat name_uz bo'sh bo'lganlarni yangilash
        Model.objects.filter(name_uz="").update(name_uz=models_F_or_name(Model))

    # Vacancy.description
    Vacancy = apps.get_model("main_project_app", "Vacancy")
    Vacancy.objects.filter(description_uz="").exclude(description="").update(
        description_uz=__import__("django.db.models", fromlist=["F"]).F("description")
    )

    # Organization.description
    Organization = apps.get_model("main_project_app", "Organization")
    Organization.objects.filter(description_uz="").exclude(description__isnull=True).exclude(description="").update(
        description_uz=__import__("django.db.models", fromlist=["F"]).F("description")
    )

    # Resume.profession_detail
    Resume = apps.get_model("main_project_app", "Resume")
    Resume.objects.filter(profession_detail_uz="").exclude(profession_detail="").update(
        profession_detail_uz=__import__("django.db.models", fromlist=["F"]).F("profession_detail")
    )


def models_F_or_name(Model):
    """`F('name')` qaytaradi — `update(name_uz=F('name'))` uchun."""
    from django.db.models import F
    return F("name")


def reverse_noop(apps, schema_editor):
    """Reverse: hech narsa qilinmaydi (ma'lumotlar yo'qolmasin)."""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("main_project_app", "0005_translation_fields"),
    ]

    operations = [
        migrations.RunPython(copy_to_translation_fields, reverse_noop),
    ]
