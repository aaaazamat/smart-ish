"""
Django settings for config project.

Konfiguratsiya .env fayli orqali boshqariladi (python-decouple).
.env.example dan nusxa olib, .env yarating.
"""
import os
from pathlib import Path
from datetime import timedelta

from decouple import Csv, config
import dj_database_url
from django.utils.translation import gettext_lazy as _

# BASE_DIR — `config/` papkasi (manage.py joylashgan joy)
BASE_DIR = Path(__file__).resolve().parent.parent
# PROJECT_ROOT — `Diplom_project/` (loyiha ildizi, .env shu yerda)
PROJECT_ROOT = BASE_DIR.parent

# ──────────────────────────────────────────────
# CORE
# ──────────────────────────────────────────────
SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="*", cast=Csv())

# ──────────────────────────────────────────────
# APPS
# ──────────────────────────────────────────────
INSTALLED_APPS = [
    # daphne MUST be at the top — runserver'ni ASGI rejimida ishlatadi
    # (WebSocket qo'llab-quvvatlash bilan)
    "daphne",

    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # 3rd party
    "channels",                    # WebSocket / ASGI
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "corsheaders",
    "drf_spectacular",

    # local apps
    "main_project_app.apps.MainProjectAppConfig",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    # LocaleMiddleware — SessionMiddleware'dan keyin, CommonMiddleware'dan oldin.
    # Accept-Language header yoki sessiyadagi tilni aniqlab, request.LANGUAGE_CODE
    # ga yozadi (uz/ru/qaa). DRF view'lar va serializer'lar shu orqali tilni biladi.
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# ──────────────────────────────────────────────
# CHANNELS — WebSocket real-time bildirishnomalar
# ──────────────────────────────────────────────
# DEV: InMemoryChannelLayer (Redis o'rnatish kerak emas)
# PROD: RedisChannelLayer — bir nechta worker o'rtasida xabarlarni
#       sinxronlash uchun (REDIS_URL sozlangan bo'lsa avtomatik tanlanadi)
_REDIS_URL = config("REDIS_URL", default="")
if _REDIS_URL:
    try:
        import channels_redis  # noqa: F401
        CHANNEL_LAYERS = {
            "default": {
                "BACKEND": "channels_redis.core.RedisChannelLayer",
                "CONFIG": {"hosts": [_REDIS_URL]},
            }
        }
    except ImportError:
        # channels-redis o'rnatilmagan bo'lsa, InMemory fallback
        CHANNEL_LAYERS = {
            "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"},
        }
else:
    CHANNEL_LAYERS = {
        "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"},
    }

# ──────────────────────────────────────────────
# DATABASE
# Production: DATABASE_URL=postgres://user:pass@host/db (Render avtomatik beradi)
# Dev: bo'sh — SQLite ishlatiladi
# ──────────────────────────────────────────────
DATABASE_URL = config("DATABASE_URL", default="")
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL, conn_max_age=600, ssl_require=True
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
AUTH_USER_MODEL = "main_project_app.User"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ──────────────────────────────────────────────
# REST FRAMEWORK
# ──────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    # ── Throttling (rate limiting) ───────────
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",            # noma'lum foydalanuvchi
        "user": "1000/hour",           # tizimga kirgan foydalanuvchi
        "otp": "5/hour",               # OTP yuborish (juda qattiq)
        "login": "10/hour",            # login (qattiq)
        "password_reset": "5/hour",    # parolni tiklash
        "password_change": "5/hour",   # logged-in parolni o'zgartirish
        "report": "10/hour",           # shikoyat yuborish
        "resume_import": "10/hour",    # Word'dan rezyume import (AI + fayl)
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        hours=config("JWT_ACCESS_LIFETIME_HOURS", default=2, cast=int),
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=config("JWT_REFRESH_LIFETIME_DAYS", default=30, cast=int),
    ),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ──────────────────────────────────────────────
# SWAGGER (drf-spectacular)
# ──────────────────────────────────────────────
SPECTACULAR_SETTINGS = {
    "TITLE": "Ish topish platformasi API",
    "DESCRIPTION": (
        "Ish izlovchilar va ish beruvchilar uchun job board API.\n\n"
        "Authentication: JWT (Bearer token)\n"
        "Roles: job_seeker, employer, admin"
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
    "SWAGGER_UI_SETTINGS": {
        "deepLinking": True,
        "persistAuthorization": True,
        "displayOperationId": False,
        "filter": True,
    },
    "TAGS": [
        {"name": "auth", "description": "Autentifikatsiya, ro'yxatdan o'tish, parolni tiklash"},
        {"name": "reference", "description": "Ma'lumotnoma (viloyat, kasb, ko'nikma, ...)"},
        {"name": "vacancies", "description": "Vakansiyalar (ommaviy)"},
        {"name": "resumes", "description": "Rezyumelar (ommaviy)"},
        {"name": "applications", "description": "Arizalar (job seeker)"},
        {"name": "employer", "description": "Ish beruvchi paneli"},
        {"name": "notifications", "description": "Bildirishnomalar"},
        {"name": "reports", "description": "Shikoyatlar"},
        {"name": "admin", "description": "Administrator API"},
    ],
}

# ──────────────────────────────────────────────
# CORS
# ──────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = config("CORS_ALLOW_ALL_ORIGINS", default=True, cast=bool)
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:3000,http://localhost:5173",
    cast=Csv(),
)

# ──────────────────────────────────────────────
# AUTH / VALIDATION
# ──────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
     "OPTIONS": {"min_length": 6}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ──────────────────────────────────────────────
# I18N / TZ
# 3 ta til qo'llab-quvvatlanadi: o'zbek (uz), rus (ru), qoraqalpoq lotin (qaa).
# LocaleMiddleware Accept-Language header orqali tilni aniqlaydi.
# Tarjimalar config/locale/<lang>/LC_MESSAGES/django.{po,mo} fayllarda.
# ──────────────────────────────────────────────
LANGUAGE_CODE = "uz"
LANGUAGES = [
    ("uz", _("O'zbek")),
    ("ru", _("Русский")),
    ("qaa", _("Qaraqalpaqsha")),
]
LOCALE_PATHS = [BASE_DIR / "locale"]
TIME_ZONE = "Asia/Tashkent"
USE_I18N = True
USE_TZ = True

# ──────────────────────────────────────────────
# STATIC / MEDIA
# ──────────────────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Media fayllar (avatar, logo, sertifikat va h.k.)
# DEV: lokal `media/` papkasi
# PROD: Cloudflare R2 (S3-compatible)
USE_R2 = config("USE_R2", default=False, cast=bool)

if USE_R2:
    # ── Cloudflare R2 sozlamalari ──
    R2_ACCESS_KEY_ID = config("R2_ACCESS_KEY_ID")
    R2_SECRET_ACCESS_KEY = config("R2_SECRET_ACCESS_KEY")
    R2_BUCKET_NAME = config("R2_BUCKET_NAME")
    R2_ENDPOINT_URL = config("R2_ENDPOINT_URL")
    R2_PUBLIC_URL = config("R2_PUBLIC_URL")  # https://pub-xxx.r2.dev

    # django-storages S3 backend (R2 — S3-compatible)
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3.S3Storage",
            "OPTIONS": {
                "access_key": R2_ACCESS_KEY_ID,
                "secret_key": R2_SECRET_ACCESS_KEY,
                "bucket_name": R2_BUCKET_NAME,
                "endpoint_url": R2_ENDPOINT_URL,
                "region_name": "auto",   # R2 region — auto
                "signature_version": "s3v4",
                "default_acl": None,      # R2 ACL'larni qo'llab-quvvatlamaydi
                "querystring_auth": False, # public URL'lar uchun
                "custom_domain": R2_PUBLIC_URL.replace("https://", "").replace("http://", ""),
                "file_overwrite": False,  # bir xil nomli fayl bo'lsa, yangi nom beradi
            },
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
            if not DEBUG
            else "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }
    MEDIA_URL = f"{R2_PUBLIC_URL.rstrip('/')}/"
    # MEDIA_ROOT R2 rejimida ishlatilmaydi, lekin Django talab qiladi
    MEDIA_ROOT = BASE_DIR / "media"
else:
    # ── Lokal fayl tizimi (DEV) ──
    MEDIA_URL = "/media/"
    MEDIA_ROOT = BASE_DIR / "media"

# WhiteNoise — production'da static fayllarni siqilgan + manifest bilan servirovat
# qiladi (br/gzip avtomatik, cache header'lar bilan)
if not DEBUG:
    STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ──────────────────────────────────────────────
# PRODUCTION SECURITY HEADERS
# ──────────────────────────────────────────────
# Faqat production (DEBUG=False) muhitda yoqiladi.
# Render avtomatik HTTPS taqdim etadi — shuning uchun HTTPS-only sozlamalar mos.
if not DEBUG:
    # HTTPS redirect — har qanday HTTP so'rov HTTPS'ga yo'naltiriladi
    SECURE_SSL_REDIRECT = True
    # Render proxy'idan kelgan HTTPS sarlavhasini hisobga olish
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

    # HSTS — brauzer ushbu domenni faqat HTTPS orqali ochsin
    SECURE_HSTS_SECONDS = 31536000          # 1 yil
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

    # Cookie xavfsizligi — faqat HTTPS orqali yuborilsin
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = True

    # Boshqa xavfsizlik
    SECURE_CONTENT_TYPE_NOSNIFF = True       # MIME-type sniffing himoyasi
    SECURE_REFERRER_POLICY = "same-origin"   # Referrer header'ni cheklash
    X_FRAME_OPTIONS = "DENY"                  # iframe ichida ochishni taqiqlash

# ──────────────────────────────────────────────
# EMAIL — OTP yetkazib berish
# ──────────────────────────────────────────────
EMAIL_BACKEND = config(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.console.EmailBackend",
)
EMAIL_HOST = config("EMAIL_HOST", default="smtp-relay.brevo.com")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="noreply@diplom.local")

# Frontend bosh URL — email'lardagi havolalar uchun (CTA tugmalar)
FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:5173")

# ──────────────────────────────────────────────
# OTP
# ──────────────────────────────────────────────
OTP_CODE_LIFETIME_MINUTES = config("OTP_CODE_LIFETIME_MINUTES", default=5, cast=int)
OTP_RESEND_COOLDOWN_SECONDS = config("OTP_RESEND_COOLDOWN_SECONDS", default=60, cast=int)

# ──────────────────────────────────────────────
# CACHE — LocMem (default) yoki Redis
# ──────────────────────────────────────────────
# DEV: .env'da REDIS_URL bo'sh — LocMem ishlatiladi (qo'shimcha o'rnatishsiz)
# PROD: REDIS_URL=redis://localhost:6379/1 — Redis ishlatiladi (tezroq, masshtablashga mos)
REDIS_URL = config("REDIS_URL", default="")

if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "IGNORE_EXCEPTIONS": True,  # Redis tushib qolsa, app crash bo'lmaydi
            },
            "KEY_PREFIX": "osonish",
            "TIMEOUT": 300,  # 5 daqiqa default
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "osonish-default",
            "TIMEOUT": 300,
            "OPTIONS": {"MAX_ENTRIES": 5000},
        }
    }

# Cache TTL (sekundlarda) — kerak bo'lganda joyida override qilish mumkin
CACHE_TTL_REFERENCE_DATA = 86400  # ma'lumotnoma — 1 sutka (kasblar, viloyatlar)
CACHE_TTL_AI_MATCH = 3600         # AI moslik natijasi — 1 soat
CACHE_TTL_ADMIN_STATS = 600       # admin statistika — 10 daqiqa
CACHE_TTL_VACANCY_DETAIL = 180    # vakansiya detali — 3 daqiqa

# ──────────────────────────────────────────────
# AI (Google Gemini)
# https://aistudio.google.com/apikey — bepul kalit
# ──────────────────────────────────────────────
GEMINI_API_KEY = config("GEMINI_API_KEY", default="")

# Tarjima uchun ALOHIDA Gemini kalit(lar)i — vergul bilan bir nechta berish mumkin.
# Bir kalit kunlik limitga yetsa (429), translation_service avtomatik keyingisiga
# o'tadi (failover). Shunda jami quota = kalitlar soni × kunlik limit.
# Bo'sh bo'lsa, asosiy GEMINI_API_KEY ishlatiladi (fallback).
GEMINI_API_KEY_TRANSLATE = config("GEMINI_API_KEY_TRANSLATE", default="", cast=Csv())

# Tarjima uchun model. gemini-2.5-flash bepul tier'da kuniga atigi 20 so'rov beradi,
# shuning uchun tarjima (oddiy vazifa) uchun gemini-2.0-flash-lite ishlatamiz —
# bepul tier'da kuniga ~200 so'rov, daqiqada 30. Sifat tarjima uchun yetarli.
GEMINI_TRANSLATE_MODEL = config("GEMINI_TRANSLATE_MODEL", default="gemini-2.0-flash-lite")

# ──────────────────────────────────────────────
# BREVO HTTP API (Render free planda SMTP bloklangan,
# shuning uchun HTTPS API ishlatamiz)
# https://app.brevo.com/settings/keys/api
# ──────────────────────────────────────────────
BREVO_API_KEY = config("BREVO_API_KEY", default="")

# ──────────────────────────────────────────────
# LOGGING
# ──────────────────────────────────────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {name}: {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO" if not DEBUG else "DEBUG",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "main_project_app": {
            "handlers": ["console"],
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": False,
        },
    },
}
