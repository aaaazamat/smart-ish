"""AI tarjima servisi — Gemini bilan ko'p tilli matnlarni tarjima qiladi.

Foydalanish:
    from main_project_app.translation_service import translate_text, translate_to_all

    translate_text("Dasturchi", "ru")          # -> "Программист"
    translate_text("Dasturchi", "qaa")         # -> "Programmist"
    translate_to_all("Dasturchi", "uz")        # -> {"uz": ..., "ru": ..., "qaa": ...}

Cache: 30 kun (SHA-1 kalit bilan, Gemini API quota'ni tejash uchun).
Retry: rate-limit (429) bo'lsa, eksponensial backoff bilan 3 marta urinadi.
Fallback: AI xato bersa, asl matn qaytariladi (logger.warning).
"""
import hashlib
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

from django.conf import settings
from django.core.cache import cache

from .ai_services import _call_gemini, AIServiceError

logger = logging.getLogger(__name__)


def _translate_keys() -> list:
    """Tarjima uchun kalitlar ro'yxati (failover uchun).

    GEMINI_API_KEY_TRANSLATE — ro'yxat (Csv) yoki string bo'lishi mumkin.
    Bo'sh bo'lsa, asosiy GEMINI_API_KEY ga qaytadi.
    """
    keys = getattr(settings, "GEMINI_API_KEY_TRANSLATE", []) or []
    if isinstance(keys, str):
        keys = [keys]
    keys = [k.strip() for k in keys if k and k.strip()]
    if not keys:
        main = getattr(settings, "GEMINI_API_KEY", "")
        if main:
            keys = [main]
    return keys

# Til kodlarining inson o'qiy oladigan nomlari (Gemini prompt'iga uzatiladi)
LANG_NAMES = {
    "uz": "lotin alifbosida o'zbek tili",
    "ru": "rus tili",
    "qaa": "lotin alifbosida qoraqalpoq tili (Qaraqalpaqsha)",
}

# Cache TTL — 30 kun (Gemini API tejash uchun yetarli)
CACHE_TTL = 60 * 60 * 24 * 30

# Cache kalit prefiksi — agar prompt o'zgartirilsa, "v2" ga ko'tarish kerak
CACHE_VERSION = "v1"


def _cache_key(text: str, target: str, source: str) -> str:
    """SHA-1 hash asosida unique cache kalit yaratish."""
    raw = f"{CACHE_VERSION}|{source}|{target}|{text}".encode("utf-8")
    return f"ai_tr:{hashlib.sha1(raw).hexdigest()[:20]}"


# Shu jarayonda kunlik limitga yetgan (429) kalitlar — keyingi chaqiruvlar
# ularni o'tkazib yuboradi (behuda so'rov yubormaslik uchun).
_exhausted_keys = set()


def _is_rate_limit(err) -> bool:
    msg = str(err).lower()
    return any(s in msg for s in ("band", "429", "rate", "quota"))


def translate_text(text: str, target_lang: str, source_lang: str = "uz") -> str:
    """Yagona matnni Gemini bilan tarjima qilish (ko'p kalitli failover bilan).

    - target_lang == source_lang bo'lsa, asl matn qaytariladi
    - Bo'sh matn → bo'sh string
    - Cache hit → API chaqirilmaydi
    - Bir kalit kunlik limitga yetsa (429), avtomatik keyingi kalitga o'tadi
    - Hamma kalit tugasa → asl matn (logger.warning)
    """
    text = (text or "").strip()
    if not text:
        return ""
    if target_lang == source_lang:
        return text

    key = _cache_key(text, target_lang, source_lang)
    cached = cache.get(key)
    if cached is not None:
        return cached

    target_name = LANG_NAMES.get(target_lang, target_lang)
    source_name = LANG_NAMES.get(source_lang, source_lang)

    prompt = (
        f"Sen professional tarjimonisan. Quyidagi matnni {source_name}'dan "
        f"{target_name}'ga tarjima qil.\n\n"
        f"QOIDALAR:\n"
        f"- FAQAT tarjima matnini qaytar — hech qanday izoh, kirish so'zi yoki markdown qo'shma\n"
        f"- Qo'shtirnoq qo'shma\n"
        f"- Manba matnining formati (HTML, ro'yxat, raqamlar) saqlansin\n"
        f"- Ism, brend, kasb nomlarini iloji boricha mahalliylashtir\n\n"
        f"Matn:\n{text}"
    )

    model = getattr(settings, "GEMINI_TRANSLATE_MODEL", None)
    all_keys = _translate_keys()
    # Faqat tugamagan kalitlar. Hammasi tugagan bo'lsa — bo'sh ro'yxat,
    # darhol fallback (behuda so'rov yubormaymiz; bu jarayonda quota tugagan).
    keys = [k for k in all_keys if k not in _exhausted_keys]
    if not keys:
        logger.debug("Barcha tarjima kalitlari tugagan — fallback (asl matn)")
        return text

    last_error = None
    for api_key in keys:
        try:
            result = _call_gemini(
                prompt=prompt,
                temperature=0.2,
                max_tokens=2000,
                api_key=api_key,
                model=model,
            ).strip()

            # Gemini ba'zan qo'shtirnoq bilan o'rab beradi — olib tashlash
            if len(result) >= 2 and result[0] == result[-1] and result[0] in ('"', "'", "«"):
                result = result[1:-1].strip()

            if result:
                cache.set(key, result, CACHE_TTL)
                logger.debug("Translate %s→%s: %r → %r", source_lang, target_lang, text[:40], result[:40])
                return result
            return text  # bo'sh natija — asl matn

        except AIServiceError as e:
            last_error = e
            if _is_rate_limit(e):
                # Bu kalit tugadi — belgilab, keyingi kalitga o'tamiz
                _exhausted_keys.add(api_key)
                logger.info("Kalit limiti tugadi (...%s), keyingi kalitga o'tilmoqda",
                            api_key[-6:] if api_key else "?")
                continue
            break  # boshqa xato — fallback
        except Exception as e:
            logger.exception("Unexpected translate error: %s", e)
            return text

    logger.warning("Translate failed — barcha kalitlar tugadi (%s→%s, len=%d): %s",
                   source_lang, target_lang, len(text), last_error)
    return text  # fallback: asl matn


def translate_to_all(text: str, source_lang: str = "uz") -> dict:
    """Bir matnni qolgan 2 tilga parallel tarjima qilish.

    Returns:
        {"uz": "...", "ru": "...", "qaa": "..."} formatida dict.
    """
    text = (text or "").strip()
    if not text:
        return {"uz": "", "ru": "", "qaa": ""}

    targets = [l for l in ("uz", "ru", "qaa") if l != source_lang]
    out = {source_lang: text}

    with ThreadPoolExecutor(max_workers=2) as ex:
        futures = {ex.submit(translate_text, text, t, source_lang): t for t in targets}
        for fut in as_completed(futures):
            out[futures[fut]] = fut.result()

    return out


def translate_batch(texts: list, target_lang: str, source_lang: str = "uz",
                    max_workers: int = 4) -> list:
    """Ko'p matnlarni parallel tarjima qilish.

    Args:
        texts: tarjima qilinadigan matnlar ro'yxati
        target_lang: maqsad til ("uz" / "ru" / "qaa")
        source_lang: manba til (default "uz")
        max_workers: bir vaqtda nechta Gemini chaqirilishi (default 4)

    Returns:
        Tarjima qilingan matnlar ro'yxati (kirish bilan bir xil tartibda).
    """
    if not texts:
        return []
    if target_lang == source_lang:
        return list(texts)

    results = [""] * len(texts)
    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        futures = {
            ex.submit(translate_text, t, target_lang, source_lang): i
            for i, t in enumerate(texts)
        }
        for fut in as_completed(futures):
            idx = futures[fut]
            results[idx] = fut.result()

    return results
