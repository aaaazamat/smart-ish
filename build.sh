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

echo ""
echo "Build muvaffaqiyatli yakunlandi."
