"""Referens ma'lumotlar (viloyat, soha, kasb, tuman) uchun statik ru/qaa tarjima.

Gemini API'ga bog'liq EMAS — qo'lda tayyorlangan lug'at orqali DB'ni to'ldiradi.
Darhol va ishonchli ishlaydi (bepul AI quota cheklovlaridan mustaqil).

Foydalanish:
    python manage.py seed_translations            # faqat bo'sh maydonlarni to'ldiradi
    python manage.py seed_translations --force     # lug'atdagilarni qayta yozadi

Lug'atda yo'q yozuvlar AI signal/translate_existing orqali keyinroq tarjima qilinadi.
"""
from django.core.management.base import BaseCommand

from main_project_app.models import Region, Industry, Profession, District
from main_project_app.reference_translations import (
    REGION_TR, INDUSTRY_TR, PROFESSION_TR, DISTRICT_TR,
)


MODEL_DICTS = [
    (Region, REGION_TR),
    (Industry, INDUSTRY_TR),
    (Profession, PROFESSION_TR),
    (District, DISTRICT_TR),
]


class Command(BaseCommand):
    help = "Referens ma'lumotlarni statik lug'at orqali ru/qaa tillariga tarjima qiladi."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Mavjud tarjimalarni ham lug'atdagi qiymat bilan qayta yozadi",
        )

    def handle(self, *args, **opts):
        force = opts["force"]
        total = 0

        for Model, table in MODEL_DICTS:
            updated = 0
            for obj in Model.objects.all():
                tr = table.get(obj.name)
                updates = {}

                # name_uz har doim asl nom (bo'sh bo'lsa)
                if not obj.name_uz:
                    updates["name_uz"] = obj.name

                if tr:
                    ru, qaa = tr
                    if force or not obj.name_ru:
                        updates["name_ru"] = ru
                    if force or not obj.name_qaa:
                        updates["name_qaa"] = qaa

                if updates:
                    Model.objects.filter(pk=obj.pk).update(**updates)
                    updated += 1

            total += updated
            self.stdout.write(self.style.SUCCESS(
                f"  {Model.__name__}: {updated} ta yangilandi "
                f"(lug'atda {len(table)} ta)"
            ))

        self.stdout.write(self.style.SUCCESS(f"\nJami: {total} ta yozuv tarjima qilindi."))
