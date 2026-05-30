"""Algoritmik (AI'siz) rezyume ↔ vakansiya mosligini hisoblash.

Gemini'ga bog'liq EMAS — tez, bepul, ishonchli. Aniq mezonlar bo'yicha
0-100 ball beradi. Gibrid tizimda: avval shu skoring barcha nomzodlarni
saralaydi, keyin faqat eng yaxshilari AI bilan chuqur tahlil qilinadi.

Asosiy funksiya: algorithmic_match(resume, vacancy) -> dict
"""
from datetime import date


# ── Vazn taqsimoti (jami 100) ──────────────────────────────
W_PROFESSION = 35   # kasb mosligi — eng muhim
W_EXPERIENCE = 20   # tajriba / karyera darajasi
W_LANGUAGE = 15     # til talablari
W_SALARY = 15       # maosh kutilishi
W_REGION = 10       # hudud
W_EMPLOYMENT = 5    # bandlik turi + ish rejimi

# Til darajalari tartibi (taqqoslash uchun)
LANG_LEVELS = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}

# experience_required → minimal yil
EXP_MIN_YEARS = {
    "no_req": 0,
    "lt_1": 0,
    "1_3": 1,
    "3_5": 3,
    "gt_5": 5,
}

# career_level → taxminiy tajriba yili (maslahat sifatida)
CAREER_YEARS = {
    "beginner": 0,
    "fresh_graduate": 0,
    "junior": 1,
    "middle": 3,
    "experienced": 6,
}


def _resume_total_experience_years(resume) -> float:
    """Rezyumedagi ish tajribalaridan umumiy yillarni hisoblaydi."""
    total = 0.0
    this_year = date.today().year
    for we in resume.work_experiences.all():
        start = we.start_year or this_year
        end = this_year if we.is_current else (we.end_year or start)
        total += max(0, end - start)
    if total == 0:
        # Tajriba yozilmagan bo'lsa, karyera darajasidan taxmin
        total = CAREER_YEARS.get(resume.career_level, 0)
    return total


def _score_profession(resume, vacancy):
    if not vacancy.profession_id:
        return W_PROFESSION, None, None  # talab yo'q — to'liq
    if resume.profession_id == vacancy.profession_id:
        name = vacancy.profession.name if vacancy.profession else "kasb"
        return W_PROFESSION, f"Kasb to'liq mos: {name}", None
    # Kasb mos emas — lekin soha yaqin bo'lishi mumkin (qisman ball yo'q, aniq mezon)
    return 0, None, "Kasb mos kelmaydi"


def _score_experience(resume, vacancy):
    need = EXP_MIN_YEARS.get(vacancy.experience_required, 0)
    have = _resume_total_experience_years(resume)
    if need == 0:
        return W_EXPERIENCE, "Tajriba talab etilmaydi", None
    if have >= need:
        return W_EXPERIENCE, f"Tajriba yetarli: ~{have:.0f} yil", None
    # Qisman: bor tajribaning talabga nisbati
    ratio = have / need if need else 1
    pts = round(W_EXPERIENCE * ratio, 1)
    return pts, None, f"Tajriba kamroq: ~{have:.0f}/{need} yil"


def _score_language(resume, vacancy):
    reqs = list(vacancy.language_requirements.all())
    if not reqs:
        return W_LANGUAGE, None, None  # til talabi yo'q — to'liq
    resume_langs = {rl.language: LANG_LEVELS.get(rl.level, 0)
                    for rl in resume.languages.all()}
    met = 0
    missing_langs = []
    for req in reqs:
        need_level = LANG_LEVELS.get(req.min_level, 0)
        have_level = resume_langs.get(req.language, 0)
        if have_level >= need_level:
            met += 1
        else:
            missing_langs.append(req.get_language_display())
    ratio = met / len(reqs)
    pts = round(W_LANGUAGE * ratio, 1)
    matched = f"Til talablari mos ({met}/{len(reqs)})" if met else None
    missing = f"Til yetishmaydi: {', '.join(missing_langs)}" if missing_langs else None
    return pts, matched, missing


def _score_salary(resume, vacancy):
    exp = resume.expected_salary
    s_to = vacancy.salary_to
    s_from = vacancy.salary_from
    if not exp or not (s_from or s_to):
        return W_SALARY, None, None  # ma'lumot yetarli emas — neytral (to'liq)
    top = s_to or s_from
    if exp <= top:
        return W_SALARY, "Maosh kutilishi mos", None
    # Kutilgan maosh vakansiyadan yuqori — qanchalik oshgani
    overflow = (exp - top) / top
    if overflow <= 0.2:
        return round(W_SALARY * 0.6, 1), None, "Maosh kutilishi biroz yuqori"
    return 0, None, "Maosh kutilishi ancha yuqori"


def _score_region(resume, vacancy):
    # Masofaviy ish — hudud muhim emas
    if vacancy.work_mode == "remote":
        return W_REGION, "Masofaviy — hudud muhim emas", None
    if not vacancy.region_id or not resume.region_id:
        return W_REGION, None, None
    if resume.region_id == vacancy.region_id:
        name = vacancy.region.name if vacancy.region else "hudud"
        return W_REGION, f"Hudud mos: {name}", None
    return 0, None, "Hudud mos kelmaydi"


def _score_employment(resume, vacancy):
    pts = 0
    if resume.employment_type == vacancy.employment_type:
        pts += W_EMPLOYMENT / 2
    if resume.work_mode == vacancy.work_mode:
        pts += W_EMPLOYMENT / 2
    return round(pts, 1), None, None


def algorithmic_match(resume, vacancy) -> dict:
    """Rezyume va vakansiya mosligini AI'siz hisoblaydi.

    Returns:
        {
          "score": int (0-100),
          "matched": [str],   # mos tomonlar
          "missing": [str],   # yetishmayotgan tomonlar
          "breakdown": {component: points},
        }
    """
    parts = {
        "profession": _score_profession(resume, vacancy),
        "experience": _score_experience(resume, vacancy),
        "language": _score_language(resume, vacancy),
        "salary": _score_salary(resume, vacancy),
        "region": _score_region(resume, vacancy),
        "employment": _score_employment(resume, vacancy),
    }

    total = 0.0
    matched = []
    missing = []
    breakdown = {}
    for key, (pts, m, miss) in parts.items():
        total += pts
        breakdown[key] = round(pts, 1)
        if m:
            matched.append(m)
        if miss:
            missing.append(miss)

    return {
        "score": int(round(total)),
        "matched": matched,
        "missing": missing,
        "breakdown": breakdown,
    }
