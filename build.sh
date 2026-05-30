#!/usr/bin/env bash
#
# Render.com build skripti — har deploy paytida bajariladi.
#
# Vazifalari:
#   1) Pip va paketlarni yangilash
#   2) Frontend uchun static fayllarni yig'ish (collectstatic)
#   3) Ma'lumotlar bazasi migratsiyalarini ishga tushirish
#
# Render avtomatik tarzda PYTHON_VERSION va PIP_VERSION o'rnatadi.
# .python-version yoki runtime.txt fayli orqali Python versiyasini belgilash mumkin.

set -o errexit   # har qanday xato bo'lsa, skript to'xtaydi
set -o pipefail
set -o nounset

echo "──────────────────────────────────────"
echo " 1/3  Pip paketlarini o'rnatish..."
echo "──────────────────────────────────────"
python -m pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "──────────────────────────────────────"
echo " 2/3  Static fayllarni yig'ish..."
echo "──────────────────────────────────────"
cd config
python manage.py collectstatic --no-input --clear

echo ""
echo "──────────────────────────────────────"
echo " 3/3  Ma'lumotlar bazasi migratsiyalari..."
echo "──────────────────────────────────────"
python manage.py migrate --no-input

# ────────────────────────────────────────────────────────────────
# Referens ma'lumotlar tarjimasi (viloyat, soha, kasb, tuman) — STATIK
# lug'at orqali, Gemini API'ga bog'liq EMAS. Har doim ishga tushadi,
# idempotent (faqat bo'sh maydonlarni to'ldiradi).
# ────────────────────────────────────────────────────────────────
echo ""
echo "Referens tarjimalari (statik lug'at)..."
python manage.py seed_translations || echo "Tarjima o'tkazib yuborildi (davom etiladi)"

# ────────────────────────────────────────────────────────────────
# Bootstrap admin foydalanuvchi yaratish (faqat env vars berilgan bo'lsa)
# Render free tier'da Shell yo'q, shuning uchun admin avtomatik yaratiladi.
# Birinchi deploy'da yangi admin yaratiladi, keyingilarida `--update`
# bilan parol/email yangilanadi (idempotent).
# ────────────────────────────────────────────────────────────────
if [ -n "${BOOTSTRAP_ADMIN_PHONE:-}" ] && \
   [ -n "${BOOTSTRAP_ADMIN_EMAIL:-}" ] && \
   [ -n "${BOOTSTRAP_ADMIN_PASSWORD:-}" ]; then
  echo ""
  echo "──────────────────────────────────────"
  echo " 4/5  Bootstrap admin yaratish..."
  echo "──────────────────────────────────────"
  python manage.py bootstrap_admin \
      --phone "$BOOTSTRAP_ADMIN_PHONE" \
      --email "$BOOTSTRAP_ADMIN_EMAIL" \
      --password "$BOOTSTRAP_ADMIN_PASSWORD" \
      --update || echo "Admin yaratishda xato (davom etiladi)"
fi

# ────────────────────────────────────────────────────────────────
# Demo ma'lumotlar (SEED_DEMO=True bo'lsa)
# Idempotent — yetarli ma'lumot bor bo'lsa, qaytadan yaratmaydi.
# Diplom himoyasi uchun real ko'rinishdagi vakansiya/rezyumelar.
# ────────────────────────────────────────────────────────────────
if [ "${SEED_DEMO:-False}" = "True" ] || [ "${SEED_DEMO:-False}" = "true" ]; then
  echo ""
  echo "──────────────────────────────────────"
  echo " 5/5  Demo ma'lumotlar yaratish..."
  echo "──────────────────────────────────────"
  python manage.py seed_demo \
      --vacancies "${SEED_DEMO_VACANCIES:-40}" \
      --seekers "${SEED_DEMO_SEEKERS:-30}" \
      --employers "${SEED_DEMO_EMPLOYERS:-8}" \
      --applications "${SEED_DEMO_APPLICATIONS:-60}" \
      --idempotent || echo "Demo yaratishda xato (davom etiladi)"
fi

# ────────────────────────────────────────────────────────────────
# AI tarjima — referens ma'lumotlar (kasb, soha, viloyat, tuman) ni
# ru va qaa tillariga Gemini orqali tarjima qilish.
#
# YOQISH: Render env vars'da TRANSLATE_ON_BUILD=True qo'ying.
#
# Idempotent — faqat bo'sh (name_ru / name_qaa) maydonlar tarjima qilinadi.
# --limit bilan har deploy'da bir qism tarjima qilinadi (Gemini bepul tier
# limiti va Render build timeout'idan oshmaslik uchun). Hammasi to'lguncha
# bir necha marta "Manual Deploy" qiling, keyin TRANSLATE_ON_BUILD=False qo'ying.
# ────────────────────────────────────────────────────────────────
if [ "${TRANSLATE_ON_BUILD:-False}" = "True" ] || [ "${TRANSLATE_ON_BUILD:-False}" = "true" ]; then
  echo ""
  echo "──────────────────────────────────────"
  echo " AI tarjima (referens ma'lumotlar)..."
  echo "──────────────────────────────────────"
  python manage.py translate_existing \
      --only reference \
      --limit "${TRANSLATE_LIMIT:-40}" \
      || echo "Tarjima qisman bajarildi yoki o'tkazib yuborildi (davom etiladi)"
fi

echo ""
echo "Build muvaffaqiyatli yakunlandi."
