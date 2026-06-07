"""SEO uchun sitemap.xml — frontend (Vercel) URL'larini ro'yxatlaydi.

Vercel rewrite orqali https://<frontend>/sitemap.xml shu view'ga proxy
qilinadi. Google bu orqali barcha vakansiya sahifalarini topadi.
"""
from xml.sax.saxutils import escape

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.cache import cache_page

from .models import Vacancy


def _frontend_base() -> str:
    return (getattr(settings, "FRONTEND_URL", "") or "https://smart-ish.vercel.app").rstrip("/")


@cache_page(60 * 60)  # 1 soat keshlanadi (botlar tez-tez so'raydi)
def sitemap_xml(request):
    base = _frontend_base()
    items = []

    def add(loc, changefreq, priority, lastmod=None):
        parts = [f"<loc>{escape(loc)}</loc>"]
        if lastmod:
            parts.append(f"<lastmod>{lastmod}</lastmod>")
        parts.append(f"<changefreq>{changefreq}</changefreq>")
        parts.append(f"<priority>{priority}</priority>")
        items.append("<url>" + "".join(parts) + "</url>")

    # Statik public sahifalar
    add(f"{base}/", "daily", "1.0")
    add(f"{base}/vacancies", "daily", "0.9")
    add(f"{base}/resumes", "daily", "0.7")

    # Faol vakansiyalar — har biri alohida sahifa (eng muhim SEO kontenti)
    rows = (
        Vacancy.objects.filter(is_active=True)
        .order_by("-updated_at")
        .values_list("id", "updated_at")[:5000]
    )
    for vid, updated in rows:
        lastmod = updated.date().isoformat() if updated else None
        add(f"{base}/vacancies/{vid}", "weekly", "0.8", lastmod)

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(items)
        + "\n</urlset>\n"
    )
    return HttpResponse(xml, content_type="application/xml; charset=utf-8")
