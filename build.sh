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
  echo " 4/4  Bootstrap admin yaratish..."
  echo "──────────────────────────────────────"
  python manage.py bootstrap_admin \
      --phone "$BOOTSTRAP_ADMIN_PHONE" \
      --email "$BOOTSTRAP_ADMIN_EMAIL" \
      --password "$BOOTSTRAP_ADMIN_PASSWORD" \
      --update || echo "Admin yaratishda xato (davom etiladi)"
fi

echo ""
echo "Build muvaffaqiyatli yakunlandi."
