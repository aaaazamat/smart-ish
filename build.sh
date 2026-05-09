#!/usr/bin/env bash
# Render.com build script
# Bu skript har deploy'da ishga tushadi

set -o errexit

# Bog'liqliklarni o'rnatish
pip install -r requirements.txt

# Static fayllarni yig'ish (whitenoise uchun)
cd config
python manage.py collectstatic --noinput

# Migratsiyalarni qo'llash
python manage.py migrate
