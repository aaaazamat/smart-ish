import random
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from main_project_app.models import (
    User, Organization, Region, District, Profession, Industry, Skill,
    University, UniversityDirection, Vacancy, Resume,
    WorkExperience, Education, Certificate, Application, VacancyLike,
)


REGIONS = {
    "Toshkent shahri": ["Mirobod", "Yunusobod", "Chilonzor", "Yakkasaroy", "Olmazor", "Mirzo Ulug'bek", "Sergeli"],
    "Toshkent viloyati": ["Bekobod", "Yangiyo'l", "Zangiota", "Chinoz", "Ohangaron"],
    "Andijon": ["Andijon shahri", "Asaka", "Xonobod", "Marhamat"],
    "Samarqand": ["Samarqand shahri", "Kattaqo'rg'on", "Urgut", "Bulung'ur"],
    "Buxoro": ["Buxoro shahri", "Kogon", "G'ijduvon", "Vobkent"],
    "Farg'ona": ["Farg'ona shahri", "Marg'ilon", "Quva", "Quvasoy"],
    "Namangan": ["Namangan shahri", "Chust", "Chortoq"],
    "Qashqadaryo": ["Qarshi", "Shahrisabz", "Kitob"],
}

PROFESSIONS = [
    "Buxgalter", "Buxgalter-ekspert", "IT-mutaxassis", "Frontend Developer",
    "Backend Developer", "Full-stack Developer", "DevOps muhandis", "QA tester",
    "Sotuvchi-konsultant", "Menejer", "Loyiha menejeri", "Mahsulot menejeri",
    "Hisobchi", "Marketolog", "SMM mutaxassisi", "Kontent menejer",
    "Dizayner", "UX/UI dizayner", "Grafik dizayner",
    "HR mutaxassisi", "HR direktori", "Yuridik maslahatchi",
    "Quruvchi", "Arxitektor", "Muhandis-loyihachi",
    "Haydovchi", "Oshpaz", "Ofitsiant", "Administrator",
    "O'qituvchi", "Tarbiyachi", "Vrach-terapevt", "Hamshira",
]

INDUSTRIES = [
    "IT va Aloqa", "Moliya va Bank", "Qurilish", "Savdo",
    "Ta'lim", "Sog'liqni saqlash", "Logistika", "Ishlab chiqarish",
]

SKILLS = [
    # IT
    "Python", "JavaScript", "TypeScript", "React", "Vue.js", "Angular",
    "Node.js", "Django", "FastAPI", "Flask", "PostgreSQL", "MySQL", "MongoDB",
    "Redis", "Git", "Docker", "Kubernetes", "Linux", "REST API", "GraphQL",
    "AWS", "CI/CD", "Microservices",
    # General
    "Microsoft Office", "Excel", "Word", "PowerPoint", "1C buxgalteriya",
    # Tillar
    "Ingliz tili", "Rus tili", "O'zbek tili", "Turk tili", "Koreys tili",
    # Soft skills
    "Jamoa bo'lib ishlash", "Liderlik", "Muloqot ko'nikmalari",
    "Vaqtni boshqarish", "Tahliliy fikrlash", "Muammolarni hal qilish",
    "Stress ostida ishlash",
    # Sotuv / Marketing
    "Sotuv", "B2B sotuv", "Marketing", "SMM", "SEO", "Reklama", "CRM",
    # Buxgalteriya
    "Buxgalteriya hisoblari", "Soliqlar", "Bank operatsiyalari",
    # Dizayn
    "Photoshop", "Illustrator", "Figma", "UX/UI", "Sketch",
    # Boshqaruv
    "Loyiha boshqaruvi", "Agile/Scrum", "Personal boshqaruvi", "Budjet",
]

UNIVERSITIES = {
    "Toshkent Axborot Texnologiyalari Universiteti (TATU)": [
        "Dasturiy injiniring", "Axborot xavfsizligi",
        "Sun'iy intellekt", "Telekommunikatsiya texnologiyalari",
    ],
    "O'zbekiston Milliy Universiteti (O'zMU)": [
        "Iqtisodiyot", "Yuridik fan", "Filologiya", "Matematika",
    ],
    "Toshkent Davlat Iqtisodiyot Universiteti (TDIU)": [
        "Buxgalteriya hisobi va audit", "Bank ishi",
        "Marketing", "Boshqaruv",
    ],
    "Westminster International University in Tashkent (WIUT)": [
        "Business Administration", "Computer Science", "Economics",
    ],
    "Inha University in Tashkent (IUT)": [
        "Computer Science", "Information Communication Engineering",
    ],
    "Samarqand Davlat Universiteti": [
        "Tarix", "Ingliz tili va adabiyoti", "Biologiya",
    ],
}

ORG_NAMES = [
    "\"OSON IT\" MCHJ",
    "\"BARAKA QURILISH\" MChJ",
    "\"UZTRADE GROUP\" XK",
    "\"SAMARQAND TEXTILE\" AJ",
    "\"TOSHKENT FINANS\" MCHJ",
    "\"NAVOIY LOGISTICS\" MCHJ",
    "\"FERGANA AGRO\" MChJ",
    "\"BUXORO TUR\" MChJ",
    "\"GREEN MED\" MChJ",
    "\"DIGITAL UZ\" MChJ",
]

LAST_NAMES = [
    "Karimov", "Rahimov", "Yusupov", "Ahmedov", "Tursunov", "Xolmatov",
    "Saidov", "Nazarov", "Ergashev", "Olimov", "Mirzayev", "Hamidov",
    "Rashidov", "Sultonov", "Abdullayev", "Ismoilov", "Sobirov",
    "Murodov", "Komilov", "Abdurahmonov", "Saribaev", "Rahmonov",
    "Tojiboyev", "Bobomurodov", "Eshonqulov",
]
LAST_NAMES_F = [n + "a" for n in LAST_NAMES]

FIRST_NAMES_M = [
    "Azamat", "Bobur", "Doniyor", "Eldor", "Farrux", "G'ulom",
    "Hasan", "Islom", "Javoxir", "Komil", "Lutfullo", "Mansur",
    "Nodir", "Oybek", "Rustam", "Sardor", "Temur", "Ulug'bek",
    "Vohid", "Xojiakbar", "Yormat", "Zafar", "Akbar", "Bahodir",
    "Davron",
]
FIRST_NAMES_F = [
    "Aziza", "Barno", "Dilfuza", "Elnura", "Feruza", "Gulnora",
    "Hilola", "Iroda", "Jasmina", "Kamola", "Laylo", "Madina",
    "Nigora", "Oygul", "Rayhona", "Sevara", "Tursunoy", "Umida",
    "Visola", "Xadicha", "Yulduz", "Zarina",
]
MIDDLE_NAMES_M = ["Akbarovich", "Baxtiyorovich", "Davronovich", "Eshmurodovich", "Farxodovich"]
MIDDLE_NAMES_F = ["Akbarovna", "Baxtiyorovna", "Davronovna", "Eshmurodovna", "Farxodovna"]

POSITIONS_PAST = [
    "Buxgalter", "Yordamchi buxgalter", "Sotuvchi", "Menejer-yordamchi",
    "Junior Frontend Developer", "Junior Backend Developer", "Stajer",
    "Operator", "Konsultant", "Marketing yordamchisi",
    "Loyiha koordinatori", "Office menejer", "Administrator",
]

ORG_NAMES_PAST = [
    "\"NUR SAVDO\" MChJ", "\"OSIYO MARKAZI\" MChJ",
    "\"AKFA GROUP\" AJ", "\"ARTEL\" MChJ", "\"UZUM\" MChJ",
    "\"ARTEL ELECTRONICS\" XK", "\"PAYNET\" MChJ", "\"CLICK\" MChJ",
    "\"TEXNOPROM\" MChJ", "\"EPOS GROUP\" MChJ",
]

VACANCY_DESCRIPTIONS = {
    "default": """**Lavozim haqida**
Tajribali mutaxassisni jamoamizga taklif qilamiz. Sizning bilim va ko'nikmalaringiz kompaniyamizning yanada o'sishiga hissa qo'shadi.

**Asosiy vazifalar**
- Lavozimga oid asosiy vazifalarni bajarish
- Jamoa bilan birgalikda ishlash
- Hisobotlar tayyorlash
- Mijozlar bilan ishlash

**Talablar**
- Tegishli sohada tajriba
- Mas'uliyatli va yetuk shaxs
- Jamoa bilan ishlash ko'nikmasi

**Biz taklif qilamiz**
- Raqobatbardosh maosh
- Qulay ish sharoiti
- Karyerada o'sish imkoniyatlari""",
}


def make_phone(seq: int) -> str:
    """+998 91XXXXXXX formatda telefon"""
    return f"+99891{str(seq).zfill(7)}"


class Command(BaseCommand):
    help = "Demo ma'lumotlar — to'liq populatsiya (foydalanuvchilar, rezyumelar, vakansiyalar, arizalar)"

    def add_arguments(self, parser):
        parser.add_argument("--vacancies", type=int, default=50, help="Vakansiyalar soni")
        parser.add_argument("--seekers", type=int, default=50, help="Job seeker'lar soni")
        parser.add_argument("--employers", type=int, default=10, help="Employer'lar soni")
        parser.add_argument("--applications", type=int, default=80, help="Arizalar soni")
        parser.add_argument(
            "--clear", action="store_true",
            help="Avval barcha demo ma'lumotlarni o'chirish",
        )
        parser.add_argument(
            "--idempotent", action="store_true",
            help="Agar yetarli vakansiya allaqachon bo'lsa, qaytadan yaratmaslik "
                 "(production'da har deploy paytida ishga tushirish uchun xavfsiz)",
        )

    @transaction.atomic
    def handle(self, *args, **opts):
        # Idempotent rejim: yetarli ma'lumot bo'lsa, chiqib ketadi
        # (--clear bilan birga ishlatilsa, --clear ustun keladi)
        if opts.get("idempotent") and not opts["clear"]:
            existing = Vacancy.objects.count()
            threshold = max(opts["vacancies"] // 2, 10)
            if existing >= threshold:
                self.stdout.write(self.style.SUCCESS(
                    f"Demo ma'lumotlar yetarli ({existing} ta vakansiya >= "
                    f"{threshold}) — qaytadan yaratish kerak emas"
                ))
                return

        if opts["clear"]:
            self.stdout.write("Demo ma'lumotlar o'chirilmoqda...")
            Application.objects.all().delete()
            VacancyLike.objects.all().delete()
            Vacancy.objects.all().delete()
            Certificate.objects.all().delete()
            Education.objects.all().delete()
            WorkExperience.objects.all().delete()
            Resume.objects.all().delete()
            User.objects.exclude(role=User.Role.ADMIN).delete()
            self.stdout.write(self.style.WARNING("Eski demo ma'lumotlar o'chirildi"))

        self.stdout.write("Demo ma'lumotlar yaratilmoqda...")

        # ─── Reference data ─────────────────────
        regions = {}
        for r_name, d_names in REGIONS.items():
            region, _ = Region.objects.get_or_create(name=r_name)
            regions[r_name] = region
            for d_name in d_names:
                District.objects.get_or_create(region=region, name=d_name)

        professions = []
        for name in PROFESSIONS:
            p, _ = Profession.objects.get_or_create(name=name)
            professions.append(p)

        industries = []
        for name in INDUSTRIES:
            i, _ = Industry.objects.get_or_create(name=name)
            industries.append(i)

        skills_objs = []
        for name in SKILLS:
            s, _ = Skill.objects.get_or_create(name=name)
            skills_objs.append(s)

        all_directions = []
        for u_name, dirs in UNIVERSITIES.items():
            univ, _ = University.objects.get_or_create(name=u_name)
            for d_name in dirs:
                d, _ = UniversityDirection.objects.get_or_create(university=univ, name=d_name)
                all_directions.append(d)

        all_districts = list(District.objects.select_related("region").all())

        # ─── Organizations ─────────────────────
        orgs = []
        for name in ORG_NAMES:
            org, _ = Organization.objects.get_or_create(name=name)
            orgs.append(org)

        # ─── Employers ─────────────────────
        n_emp = min(opts["employers"], len(orgs))
        employers = []
        for i in range(n_emp):
            phone = f"+998900000{str(i + 1).zfill(3)}"
            user, created = User.objects.get_or_create(
                phone_number=phone,
                defaults={
                    "email": f"employer{i + 1}@example.com",
                    "role": User.Role.EMPLOYER,
                    "is_active": True,
                    "organization": orgs[i],
                },
            )
            if created:
                user.set_password("demo12345")
                user.save()
            employers.append(user)

        # ─── Job seekers + Resumes ─────────────────────
        n_seek = opts["seekers"]
        seekers = []
        resumes = []
        career_levels = list(Resume.CareerLevel.values)
        emp_types = list(Resume.EmploymentType.values)
        work_modes = list(Resume.WorkMode.values)
        emp_statuses = list(Resume.EmploymentStatus.values)

        for i in range(n_seek):
            is_male = random.random() < 0.6
            phone = make_phone(i + 1)
            user, created = User.objects.get_or_create(
                phone_number=phone,
                defaults={
                    "email": f"seeker{i + 1}@example.com",
                    "role": User.Role.JOB_SEEKER,
                    "is_active": True,
                },
            )
            if created:
                user.set_password("demo12345")
                user.save()
            seekers.append(user)

            if hasattr(user, "resume"):
                resumes.append(user.resume)
                continue

            district = random.choice(all_districts)
            birth_year = random.randint(1975, 2003)
            resume = Resume.objects.create(
                user=user,
                last_name=random.choice(LAST_NAMES if is_male else LAST_NAMES_F),
                first_name=random.choice(FIRST_NAMES_M if is_male else FIRST_NAMES_F),
                middle_name=random.choice(MIDDLE_NAMES_M if is_male else MIDDLE_NAMES_F),
                phone_number=phone,
                email=f"seeker{i + 1}@example.com",
                birth_date=date(birth_year, random.randint(1, 12), random.randint(1, 28)),
                gender=Resume.Gender.MALE if is_male else Resume.Gender.FEMALE,
                region=district.region,
                district=district,
                profession=random.choice(professions),
                profession_detail=random.choice([
                    "Tajribali va mas'uliyatli mutaxassis. O'rganishga tayyor.",
                    "Jamoa bilan ishlashni yaxshi ko'raman, natijaga yo'naltirilganman.",
                    "Innovatsion yondashuvlarni qo'llashga ishtiyoqim baland.",
                    "",
                ]),
                career_level=random.choice(career_levels),
                expected_salary=random.choice([
                    3_000_000, 4_000_000, 5_000_000, 6_000_000, 7_000_000,
                    8_000_000, 10_000_000, 12_000_000, 15_000_000,
                ]),
                employment_type=random.choice(emp_types),
                work_mode=random.choice(work_modes),
                employment_status=random.choice(emp_statuses),
                is_disabled=random.random() < 0.05,
                is_social_registry=random.random() < 0.08,
                has_driving_license=random.random() < 0.4,
                driving_license_categories=random.choice(["B", "B, C", "B, C, D", ""]),
                is_published=True,
            )
            # Skills
            n_sk = random.randint(2, 8)
            resume.skills.set(random.sample(skills_objs, n_sk))

            # Work experiences (0-3)
            n_we = random.randint(0, 3)
            for _ in range(n_we):
                start_year = random.randint(2015, 2024)
                end_year = random.randint(start_year, 2026)
                is_current = random.random() < 0.3
                WorkExperience.objects.create(
                    resume=resume,
                    organization_name=random.choice(ORG_NAMES_PAST),
                    position=random.choice(POSITIONS_PAST),
                    start_month=random.randint(1, 12),
                    start_year=start_year,
                    end_month=None if is_current else random.randint(1, 12),
                    end_year=None if is_current else end_year,
                    is_current=is_current,
                    responsibilities="Asosiy vazifalar bajarildi, hisobotlar tayyorlandi.",
                )

            # Educations (1-2)
            for _ in range(random.randint(1, 2)):
                d = random.choice(all_directions)
                start_year = random.randint(2010, 2022)
                Education.objects.create(
                    resume=resume,
                    degree_level=random.choice(list(Education.DegreeLevel.values)),
                    university=d.university,
                    direction=d,
                    start_year=start_year,
                    end_year=start_year + 4,
                    is_studying=False,
                )

            # Certificates (0-2)
            for _ in range(random.randint(0, 2)):
                Certificate.objects.create(
                    resume=resume,
                    name=random.choice([
                        "Python Developer Certificate",
                        "AWS Cloud Practitioner",
                        "Google Analytics Certified",
                        "Scrum Master Certified",
                        "1C buxgalter sertifikati",
                        "TOEFL iBT 90+",
                        "IELTS 7.0",
                    ]),
                    issued_date=date(random.randint(2020, 2025), random.randint(1, 12), random.randint(1, 28)),
                )

            resumes.append(resume)

        # ─── Vacancies ─────────────────────
        n_vac = opts["vacancies"]
        vacancies_created = 0
        payment_types = list(Vacancy.PaymentType.values)
        exp_required = list(Vacancy.ExperienceRequired.values)
        edu_levels = list(Vacancy.EducationLevel.values)
        emp_types_v = list(Vacancy.EmploymentType.values)
        work_modes_v = list(Vacancy.WorkMode.values)
        schedules = list(Vacancy.WorkSchedule.values)
        genders = list(Vacancy.Gender.values)

        for _ in range(n_vac):
            district = random.choice(all_districts)
            employer = random.choice(employers)
            salary_from = random.choice([2_000_000, 3_000_000, 4_000_000, 5_000_000, 6_000_000, 8_000_000, 10_000_000])
            salary_to = salary_from + random.choice([2_000_000, 5_000_000, 8_000_000, 15_000_000])

            Vacancy.objects.create(
                employer=employer,
                organization=employer.organization,
                profession=random.choice(professions),
                industry=random.choice(industries),
                description=VACANCY_DESCRIPTIONS["default"],
                region=district.region,
                district=district,
                payment_type=random.choice(payment_types),
                salary_from=salary_from,
                salary_to=salary_to,
                experience_required=random.choice(exp_required),
                education_level=random.choice(edu_levels),
                employment_type=random.choice(emp_types_v),
                work_mode=random.choice(work_modes_v),
                work_schedule=random.choice(schedules),
                gender=random.choice(genders),
                age_from=random.choice([None, 18, 21, 25]),
                age_to=random.choice([None, 35, 45, 55]),
                for_disabled=random.random() < 0.1,
                for_graduates=random.random() < 0.15,
                for_students=random.random() < 0.1,
                is_active=random.random() < 0.92,
                views_count=random.randint(0, 500),
            )
            vacancies_created += 1

        # ─── Applications ─────────────────────
        all_vacancies = list(Vacancy.objects.filter(is_active=True))
        n_apps = opts["applications"]
        apps_created = 0
        statuses = list(Application.Status.values)

        if all_vacancies and resumes:
            for _ in range(n_apps):
                resume = random.choice(resumes)
                vacancy = random.choice(all_vacancies)
                # Avoid duplicates
                if Application.objects.filter(
                    vacancy=vacancy, resume=resume,
                    direction=Application.Direction.APPLIED,
                ).exists():
                    continue
                Application.objects.create(
                    vacancy=vacancy,
                    resume=resume,
                    direction=Application.Direction.APPLIED,
                    status=random.choice(statuses),
                    cover_letter=random.choice([
                        "",
                        "Sizning vakansiyangizga juda qiziqdim, tajribam mos.",
                        "Ushbu lavozim mening karyerada o'sishimga yordam beradi.",
                    ]),
                )
                apps_created += 1

        # ─── Likes (random) ─────────────────────
        likes_created = 0
        for seeker in random.sample(seekers, min(20, len(seekers))):
            for vac in random.sample(all_vacancies, min(random.randint(1, 5), len(all_vacancies))):
                _, created = VacancyLike.objects.get_or_create(user=seeker, vacancy=vac)
                if created:
                    likes_created += 1

        self.stdout.write(self.style.SUCCESS(
            f"Tayyor!\n"
            f"  Hududlar: {len(regions)} | Tumanlar: {District.objects.count()}\n"
            f"  Kasblar: {len(professions)} | Ko'nikmalar: {len(skills_objs)} | Sohalar: {len(industries)}\n"
            f"  Universitetlar: {University.objects.count()} | Yo'nalishlar: {len(all_directions)}\n"
            f"  Tashkilotlar: {len(orgs)} | Employer'lar: {len(employers)}\n"
            f"  Job seeker'lar: {len(seekers)} | Rezyumelar: {len(resumes)}\n"
            f"  Vakansiyalar (yangi): {vacancies_created}\n"
            f"  Arizalar (yangi): {apps_created} | Like'lar: {likes_created}"
        ))
