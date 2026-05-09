import random

from django.core.management.base import BaseCommand
from django.db import transaction

from main_project_app.models import (
    User, Organization, Region, District, Profession, Industry, Skill,
    University, UniversityDirection, Vacancy,
)


REGIONS = {
    "Toshkent shahri": ["Mirobod", "Yunusobod", "Chilonzor", "Yakkasaroy", "Olmazor"],
    "Toshkent viloyati": ["Bekobod", "Yangiyo'l", "Zangiota", "Chinoz"],
    "Andijon": ["Andijon shahri", "Asaka", "Xonobod"],
    "Samarqand": ["Samarqand shahri", "Kattaqo'rg'on", "Urgut"],
    "Buxoro": ["Buxoro shahri", "Kogon", "G'ijduvon"],
    "Farg'ona": ["Farg'ona shahri", "Marg'ilon", "Quva"],
}

PROFESSIONS = [
    "Buxgalter", "Buxgalter-ekspert", "IT-mutaxassis", "Frontend Developer",
    "Backend Developer", "Sotuvchi-konsultant", "Menejer", "Loyiha menejeri",
    "Hisobchi", "Marketolog", "Dizayner", "HR mutaxassisi",
    "Yuridik maslahatchi", "Quruvchi", "Haydovchi", "Oshpaz",
]

INDUSTRIES = [
    "IT va Aloqa", "Moliya va Bank", "Qurilish", "Savdo",
    "Ta'lim", "Sog'liqni saqlash", "Logistika", "Ishlab chiqarish",
]

SKILLS = [
    # IT
    "Python", "JavaScript", "TypeScript", "React", "Vue.js", "Angular",
    "Node.js", "Django", "FastAPI", "PostgreSQL", "MySQL", "MongoDB",
    "Git", "Docker", "Linux", "REST API", "GraphQL", "AWS",
    # General
    "Microsoft Office", "Excel", "Word", "1C buxgalteriya",
    # Tillar
    "Ingliz tili", "Rus tili", "O'zbek tili", "Turk tili",
    # Soft skills
    "Jamoa bo'lib ishlash", "Liderlik", "Muloqot ko'nikmalari",
    "Vaqtni boshqarish", "Tahliliy fikrlash", "Muammolarni hal qilish",
    # Sotuv / Marketing
    "Sotuv", "B2B sotuv", "Marketing", "SMM", "SEO", "Reklama",
    # Buxgalteriya
    "Buxgalteriya hisoblari", "Soliqlar", "Bank operatsiyalari",
    # Dizayn
    "Photoshop", "Illustrator", "Figma", "UX/UI",
    # Boshqaruv
    "Loyiha boshqaruvi", "Agile/Scrum", "Personal boshqaruvi",
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
]


class Command(BaseCommand):
    help = "Frontend test uchun demo ma'lumotlar yaratadi (regions, professions, vakansiyalar)."

    def add_arguments(self, parser):
        parser.add_argument("--vacancies", type=int, default=20,
                            help="Nechta vakansiya yaratish (default: 20)")

    @transaction.atomic
    def handle(self, *args, **opts):
        self.stdout.write("Demo ma'lumotlar yaratilmoqda...")

        # Regions + Districts
        regions = {}
        for r_name, d_names in REGIONS.items():
            region, _ = Region.objects.get_or_create(name=r_name)
            regions[r_name] = region
            for d_name in d_names:
                District.objects.get_or_create(region=region, name=d_name)

        # Professions
        professions = []
        for name in PROFESSIONS:
            p, _ = Profession.objects.get_or_create(name=name)
            professions.append(p)

        # Industries
        industries = []
        for name in INDUSTRIES:
            i, _ = Industry.objects.get_or_create(name=name)
            industries.append(i)

        # Skills
        skills_count = 0
        for name in SKILLS:
            _, created = Skill.objects.get_or_create(name=name)
            if created:
                skills_count += 1

        # Universities + Directions
        univ_count = 0
        dir_count = 0
        for u_name, directions in UNIVERSITIES.items():
            univ, created = University.objects.get_or_create(name=u_name)
            if created:
                univ_count += 1
            for d_name in directions:
                _, c = UniversityDirection.objects.get_or_create(university=univ, name=d_name)
                if c:
                    dir_count += 1

        # Employer user
        employer, created = User.objects.get_or_create(
            phone_number="+998900000001",
            defaults={
                "email": "demo_employer@example.com",
                "role": User.Role.EMPLOYER,
                "is_active": True,
            },
        )
        if created:
            employer.set_password("demo12345")
            employer.save()

        # Organizations
        orgs = []
        for name in ORG_NAMES:
            org, _ = Organization.objects.get_or_create(name=name)
            orgs.append(org)

        if not employer.organization:
            employer.organization = orgs[0]
            employer.save()

        # Vacancies
        n = opts["vacancies"]
        created_count = 0
        all_districts = list(District.objects.select_related("region").all())

        for _ in range(n):
            district = random.choice(all_districts)
            salary_from = random.choice([2_000_000, 3_000_000, 5_000_000, 6_000_000, 8_000_000])
            salary_to = salary_from + random.choice([2_000_000, 5_000_000, 10_000_000, 20_000_000])

            Vacancy.objects.create(
                employer=employer,
                organization=random.choice(orgs),
                profession=random.choice(professions),
                industry=random.choice(industries),
                description="Bu demo vakansiya. Real ma'lumot keyin qo'shiladi.",
                region=district.region,
                district=district,
                payment_type=Vacancy.PaymentType.MONTHLY,
                salary_from=salary_from,
                salary_to=salary_to,
                experience_required=random.choice([
                    Vacancy.ExperienceRequired.NO_REQUIREMENT,
                    Vacancy.ExperienceRequired.LESS_THAN_1,
                    Vacancy.ExperienceRequired.ONE_TO_THREE,
                    Vacancy.ExperienceRequired.THREE_TO_FIVE,
                ]),
                employment_type=Vacancy.EmploymentType.PERMANENT,
                work_mode=random.choice([
                    Vacancy.WorkMode.OFFICE,
                    Vacancy.WorkMode.REMOTE,
                    Vacancy.WorkMode.HYBRID,
                ]),
                work_schedule=Vacancy.WorkSchedule.FIVE_TWO,
                is_active=True,
            )
            created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"OK Tayyor: {len(regions)} viloyat, {len(professions)} kasb, "
            f"{skills_count} ta yangi ko'nikma, "
            f"{univ_count} ta universitet, {dir_count} ta yo'nalish, "
            f"{len(orgs)} tashkilot, {created_count} ta vakansiya yaratildi."
        ))
