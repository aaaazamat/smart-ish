"""
AI servislar — Google Gemini API bilan integratsiya.

GEMINI_API_KEY .env faylida sozlanishi kerak.
Bepul kalit: https://aistudio.google.com/apikey
"""
import json
import logging
import urllib.request
import urllib.error

from django.conf import settings

logger = logging.getLogger(__name__)

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/gemini-2.5-flash:generateContent"
)


class AIServiceError(Exception):
    """AI servisidan xato"""


def _call_gemini(
    prompt: str = None,
    *,
    contents: list = None,
    system_instruction: str = None,
    temperature: float = 0.7,
    max_tokens: int = 1500,
    response_mime_type: str = None,
) -> str:
    api_key = getattr(settings, "GEMINI_API_KEY", "")
    if not api_key:
        raise AIServiceError(
            "GEMINI_API_KEY .env faylida sozlanmagan. "
            "Iltimos, https://aistudio.google.com/apikey dan kalit oling."
        )

    if contents is None:
        contents = [{"parts": [{"text": prompt}]}]

    generation_config = {
        "temperature": temperature,
        "maxOutputTokens": max_tokens,
        # Gemini 2.5 "thinking" rejimini o'chirish — token'larni tejash uchun
        "thinkingConfig": {"thinkingBudget": 0},
    }
    if response_mime_type:
        generation_config["responseMimeType"] = response_mime_type

    payload = {
        "contents": contents,
        "generationConfig": generation_config,
    }
    if system_instruction:
        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

    data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(
        f"{GEMINI_URL}?key={api_key}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            body = response.read()
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        logger.error("Gemini HTTP %s: %s", e.code, body)
        if e.code == 429:
            raise AIServiceError("AI servisi band, biroz kutib yana urinib ko'ring")
        raise AIServiceError(f"AI xatosi (HTTP {e.code})")
    except urllib.error.URLError as e:
        logger.error("Gemini network error: %s", e)
        raise AIServiceError("AI servisiga ulanib bo'lmadi")

    try:
        result = json.loads(body)
        return result["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        logger.error("Gemini parse error: %s, body=%s", e, body[:500])
        raise AIServiceError("AI javobini tushunib bo'lmadi")


def generate_vacancy_description(profession: str, industry: str = "", keywords: str = "") -> str:
    """Vakansiya tavsifini AI yordamida yaratish."""
    prompt = f"""Sen professional HR mutaxassisi va ish e'lonlari yozuvchisisan.

Quyidagi vakansiya uchun professional, jozibador va aniq tavsif yoz (FAQAT O'ZBEK TILIDA, lotin alifbosida).

Lavozim: {profession}
{f'Soha: {industry}' if industry else ''}
Qo'shimcha kalit so'zlar: {keywords or "yo'q"}

Tuzilish (har bir qism alohida paragraf yoki ro'yxat):

1. **Lavozim haqida** — 2-3 jumla, lavozim mohiyati va kompaniyaga foydasi
2. **Asosiy vazifalar** — 4-6 ta bullet (har biri "- " bilan boshlansin)
3. **Talablar** — 3-5 ta bullet
4. **Biz taklif qilamiz** — 3-5 ta bullet (maosh oraligi, sharoit, imtiyozlar)

Qoidalar:
- FAQAT lotin alifbosida o'zbek tilida yoz
- Professional, do'stona, motivatsion ohang
- 250-400 so'z
- Markdown formati: bullet'lar uchun "- ", sarlavhalar uchun "**Sarlavha**"
- Hech qanday kirish yoki yakuniy izoh qo'shma — to'g'ridan-to'g'ri tavsif boshlansin
- Aniq raqamlarsiz yoz (maosh, yosh va h.k. — chunki ish beruvchi alohida belgilaydi)
"""
    return _call_gemini(prompt=prompt, temperature=0.8, max_tokens=1500)


# ─── Chatbot ──────────────────────────────────

CHAT_SYSTEM_PROMPT = """Sen "OSON ISH" platformasi uchun do'stona AI yordamchisan.

OSON ISH — O'zbekistonda ish izlash va ish beruvchilarni nomzodlar bilan bog'laydigan veb-platforma.

Sayt funksiyalari:
- Vakansiyalarni qidirish va saqlash (Job Seeker)
- Rezyume yaratish va boshqarish (Job Seeker)
- Vakansiyaga ariza yuborish va kuzatish (Job Seeker)
- Vakansiya yaratish va boshqarish (Employer)
- Kelgan arizalarni ko'rib chiqish (Employer)
- Rezyumelarni qidirish va taklif yuborish (Employer)

Yordam beradigan mavzular:
1. Sayt funksiyalaridan qanday foydalanish
2. Rezyume yozish va yaxshilash bo'yicha maslahatlar
3. Vakansiya tavsifini qanday yozish (Employer'lar uchun)
4. Suhbatga tayyorgarlik
5. O'zbek bozorida ishga oid umumiy savollar
6. Karyera maslahatlari

QOIDALAR:
- FAQAT o'zbek tilida (lotin alifbosida) javob ber
- Qisqa va aniq — 2-5 jumla yoki bullet'lar (juda uzaytirma)
- Do'stona, professional ohang
- Markdown ishlat: bullet uchun "- ", muhim so'z uchun **qalin**
- Agar savol noaniq bo'lsa, aniqlashtir
- Agar savol mavzudan tashqari bo'lsa (siyosat, tibbiyot, va h.k.), muloyim ravishda bu mavzu bilan yordam berolmasligingni ayt
"""


def chat(messages: list, user_role: str = "guest") -> str:
    """
    AI chatbot bilan suhbat.

    messages: [{role: "user"|"assistant", content: "..."}]
    user_role: "guest" | "job_seeker" | "employer" | "admin"
    """
    role_context = {
        "guest": "Foydalanuvchi tizimga kirmagan (mehmon).",
        "job_seeker": "Foydalanuvchi — ish izlovchi.",
        "employer": "Foydalanuvchi — ish beruvchi.",
        "admin": "Foydalanuvchi — administrator.",
    }.get(user_role, "Foydalanuvchi roli noma'lum.")

    system = f"{CHAT_SYSTEM_PROMPT}\n\nKontekst: {role_context}"

    contents = []
    for msg in messages[-20:]:  # oxirgi 20 ta xabar
        role = msg.get("role", "user")
        content = (msg.get("content") or "").strip()
        if not content:
            continue
        gemini_role = "user" if role == "user" else "model"
        contents.append({
            "role": gemini_role,
            "parts": [{"text": content}],
        })

    if not contents:
        raise AIServiceError("Xabarlar bo'sh")

    return _call_gemini(
        contents=contents,
        system_instruction=system,
        temperature=0.7,
        max_tokens=600,
    )


# ─── Smart Matching ───────────────────────────

def calculate_match(resume, vacancy) -> dict:
    """
    Rezyume va vakansiya orasidagi mos kelish darajasini AI orqali baholash.

    resume, vacancy — ORM obyektlari.
    Returns: {score: int, matched: [str], missing: [str], summary: str}
    """
    resume_skills = list(resume.skills.values_list("name", flat=True))
    resume_experiences = []
    for we in resume.work_experiences.all()[:5]:
        resume_experiences.append(f"{we.position} @ {we.organization_name} ({we.start_year}-{we.end_year or 'hozir'})")

    resume_text = f"""
- Kasb: {resume.profession.name if resume.profession else "ko'rsatilmagan"}
- Karyera darajasi: {resume.get_career_level_display()}
- Ish istagi: {resume.get_employment_type_display()} / {resume.get_work_mode_display()}
- Kutilayotgan maosh: {resume.expected_salary or "ko'rsatilmagan"}
- Hudud: {resume.region.name if resume.region else "ko'rsatilmagan"}
- Ko'nikmalar: {', '.join(resume_skills) or "ko'rsatilmagan"}
- Ish tajribasi: {'; '.join(resume_experiences) or "ko'rsatilmagan"}
- Yosh: {(2026 - resume.birth_date.year) if resume.birth_date else "?"}
""".strip()

    vacancy_text = f"""
- Lavozim: {vacancy.profession.name if vacancy.profession else "ko'rsatilmagan"}
- Soha: {vacancy.industry.name if vacancy.industry else "ko'rsatilmagan"}
- Tajriba talabi: {vacancy.get_experience_required_display()}
- Ta'lim darajasi: {vacancy.get_education_level_display()}
- Bandlik turi: {vacancy.get_employment_type_display()} / {vacancy.get_work_mode_display()}
- Maosh: {vacancy.salary_from or "?"} - {vacancy.salary_to or "?"} so'm
- Hudud: {vacancy.region.name if vacancy.region else "ko'rsatilmagan"}
- Tavsif: {(vacancy.description or "yo'q")[:600]}
""".strip()

    prompt = f"""Sen tajribali HR mutaxassisisan. Quyidagi rezyume va vakansiya bir-biriga qanchalik mos kelishini baholashing kerak.

REZYUME:
{resume_text}

VAKANSIYA:
{vacancy_text}

Quyidagi JSON formatida javob qaytar (faqat JSON, boshqa hech narsa, markdown ham emas):
{{
  "score": <0 dan 100 gacha butun son — qanchalik mos>,
  "matched": ["3-5 ta mos keluvchi kuchli tomon"],
  "missing": ["1-3 ta yetishmayotgan yoki nomos narsa, agar bor bo'lsa"],
  "summary": "1-2 jumla qisqa xulosa (o'zbek tilida)"
}}

Baholash mezonlari:
- Kasb va lavozim mosligi (eng muhim)
- Ko'nikmalar mosligi
- Tajriba darajasi mosligi
- Maosh kutishi
- Hudud mosligi
- Bandlik turi mosligi"""

    raw = _call_gemini(
        prompt=prompt,
        temperature=0.3,
        max_tokens=2000,
        response_mime_type="application/json",
    )

    # Try direct parse first
    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        # Strip markdown fences if any
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text
            if text.endswith("```"):
                text = text.rsplit("```", 1)[0]
            text = text.strip()
        if text.startswith("json"):
            text = text[4:].strip()
        # Last resort: extract first {...} block via regex
        try:
            result = json.loads(text)
        except json.JSONDecodeError:
            import re
            m = re.search(r"\{.*\}", text, re.DOTALL)
            if m:
                try:
                    result = json.loads(m.group(0))
                except json.JSONDecodeError:
                    logger.error("Match parse error, raw=%s", raw[:500])
                    raise AIServiceError("AI javobini tushunib bo'lmadi")
            else:
                logger.error("Match parse error, raw=%s", raw[:500])
                raise AIServiceError("AI javobini tushunib bo'lmadi")

    return {
        "score": int(result.get("score", 0)),
        "matched": result.get("matched", []) or [],
        "missing": result.get("missing", []) or [],
        "summary": result.get("summary", ""),
    }
