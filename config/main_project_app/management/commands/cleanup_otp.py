"""
Eskirgan OTP kodlarni xotira tejash uchun o'chiruvchi management command.

OTPCode jadvali har bir SMS/email yuborishda yangi qator yaratadi. Vaqt o'tishi
bilan kichik bazada ham mingga yetishi mumkin — bu qidiruvni sekinlashtiradi.
Bu skript:
  - Ishlatilgan (is_used=True) kodlarni 24 soatdan keyin o'chiradi
  - Muddati tugagan (expires_at < hozir) ishlatilmagan kodlarni ham o'chiradi
  - Bu kodlar endi hech qachon ishlatilmaydi

Sozlash (har kuni 02:00 da):
  Linux: 0 2 * * * cd /path/to/project && /path/to/.venv/bin/python config/manage.py cleanup_otp
  Render.com cron: 0 2 * * *  →  cd config && python manage.py cleanup_otp

Foydalanish:
  python manage.py cleanup_otp              # haqiqiy o'chirish
  python manage.py cleanup_otp --dry-run    # nima o'chirilishini ko'rish
"""
import logging
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from main_project_app.models import OTPCode

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Eskirgan/ishlatilgan OTP kodlarni o'chiradi"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Hech narsani o'chirmaslik, faqat sonni chop etish",
        )
        parser.add_argument(
            "--keep-days",
            type=int,
            default=1,
            help="Ishlatilgan kodlarni necha kunga saqlash (default: 1)",
        )

    def handle(self, *args, **opts):
        now = timezone.now()
        keep_days = opts["keep_days"]
        cutoff = now - timedelta(days=keep_days)

        # Tozalash mezonlari:
        # 1) is_used=True va keep_days dan eski
        # 2) muddati tugagan (expires_at < now) — endi ishlatib bo'lmaydi
        qs = OTPCode.objects.filter(
            Q(is_used=True, created_at__lt=cutoff) |
            Q(expires_at__lt=now)
        )
        count = qs.count()

        self.stdout.write(
            f"[{now:%Y-%m-%d %H:%M:%S}] {count} ta eskirgan OTP topildi "
            f"(keep_days={keep_days})."
        )

        if opts["dry_run"]:
            self.stdout.write(self.style.WARNING("DRY RUN — o'chirilmaydi"))
            return

        if count == 0:
            self.stdout.write(self.style.SUCCESS("Tozalashga kerak emas."))
            return

        deleted, _ = qs.delete()
        self.stdout.write(self.style.SUCCESS(f"OK {deleted} ta OTP o'chirildi."))
        logger.info("cleanup_otp: deleted=%s", deleted)
