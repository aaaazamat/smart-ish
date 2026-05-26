from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _


# ─────────────────────────────────────────────
# JOYLASHUV
# ─────────────────────────────────────────────

class Region(models.Model):
    name = models.CharField(max_length=100, unique=True)
    # Ko'p tilli versiyalar — AI bilan tarjima qilinadi (translation_service.py).
    name_uz = models.CharField(max_length=100, blank=True, default="")
    name_ru = models.CharField(max_length=100, blank=True, default="")
    name_qaa = models.CharField(max_length=100, blank=True, default="")

    class Meta:
        verbose_name = _("Viloyat/Hudud")
        verbose_name_plural = _("Viloyatlar/Hududlar")
        ordering = ["name"]

    def __str__(self):
        return self.name

    def get_localized_name(self, lang: str = "uz") -> str:
        """Tilga qarab name_uz / name_ru / name_qaa qaytaradi (fallback: uz, keyin name)."""
        return getattr(self, f"name_{lang}", "") or self.name_uz or self.name


class District(models.Model):
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name="districts")
    name = models.CharField(max_length=100)
    name_uz = models.CharField(max_length=100, blank=True, default="")
    name_ru = models.CharField(max_length=100, blank=True, default="")
    name_qaa = models.CharField(max_length=100, blank=True, default="")

    class Meta:
        verbose_name = _("Tuman/Shahar")
        verbose_name_plural = _("Tuman/Shaharlar")
        unique_together = ("region", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.region.name} — {self.name}"

    def get_localized_name(self, lang: str = "uz") -> str:
        return getattr(self, f"name_{lang}", "") or self.name_uz or self.name


# ─────────────────────────────────────────────
# TASHKILOT
# ─────────────────────────────────────────────

class Organization(models.Model):
    name = models.CharField(max_length=255, unique=True)
    inn = models.CharField(max_length=20, blank=True, null=True, unique=True)
    logo = models.ImageField(upload_to="org_logos/", blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    # Description'ning ko'p tilli versiyalari (AI bilan tarjima qilinadi)
    description_uz = models.TextField(blank=True, default="")
    description_ru = models.TextField(blank=True, default="")
    description_qaa = models.TextField(blank=True, default="")
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True)
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Tashkilot")
        verbose_name_plural = _("Tashkilotlar")
        ordering = ["name"]

    def __str__(self):
        return self.name

    def get_localized_description(self, lang: str = "uz") -> str:
        return (getattr(self, f"description_{lang}", "") or
                self.description_uz or self.description or "")


# ─────────────────────────────────────────────
# FOYDALANUVCHI
# ─────────────────────────────────────────────

class UserManager(BaseUserManager):
    def create_user(self, phone_number, email=None, password=None, **extra_fields):
        if not phone_number:
            raise ValueError(_("Telefon raqami majburiy"))
        if not email:
            raise ValueError(_("Email majburiy"))
        email = self.normalize_email(email)
        user = self.model(phone_number=phone_number, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        return self.create_user(phone_number, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        JOB_SEEKER = "job_seeker", _("Ish izlovchi")
        EMPLOYER = "employer", _("Ish beruvchi")
        ADMIN = "admin", _("Administrator")

    phone_regex = RegexValidator(
        regex=r"^\+?998\d{9}$",
        message=_("Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak"),
    )

    phone_number = models.CharField(validators=[phone_regex], max_length=15, unique=True)
    email = models.EmailField(unique=True)
    avatar = models.ImageField(
        upload_to="user_avatars/", blank=True, null=True,
        help_text=_("Profil rasmi (kvadrat shaklida tavsiya etiladi)"),
    )
    role = models.CharField(max_length=20, choices=Role.choices)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="employees"
    )

    objects = UserManager()
    USERNAME_FIELD = "phone_number"
    REQUIRED_FIELDS = ["email"]

    class Meta:
        verbose_name = _("Foydalanuvchi")
        verbose_name_plural = _("Foydalanuvchilar")

    def __str__(self):
        return f"{self.phone_number} ({self.get_role_display()})"


# ─────────────────────────────────────────────
# REFERENCE
# ─────────────────────────────────────────────

class Profession(models.Model):
    name = models.CharField(max_length=255, unique=True)
    name_uz = models.CharField(max_length=255, blank=True, default="")
    name_ru = models.CharField(max_length=255, blank=True, default="")
    name_qaa = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        verbose_name = _("Kasb/Lavozim")
        verbose_name_plural = _("Kasblar/Lavozimlar")
        ordering = ["name"]

    def __str__(self):
        return self.name

    def get_localized_name(self, lang: str = "uz") -> str:
        return getattr(self, f"name_{lang}", "") or self.name_uz or self.name


class Skill(models.Model):
    name = models.CharField(max_length=255, unique=True)
    name_uz = models.CharField(max_length=255, blank=True, default="")
    name_ru = models.CharField(max_length=255, blank=True, default="")
    name_qaa = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        verbose_name = _("Ko'nikma")
        verbose_name_plural = _("Ko'nikmalar")
        ordering = ["name"]

    def __str__(self):
        return self.name

    def get_localized_name(self, lang: str = "uz") -> str:
        return getattr(self, f"name_{lang}", "") or self.name_uz or self.name


class University(models.Model):
    name = models.CharField(max_length=255, unique=True)
    name_uz = models.CharField(max_length=255, blank=True, default="")
    name_ru = models.CharField(max_length=255, blank=True, default="")
    name_qaa = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        verbose_name = _("O'quv muassasasi")
        verbose_name_plural = _("O'quv muassasalari")
        ordering = ["name"]

    def __str__(self):
        return self.name

    def get_localized_name(self, lang: str = "uz") -> str:
        return getattr(self, f"name_{lang}", "") or self.name_uz or self.name


class UniversityDirection(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name="directions")
    name = models.CharField(max_length=255)
    name_uz = models.CharField(max_length=255, blank=True, default="")
    name_ru = models.CharField(max_length=255, blank=True, default="")
    name_qaa = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        verbose_name = _("Yo'nalish")
        verbose_name_plural = _("Yo'nalishlar")
        unique_together = ("university", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.university.name} — {self.name}"

    def get_localized_name(self, lang: str = "uz") -> str:
        return getattr(self, f"name_{lang}", "") or self.name_uz or self.name


class Industry(models.Model):
    name = models.CharField(max_length=255, unique=True)
    name_uz = models.CharField(max_length=255, blank=True, default="")
    name_ru = models.CharField(max_length=255, blank=True, default="")
    name_qaa = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        verbose_name = _("Soha")
        verbose_name_plural = _("Sohalar")
        ordering = ["name"]

    def __str__(self):
        return self.name

    def get_localized_name(self, lang: str = "uz") -> str:
        return getattr(self, f"name_{lang}", "") or self.name_uz or self.name


# ─────────────────────────────────────────────
# REZYUME
# ─────────────────────────────────────────────

class Resume(models.Model):

    class Gender(models.TextChoices):
        MALE = "male", "Erkak"
        FEMALE = "female", "Ayol"

    class CareerLevel(models.TextChoices):
        BEGINNER = "beginner", "Ish faoliyatini yangi boshlamoqda"
        JUNIOR = "junior", "Ish tajribasi kam, o'rganishga tayyor"
        MIDDLE = "middle", "Amaliyot va nazariy bilimlarga ega"
        FRESH_GRADUATE = "fresh_graduate", "Yangi bitiruvchi"
        EXPERIENCED = "experienced", "Tajribali mutaxassis"

    class EmploymentType(models.TextChoices):
        PERMANENT = "permanent", "Doimiy"
        SEASONAL = "seasonal", "Mavsumiy"
        DAILY = "daily", "Kunlik"

    class WorkMode(models.TextChoices):
        OFFICE = "office", "Odatiy (ish joyida)"
        SHIFT = "shift", "Smenali ish"
        REMOTE = "remote", "Masofaviy"
        HYBRID = "hybrid", "Gibrid"
        FREELANCE = "freelance", "Kasanachilik"

    class EmploymentStatus(models.TextChoices):
        ACTIVELY_LOOKING = "actively_looking", "Faol ish qidiruvchiman"
        OPEN_TO_OFFERS = "open_to_offers", "Yangi imkoniyatlarni ko'rib chiqayapman"
        NOT_LOOKING = "not_looking", "Hozircha ish qidirmayapman"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="resume")
    last_name = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    birth_date = models.DateField()
    gender = models.CharField(max_length=10, choices=Gender.choices)

    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True)
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True)

    profession = models.ForeignKey(Profession, on_delete=models.SET_NULL, null=True, blank=True, related_name="resumes")
    profession_detail = models.TextField(blank=True)
    # Profession_detail'ning ko'p tilli versiyalari (AI bilan tarjima qilinadi)
    profession_detail_uz = models.TextField(blank=True, default="")
    profession_detail_ru = models.TextField(blank=True, default="")
    profession_detail_qaa = models.TextField(blank=True, default="")
    career_level = models.CharField(max_length=20, choices=CareerLevel.choices)

    expected_salary = models.PositiveBigIntegerField(null=True, blank=True)
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices)
    work_mode = models.CharField(max_length=20, choices=WorkMode.choices)

    skills = models.ManyToManyField(Skill, blank=True, related_name="resumes")

    is_disabled = models.BooleanField(default=False)
    is_social_registry = models.BooleanField(default=False)

    has_driving_license = models.BooleanField(default=False)
    driving_license_categories = models.CharField(max_length=50, blank=True)

    employment_status = models.CharField(max_length=30, choices=EmploymentStatus.choices)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Rezyume")
        verbose_name_plural = _("Rezyumelar")
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.last_name} {self.first_name}"


class ResumeLanguage(models.Model):
    class Language(models.TextChoices):
        UZBEK = "uz", "O'zbek tili"
        RUSSIAN = "ru", "Rus tili"
        ENGLISH = "en", "Ingliz tili"
        TURKISH = "tr", "Turk tili"
        KOREAN = "ko", "Koreys tili"
        CHINESE = "zh", "Xitoy tili (Mandarin)"
        GERMAN = "de", "Nemis tili"
        JAPANESE = "ja", "Yapon tili"
        HINDI = "hi", "Hind tili"
        SPANISH = "es", "Ispan tili"
        FRENCH = "fr", "Fransuz tili"
        PORTUGUESE = "pt", "Portugal tili"
        URDU = "ur", "Urdu"
        INDONESIAN = "id", "Indonez tili"
        KARAKALPAK = "kaa", "Qoraqalpoq tili"
        TAJIK = "tg", "Tojik tili"
        KAZAKH = "kk", "Qozoq tili"
        KYRGYZ = "ky", "Qirg'iz tili"
        ARABIC = "ar", "Arab tili"

    class Level(models.TextChoices):
        A1 = "A1", "A1 — Boshlang'ich"
        A2 = "A2", "A2 — Elementar"
        B1 = "B1", "B1 — O'rta"
        B2 = "B2", "B2 — O'rtadan yuqori"
        C1 = "C1", "C1 — Ilg'or"
        C2 = "C2", "C2 — Mukammal daraja"

    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="languages")
    language = models.CharField(max_length=10, choices=Language.choices)
    level = models.CharField(max_length=5, choices=Level.choices)

    class Meta:
        unique_together = ("resume", "language")
        verbose_name = _("Rezyume tili")
        verbose_name_plural = _("Rezyume tillari")

    def __str__(self):
        return f"{self.get_language_display()} — {self.level}"


class WorkExperience(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="work_experiences")
    organization_name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    start_month = models.PositiveSmallIntegerField()
    start_year = models.PositiveSmallIntegerField()
    end_month = models.PositiveSmallIntegerField(null=True, blank=True)
    end_year = models.PositiveSmallIntegerField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    responsibilities = models.TextField(blank=True)

    class Meta:
        ordering = ["-start_year", "-start_month"]
        verbose_name = _("Ish tajribasi")
        verbose_name_plural = _("Ish tajribalari")

    def __str__(self):
        return f"{self.position} @ {self.organization_name}"


class Education(models.Model):
    class DegreeLevel(models.TextChoices):
        SECONDARY_SPECIAL = "secondary_special", "O'rta maxsus"
        BACHELOR = "bachelor", "Bakalavr"
        MASTER = "master", "Magistratura"
        PHD = "phd", "PhD"

    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="educations")
    degree_level = models.CharField(max_length=20, choices=DegreeLevel.choices)
    university = models.ForeignKey(University, on_delete=models.SET_NULL, null=True, blank=True, related_name="educations")
    direction = models.ForeignKey(UniversityDirection, on_delete=models.SET_NULL, null=True, blank=True)
    start_year = models.PositiveSmallIntegerField()
    end_year = models.PositiveSmallIntegerField(null=True, blank=True)
    is_studying = models.BooleanField(default=False)

    class Meta:
        verbose_name = _("Ta'lim")
        verbose_name_plural = _("Ta'limlar")
        ordering = ["-start_year"]

    def __str__(self):
        return f"{self.get_degree_level_display()} — {self.university}"


class Certificate(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="certificates")
    name = models.CharField(max_length=255)
    issued_date = models.DateField()
    file_url = models.URLField(blank=True, null=True)
    file = models.FileField(upload_to="certificates/", blank=True, null=True)

    class Meta:
        verbose_name = _("Sertifikat")
        verbose_name_plural = _("Sertifikatlar")
        ordering = ["-issued_date"]

    def __str__(self):
        return self.name


# ─────────────────────────────────────────────
# VAKANSIYA
# ─────────────────────────────────────────────

class Vacancy(models.Model):

    class PaymentType(models.TextChoices):
        MONTHLY = "monthly", "Oylik"
        PIECEWORK = "piecework", "Ishbay"
        HOURLY = "hourly", "Soatbay"
        NEGOTIABLE = "negotiable", "Shartnomaviy"

    class ExperienceRequired(models.TextChoices):
        NO_REQUIREMENT = "no_req", "Talab etilmaydi"
        LESS_THAN_1 = "lt_1", "1 yilgacha"
        ONE_TO_THREE = "1_3", "1-3 yil"
        THREE_TO_FIVE = "3_5", "3-5 yil"
        MORE_THAN_FIVE = "gt_5", "5 yildan ortiq"

    class EducationLevel(models.TextChoices):
        ANY = "any", "Ahamiyatga ega emas"
        SECONDARY_SPECIAL = "secondary_special", "O'rta maxsus"
        BACHELOR = "bachelor", "Oliy (Bakalavr)"
        MASTER = "master", "Oliy (Magistratura)"
        PHD = "phd", "PhD"

    class EmploymentType(models.TextChoices):
        PERMANENT = "permanent", "Doimiy"
        SEASONAL = "seasonal", "Mavsumiy"
        DAILY = "daily", "Kunlik"

    class WorkMode(models.TextChoices):
        OFFICE = "office", "Odatiy"
        SHIFT = "shift", "Smenali"
        REMOTE = "remote", "Masofaviy"
        HYBRID = "hybrid", "Gibrid"

    class WorkSchedule(models.TextChoices):
        SIX_ONE = "6/1", "6/1"
        FIVE_TWO = "5/2", "5/2"
        FOUR_FOUR = "4/4", "4/4"
        FOUR_THREE = "4/3", "4/3"
        FOUR_TWO = "4/2", "4/2"
        THREE_THREE = "3/3", "3/3"
        THREE_TWO = "3/2", "3/2"
        TWO_TWO = "2/2", "2/2"
        TWO_ONE = "2/1", "2/1"
        ONE_THREE = "1/3", "1/3"
        ONE_TWO = "1/2", "1/2"
        FREE = "free", "Erkin grafik"

    class Gender(models.TextChoices):
        ANY = "any", "Ahamiyatsiz"
        MALE = "male", "Erkak"
        FEMALE = "female", "Ayol"

    employer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="vacancies")
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="vacancies")
    profession = models.ForeignKey(Profession, on_delete=models.SET_NULL, null=True, blank=True, related_name="vacancies")
    industry = models.ForeignKey(Industry, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True)
    # Description'ning ko'p tilli versiyalari (AI bilan tarjima qilinadi)
    description_uz = models.TextField(blank=True, default="")
    description_ru = models.TextField(blank=True, default="")
    description_qaa = models.TextField(blank=True, default="")

    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True)
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True)

    payment_type = models.CharField(max_length=20, choices=PaymentType.choices)
    salary_from = models.PositiveBigIntegerField(null=True, blank=True)
    salary_to = models.PositiveBigIntegerField(null=True, blank=True)

    experience_required = models.CharField(max_length=20, choices=ExperienceRequired.choices)
    education_level = models.CharField(max_length=20, choices=EducationLevel.choices, default=EducationLevel.ANY)
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices)
    work_mode = models.CharField(max_length=20, choices=WorkMode.choices)
    work_schedule = models.CharField(max_length=10, choices=WorkSchedule.choices, blank=True)
    gender = models.CharField(max_length=10, choices=Gender.choices, default=Gender.ANY)
    age_from = models.PositiveSmallIntegerField(null=True, blank=True)
    age_to = models.PositiveSmallIntegerField(null=True, blank=True)

    for_disabled = models.BooleanField(default=False)
    for_graduates = models.BooleanField(default=False)
    for_students = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = _("Vakansiya")
        verbose_name_plural = _("Vakansiyalar")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.profession} — {self.organization}"


class VacancyLanguageRequirement(models.Model):
    class Language(models.TextChoices):
        UZBEK = "uz", "O'zbek tili"
        RUSSIAN = "ru", "Rus tili"
        ENGLISH = "en", "Ingliz tili"
        TURKISH = "tr", "Turk tili"
        KOREAN = "ko", "Koreys tili"
        CHINESE = "zh", "Xitoy tili (Mandarin)"
        GERMAN = "de", "Nemis tili"

    class Level(models.TextChoices):
        A1 = "A1", "A1"
        A2 = "A2", "A2"
        B1 = "B1", "B1"
        B2 = "B2", "B2"
        C1 = "C1", "C1"
        C2 = "C2", "C2"

    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE, related_name="language_requirements")
    language = models.CharField(max_length=10, choices=Language.choices)
    min_level = models.CharField(max_length=5, choices=Level.choices)

    class Meta:
        unique_together = ("vacancy", "language")
        verbose_name = _("Vakansiya til talabi")
        verbose_name_plural = _("Vakansiya til talablari")

    def __str__(self):
        return f"{self.get_language_display()} — {self.min_level}+"


# ─────────────────────────────────────────────
# VAKANSIYA LIKE (saqlangan)
# ─────────────────────────────────────────────

class VacancyLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="liked_vacancies")
    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "vacancy")
        verbose_name = _("Saqlangan vakansiya")
        verbose_name_plural = _("Saqlangan vakansiyalar")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} ❤ {self.vacancy}"


# ─────────────────────────────────────────────
# ARIZA / TAKLIF
# ─────────────────────────────────────────────

class Application(models.Model):
    class Direction(models.TextChoices):
        APPLIED = "applied", "Ariza (izlovchi → vakansiya)"
        INVITED = "invited", "Taklif (beruvchi → rezyume)"

    class Status(models.TextChoices):
        PENDING = "pending", "Kutilmoqda"
        VIEWED = "viewed", "Ko'rildi"
        INVITED = "invited", "Taklif yuborildi"
        INTERVIEW = "interview", "Suhbatga chaqirildi"
        ACCEPTED = "accepted", "Qabul qilindi"
        HIRED = "hired", "Ishga qabul qilindi"
        REJECTED = "rejected", "Rad etildi"

    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE, related_name="applications")
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="applications")
    direction = models.CharField(max_length=10, choices=Direction.choices, default=Direction.APPLIED)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    cover_letter = models.TextField(blank=True)
    note = models.TextField(blank=True, help_text=_("Ish beruvchi izohi"))
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Ariza/Taklif")
        verbose_name_plural = _("Arizalar/Takliflar")
        unique_together = ("vacancy", "resume", "direction")
        ordering = ["-applied_at"]

    def __str__(self):
        return f"[{self.get_direction_display()}] {self.resume} ↔ {self.vacancy} ({self.status})"


# ─────────────────────────────────────────────
# OTP
# ─────────────────────────────────────────────

class OTPCode(models.Model):
    class Purpose(models.TextChoices):
        REGISTRATION = "registration", "Ro'yxatdan o'tish"
        PASSWORD_RESET = "password_reset", "Parolni tiklash"

    email = models.EmailField()
    code = models.CharField(max_length=6)
    purpose = models.CharField(
        max_length=20,
        choices=Purpose.choices,
        default=Purpose.REGISTRATION,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()

    class Meta:
        verbose_name = _("OTP kod")
        verbose_name_plural = _("OTP kodlar")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email", "code", "is_used"]),
            models.Index(fields=["email", "purpose", "is_used"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return f"{self.email} — {self.code} ({self.get_purpose_display()})"

    @property
    def is_expired(self) -> bool:
        from django.utils import timezone
        return timezone.now() >= self.expires_at
class ResumeView(models.Model):
    """Ish beruvchi tomonidan rezyume ko'rilganini kuzatish"""
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name="resume_views")
    viewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="viewed_resumes")
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Rezyume ko'rishi")
        verbose_name_plural = _("Rezyume ko'rishlari")
        ordering = ["-viewed_at"]
        indexes = [
            models.Index(fields=["resume", "-viewed_at"]),
            models.Index(fields=["viewer", "-viewed_at"]),
        ]

    def __str__(self):
        return f"{self.viewer} → {self.resume} ({self.viewed_at:%d.%m.%Y %H:%M})"


# ─────────────────────────────────────────────
# BILDIRISHNOMA (NOTIFICATION)
# ─────────────────────────────────────────────

class Notification(models.Model):
    class Type(models.TextChoices):
        APPLICATION_RECEIVED = "application_received", "Yangi ariza qabul qilindi"
        APPLICATION_STATUS_CHANGED = "application_status_changed", "Ariza holati o'zgardi"
        INVITATION_RECEIVED = "invitation_received", "Sizga taklif keldi"
        INVITATION_ACCEPTED = "invitation_accepted", "Taklif qabul qilindi"
        VACANCY_LIKED = "vacancy_liked", "Vakansiya saqlandi"
        SYSTEM = "system", "Tizim xabari"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
        help_text=_("Bildirishnoma yuboriladigan foydalanuvchi"),
    )
    notification_type = models.CharField(max_length=40, choices=Type.choices)
    title = models.CharField(max_length=255)
    message = models.TextField(blank=True)

    # Bog'liq ob'ektlar (kerakli bo'lganlari to'ldiriladi)
    application = models.ForeignKey(
        "Application", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="notifications",
    )
    vacancy = models.ForeignKey(
        Vacancy, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="notifications",
    )
    resume = models.ForeignKey(
        Resume, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="notifications",
    )

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Bildirishnoma")
        verbose_name_plural = _("Bildirishnomalar")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["user", "is_read"]),
        ]

    def __str__(self):
        return f"{self.user} — {self.title}"


# ─────────────────────────────────────────────
# SHIKOYAT (REPORT/ABUSE)
# ─────────────────────────────────────────────

class Report(models.Model):
    """Foydalanuvchilar tomonidan vakansiya yoki rezyume haqida shikoyat"""

    class TargetType(models.TextChoices):
        VACANCY = "vacancy", "Vakansiya"
        RESUME = "resume", "Rezyume"
        ORGANIZATION = "organization", "Tashkilot"
        USER = "user", "Foydalanuvchi"

    class Reason(models.TextChoices):
        SPAM = "spam", "Spam yoki reklama"
        FRAUD = "fraud", "Aldash, firibgarlik"
        INAPPROPRIATE = "inappropriate", "Nomaqbul kontent"
        FAKE = "fake", "Soxta ma'lumot"
        DISCRIMINATION = "discrimination", "Kamsitish"
        OTHER = "other", "Boshqa sabab"

    class Status(models.TextChoices):
        PENDING = "pending", "Ko'rib chiqilmoqda"
        RESOLVED = "resolved", "Hal qilindi"
        REJECTED = "rejected", "Rad etildi"

    reporter = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name="submitted_reports",
        help_text=_("Shikoyat yuborgan foydalanuvchi"),
    )
    target_type = models.CharField(max_length=20, choices=TargetType.choices)
    target_id = models.PositiveBigIntegerField(help_text=_("Shikoyat qilinayotgan ob'ekt ID si"))
    reason = models.CharField(max_length=20, choices=Reason.choices)
    description = models.TextField(blank=True, help_text=_("Qo'shimcha tushuntirish"))

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    resolution_note = models.TextField(blank=True, help_text=_("Admin javobi/qarori"))
    resolved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="resolved_reports",
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Shikoyat")
        verbose_name_plural = _("Shikoyatlar")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["target_type", "target_id"]),
        ]

    def __str__(self):
        return f"[{self.get_status_display()}] {self.get_target_type_display()}#{self.target_id}"