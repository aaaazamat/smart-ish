"""
Boshlang'ich administratorni yaratish uchun management command.

Foydalanish:
    python manage.py bootstrap_admin --phone +998901234567 --email admin@example.uz --password admin12345
"""
from django.core.management.base import BaseCommand, CommandError

from main_project_app.models import User


class Command(BaseCommand):
    help = "Platforma uchun boshlang'ich administrator yaratadi (User.Role.ADMIN)"

    def add_arguments(self, parser):
        parser.add_argument("--phone", required=True, help="Telefon raqam +998XXXXXXXXX formatida")
        parser.add_argument("--email", required=True, help="Email manzil")
        parser.add_argument("--password", required=True, help="Parol (minimal 6 ta belgi)")
        parser.add_argument(
            "--update", action="store_true",
            help="Agar foydalanuvchi mavjud bo'lsa, uni admin'ga aylantirish",
        )

    def handle(self, *args, **opts):
        phone = opts["phone"]
        email = opts["email"].strip().lower()
        password = opts["password"]

        if not phone.startswith("+"):
            phone = "+" + phone

        if len(password) < 6:
            raise CommandError("Parol kamida 6 ta belgi bo'lishi kerak")

        existing = User.objects.filter(phone_number=phone).first()
        if existing:
            if not opts["update"]:
                raise CommandError(
                    f"Bu telefon raqam ({phone}) bilan foydalanuvchi mavjud. "
                    f"--update flag bilan rolni o'zgartiring."
                )
            existing.role = User.Role.ADMIN
            existing.is_staff = True
            existing.is_superuser = True
            existing.is_active = True
            existing.email = email
            existing.set_password(password)
            existing.save()
            self.stdout.write(self.style.SUCCESS(
                f"Foydalanuvchi yangilandi: {phone} → role=admin"
            ))
            return

        admin = User.objects.create_user(
            phone_number=phone,
            email=email,
            password=password,
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        self.stdout.write(self.style.SUCCESS(
            f"Administrator yaratildi: id={admin.id}, phone={admin.phone_number}, email={admin.email}"
        ))
