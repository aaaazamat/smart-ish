"""
Muddati o'tgan faol vakansiyalarni avtomatik yopuvchi management command.

Sozlash:
  Linux/Mac crontab: har kuni 03:00 da ishga tushadi
    0 3 * * * cd /path/to/project && /path/to/.venv/bin/python config/manage.py close_expired_vacancies

  Windows Task Scheduler:
    Trigger: Daily 03:00
    Action: C:\\path\\to\\.venv\\Scripts\\python.exe C:\\path\\to\\config\\manage.py close_expired_vacancies

  Render.com cron job:
    Schedule: 0 3 * * *
    Command: cd config && python manage.py close_expired_vacancies

Foydalanish:
  python manage.py close_expired_vacancies              # haqiqiy ishga tushirish
  python manage.py close_expired_vacancies --dry-run    # nima o'zgarishini ko'rish (yozmaydi)
  python manage.py close_expired_vacancies --no-notify  # bildirishnoma yubormaslik
  python manage.py close_expired_vacancies --verbose    # batafsil log
"""
import logging
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from main_project_app.models import Vacancy, Notification

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = (
        "Muddati o'tgan faol vakansiyalarni yopadi (is_active=False) va "
        "egalariga in-app bildirishnoma yuboradi. Cron orqali ishga tushirish "
        "tavsiya etiladi (kuniga bir marta)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Hech qanday o'zgartirishlar qilmaslik — faqat aniqlangan "
                 "vakansiyalarni chop etish",
        )
        parser.add_argument(
            "--no-notify",
            action="store_true",
            help="Bildirishnoma yubormaslik (faqat yopish)",
        )
        parser.add_argument(
            "--verbose",
            action="store_true",
            help="Har bir vakansiya haqida batafsil ma'lumot chop etish",
        )

    def handle(self, *args, **opts):
        now = timezone.now()
        today = now.date()
        dry_run = opts["dry_run"]
        notify = not opts["no_notify"]
        verbose = opts["verbose"]

        # Muddati o'tgan + hali faol vakansiyalar
        expired_qs = (
            Vacancy.objects
            .filter(is_active=True, expires_at__isnull=False, expires_at__lt=today)
            .select_related("employer", "profession", "organization")
        )

        count = expired_qs.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS(
                f"[{now:%Y-%m-%d %H:%M:%S}] Yopish kerak bo'lgan vakansiya yo'q."
            ))
            return

        self.stdout.write(
            f"[{now:%Y-%m-%d %H:%M:%S}] {count} ta vakansiya muddati o'tgan."
        )
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN — hech narsa o'zgartirilmaydi"))

        if verbose or dry_run:
            for v in expired_qs:
                profession = v.profession.name if v.profession else "—"
                org = v.organization.name if v.organization else "—"
                self.stdout.write(
                    f"  • #{v.id:>4}  expires={v.expires_at}  "
                    f"profession={profession[:30]:<30}  org={org[:25]}"
                )

        if dry_run:
            return

        # Atomik ravishda yopish va bildirishnomalarni yaratish
        notifications_to_create = []
        if notify:
            for v in expired_qs:
                profession = v.profession.name if v.profession else "vakansiya"
                notifications_to_create.append(
                    Notification(
                        user=v.employer,
                        notification_type=Notification.Type.SYSTEM,
                        title="Vakansiya muddati tugadi",
                        message=(
                            f"\"{profession}\" vakansiyangizning muddati "
                            f"({v.expires_at:%d.%m.%Y}) tugadi va u avtomatik "
                            f"yopildi. Davom ettirish uchun muddatni yangilab, "
                            f"qaytadan faollashtiring."
                        ),
                        vacancy=v,
                    )
                )

        with transaction.atomic():
            updated = expired_qs.update(is_active=False, updated_at=now)
            if notifications_to_create:
                Notification.objects.bulk_create(notifications_to_create)

        self.stdout.write(self.style.SUCCESS(
            f"OK {updated} ta vakansiya yopildi, "
            f"{len(notifications_to_create)} ta bildirishnoma yuborildi."
        ))
        logger.info(
            "close_expired_vacancies: closed=%s, notified=%s",
            updated, len(notifications_to_create),
        )
