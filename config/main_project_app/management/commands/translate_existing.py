"""Mavjud DB ma'lumotlarini AI bilan ru va qaa tillariga tarjima qilish.

Foydalanish:
    python manage.py translate_existing --only reference --limit 5 --dry-run
    python manage.py translate_existing --only all
    python manage.py translate_existing --only vacancy

Flag'lar:
    --only {reference, vacancy, organization, resume, all}  default: all
    --limit N                Test uchun N ta yozuvda to'xtash (0 = cheksiz)
    --dry-run                AI chaqirmasdan faqat log

Idempotent: faqat *_uz to'lgan, lekin *_ru yoki *_qaa bo'sh bo'lganlar yangilanadi.
"""
from django.core.management.base import BaseCommand

from main_project_app.models import (
    Region, District, Profession, Skill,
    University, UniversityDirection, Industry,
    Vacancy, Organization, Resume,
)
from main_project_app.translation_service import translate_text


REFERENCE_MODELS = [
    Region, District, Profession, Skill,
    University, UniversityDirection, Industry,
]


class Command(BaseCommand):
    help = "Mavjud ma'lumotlarni AI bilan ru va qaa tillariga tarjima qiladi."

    def add_arguments(self, parser):
        parser.add_argument(
            "--only",
            choices=["reference", "vacancy", "organization", "resume", "all"],
            default="all",
            help="Qaysi modellar tarjima qilinsin (default: all)",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Test uchun N ta yozuvda to'xtash (0 = cheksiz)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="AI chaqirmasdan faqat log",
        )

    def handle(self, *args, **opts):
        scope = opts["only"]
        # limit — JAMI nechta yozuv tarjima qilinadi (barcha modellar bo'ylab).
        # 0 = cheksiz. Build timeout va Gemini limitidan oshmaslik uchun ishlatiladi.
        self.remaining = opts["limit"] or None
        dry = opts["dry_run"]

        self.stdout.write(self.style.NOTICE(
            f"Boshlanyapti: scope={scope}, limit={self.remaining or '∞'} (jami), dry_run={dry}"
        ))

        if scope in ("reference", "all"):
            for Model in REFERENCE_MODELS:
                if self._limit_reached():
                    break
                self._translate_name_field(Model, dry=dry)

        if scope in ("vacancy", "all") and not self._limit_reached():
            self._translate_text_field(Vacancy, "description", dry=dry)

        if scope in ("organization", "all") and not self._limit_reached():
            self._translate_text_field(Organization, "description", dry=dry)

        if scope in ("resume", "all") and not self._limit_reached():
            self._translate_text_field(Resume, "profession_detail", dry=dry)

        self.stdout.write(self.style.SUCCESS("Yakunlandi."))

    def _limit_reached(self) -> bool:
        return self.remaining is not None and self.remaining <= 0

    def _translate_name_field(self, Model, dry=False):
        """Referens model: `name` ustunini name_uz/_ru/_qaa ga tarjima qilish."""
        # Faqat tarjimaga muhtoj (name_ru yoki name_qaa bo'sh) yozuvlar
        qs = Model.objects.filter(name_ru="") | Model.objects.filter(name_qaa="")
        qs = qs.distinct()
        total = qs.count()
        self.stdout.write(f"\n[{Model.__name__}] tarjimaga muhtoj: {total} ta")

        done = 0
        for obj in qs:
            if self._limit_reached():
                self.stdout.write(self.style.WARNING("  Limitga yetildi — to'xtatildi"))
                break

            src = obj.name_uz or obj.name
            if not src:
                continue

            updates = {}
            if not obj.name_uz:
                updates["name_uz"] = src
            if not obj.name_ru:
                ru = translate_text(src, "ru") if not dry else f"[dry: {src} → ru]"
                if ru and ru != src:
                    updates["name_ru"] = ru
            if not obj.name_qaa:
                qaa = translate_text(src, "qaa") if not dry else f"[dry: {src} → qaa]"
                if qaa and qaa != src:
                    updates["name_qaa"] = qaa

            if updates and not dry:
                Model.objects.filter(pk=obj.pk).update(**updates)

            if updates:
                done += 1
                if self.remaining is not None:
                    self.remaining -= 1
                if done % 10 == 0:
                    self.stdout.write(f"  {done} tarjima qilindi")
                if dry:
                    self.stdout.write(f"  [dry] {Model.__name__}#{obj.pk}: {updates}")

        self.stdout.write(self.style.SUCCESS(f"  {Model.__name__} yakunlandi: {done} ta"))

    def _translate_text_field(self, Model, field, dry=False):
        """User content (Vacancy.description, Resume.profession_detail) tarjimasi."""
        # Faqat tarjimaga muhtoj yozuvlar (manba bor, lekin ru yoki qaa bo'sh)
        qs = (Model.objects.filter(**{f"{field}_ru": ""}) |
              Model.objects.filter(**{f"{field}_qaa": ""})).distinct()
        total = qs.count()
        self.stdout.write(f"\n[{Model.__name__}.{field}] tarjimaga muhtoj: {total} ta")

        done = 0
        for obj in qs:
            if self._limit_reached():
                self.stdout.write(self.style.WARNING("  Limitga yetildi — to'xtatildi"))
                break

            src = getattr(obj, f"{field}_uz", "") or getattr(obj, field, "")
            if not src:
                continue

            updates = {}
            if not getattr(obj, f"{field}_uz", ""):
                updates[f"{field}_uz"] = src
            if not getattr(obj, f"{field}_ru", ""):
                ru = translate_text(src, "ru") if not dry else f"[dry: {src[:30]}... → ru]"
                if ru and ru != src:
                    updates[f"{field}_ru"] = ru
            if not getattr(obj, f"{field}_qaa", ""):
                qaa = translate_text(src, "qaa") if not dry else f"[dry: {src[:30]}... → qaa]"
                if qaa and qaa != src:
                    updates[f"{field}_qaa"] = qaa

            if updates and not dry:
                Model.objects.filter(pk=obj.pk).update(**updates)

            if updates:
                done += 1
                if self.remaining is not None:
                    self.remaining -= 1
                if done % 5 == 0:
                    self.stdout.write(f"  {done} tarjima qilindi")

        self.stdout.write(self.style.SUCCESS(f"  {Model.__name__}.{field} yakunlandi: {done}/{total}"))
