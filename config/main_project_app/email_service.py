"""
Email yuborish servislari — biznes hodisalari uchun.

Bu modulning maqsadi:
- Email yuborish logikasini biznes mantiqdan ajratish
- Har bir hodisa uchun toza, professional matn (text + HTML)
- fail_silently=True — email yuborilmasa, asosiy amal to'xtab qolmaydi
- DEV rejimda console backend ishlaydi (kod terminalga chiqadi),
  PROD rejimda SMTP (Brevo) orqali yuboriladi
"""
import logging
from typing import Optional
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone

logger = logging.getLogger(__name__)

# Sayt nomi va bosh URL (frontend) — emaildagi havolalar uchun
SITE_NAME = "OSON ISH"
SITE_URL = getattr(settings, "FRONTEND_URL", "http://localhost:5173")


# ─────────────────────────────────────────────
# Past darajadagi yordamchi
# ─────────────────────────────────────────────

def _send(to_email: str, subject: str, text_body: str, html_body: Optional[str] = None) -> bool:
    """
    Asosiy yuborish funksiyasi.
    Return True yuborildi, False xato.
    Hech qachon Exception otmaydi (fail-silently).
    """
    if not to_email:
        logger.warning("Email yuborilmadi: to_email bo'sh")
        return False

    try:
        message = EmailMultiAlternatives(
            subject=f"[{SITE_NAME}] {subject}",
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        if html_body:
            message.attach_alternative(html_body, "text/html")
        message.send(fail_silently=False)
        logger.info("Email yuborildi: %s -> %s", subject, to_email)
        return True
    except Exception as e:
        logger.error("Email yuborib bo'lmadi (%s): %s", to_email, e)
        return False


# ─────────────────────────────────────────────
# HTML shabloni (umumiy)
# ─────────────────────────────────────────────

def _html_wrap(title: str, body_html: str, cta_text: str = None, cta_url: str = None) -> str:
    """Email uchun toza HTML shabloni — barcha klientlarda yaxshi ko'rinadi."""
    cta_html = ""
    if cta_text and cta_url:
        cta_html = f"""
        <table cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
          <tr>
            <td style="background: #149AAB; border-radius: 8px;">
              <a href="{cta_url}" style="display: inline-block; padding: 12px 24px;
                  font-family: -apple-system, sans-serif; font-size: 14px; font-weight: 600;
                  color: #ffffff; text-decoration: none;">
                {cta_text}
              </a>
            </td>
          </tr>
        </table>
        """

    return f"""<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin: 0; padding: 0; background: #F3F4F6;
       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
       color: #111827;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #F3F4F6;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 560px; background: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 20px 28px; background: #149AAB; color: white;">
              <div style="font-size: 18px; font-weight: 700; letter-spacing: 0.5px;">
                {SITE_NAME}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #111827;">
                {title}
              </h2>
              <div style="font-size: 14px; line-height: 1.6; color: #374151;">
                {body_html}
              </div>
              {cta_html}
              <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 24px 0;">
              <p style="font-size: 12px; color: #9CA3AF; margin: 0;">
                Ushbu xabar avtomatik yuborildi. Javob bermang.<br>
                Agar siz emaillarni olishni xohlamasangiz, profil sozlamalaridan o'chiring.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


# ─────────────────────────────────────────────
# Yangi ariza yuborildi → employer'ga
# ─────────────────────────────────────────────

def send_application_received_email(application) -> bool:
    """Job seeker ariza yuborganda, employer emailga xabar oladi."""
    employer = application.vacancy.employer
    if not employer or not employer.email:
        return False

    vacancy = application.vacancy
    resume = application.resume
    candidate_name = f"{resume.last_name} {resume.first_name}".strip() or "Nomzod"
    profession = vacancy.profession.name if vacancy.profession else "vakansiyangiz"
    cover = (application.cover_letter or "").strip()
    cover_excerpt = (cover[:200] + "...") if len(cover) > 200 else cover

    subject = f"Yangi ariza: {candidate_name} → {profession}"

    text_body = (
        f"Salom!\n\n"
        f"\"{profession}\" vakansiyangizga yangi ariza keldi.\n\n"
        f"Nomzod: {candidate_name}\n"
        f"Kasb: {resume.profession.name if resume.profession else '—'}\n"
        f"Hudud: {resume.region.name if resume.region else '—'}\n"
        f"Karyera darajasi: {resume.get_career_level_display()}\n"
    )
    if cover_excerpt:
        text_body += f"\nMurojaat xati:\n{cover_excerpt}\n"
    text_body += f"\nKo'rib chiqish: {SITE_URL}/employer/applications/{application.id}\n"

    body_html = f"""
      <p>\"<strong>{profession}</strong>\" vakansiyangizga yangi ariza keldi.</p>
      <table cellpadding="6" cellspacing="0" border="0" style="margin: 12px 0; font-size: 14px;">
        <tr><td style="color:#6B7280;">Nomzod:</td><td><strong>{candidate_name}</strong></td></tr>
        <tr><td style="color:#6B7280;">Kasb:</td><td>{resume.profession.name if resume.profession else '—'}</td></tr>
        <tr><td style="color:#6B7280;">Hudud:</td><td>{resume.region.name if resume.region else '—'}</td></tr>
        <tr><td style="color:#6B7280;">Karyera darajasi:</td><td>{resume.get_career_level_display()}</td></tr>
      </table>
    """
    if cover_excerpt:
        body_html += f"""
          <div style="background: #F9FAFB; border-left: 3px solid #149AAB;
               padding: 12px 16px; margin-top: 16px; border-radius: 4px;
               font-size: 13px; color: #374151; font-style: italic;">
            "{cover_excerpt}"
          </div>
        """

    html = _html_wrap(
        title="Yangi ariza qabul qilindi",
        body_html=body_html,
        cta_text="Arizani ko'rish",
        cta_url=f"{SITE_URL}/employer/applications/{application.id}",
    )

    return _send(employer.email, subject, text_body, html)


# ─────────────────────────────────────────────
# Taklif yuborildi → job seeker'ga
# ─────────────────────────────────────────────

def send_invitation_received_email(invitation) -> bool:
    """Employer taklif yuborganda, job seeker emailga xabar oladi."""
    seeker = invitation.resume.user
    if not seeker or not seeker.email:
        return False

    vacancy = invitation.vacancy
    org_name = vacancy.organization.name if vacancy.organization else "Tashkilot"
    profession = vacancy.profession.name if vacancy.profession else "vakansiya"
    note = (invitation.note or "").strip()

    subject = f"Sizga taklif: {profession} ({org_name})"

    text_body = (
        f"Assalomu alaykum!\n\n"
        f"{org_name} sizni \"{profession}\" lavozimiga taklif qildi.\n\n"
        f"Hudud: {vacancy.region.name if vacancy.region else '—'}\n"
        f"Ish rejimi: {vacancy.get_work_mode_display()}\n"
    )
    if vacancy.salary_from:
        salary_text = f"{vacancy.salary_from:,} so'm".replace(",", " ")
        if vacancy.salary_to:
            salary_text += f" - {vacancy.salary_to:,} so'm".replace(",", " ")
        text_body += f"Maosh: {salary_text}\n"
    if note:
        text_body += f"\nIsh beruvchi xabari:\n{note}\n"
    text_body += f"\nTaklifni ko'rish: {SITE_URL}/applications\n"

    body_html = f"""
      <p><strong>{org_name}</strong> sizni \"<strong>{profession}</strong>\" lavozimiga taklif qildi.</p>
      <table cellpadding="6" cellspacing="0" border="0" style="margin: 12px 0; font-size: 14px;">
        <tr><td style="color:#6B7280;">Hudud:</td><td>{vacancy.region.name if vacancy.region else '—'}</td></tr>
        <tr><td style="color:#6B7280;">Ish rejimi:</td><td>{vacancy.get_work_mode_display()}</td></tr>
    """
    if vacancy.salary_from:
        salary_text = f"{vacancy.salary_from:,}".replace(",", " ")
        if vacancy.salary_to:
            salary_text += f" - {vacancy.salary_to:,}".replace(",", " ")
        body_html += f"<tr><td style='color:#6B7280;'>Maosh:</td><td>{salary_text} so'm</td></tr>"
    body_html += "</table>"

    if note:
        body_html += f"""
          <div style="background: #F0F9FA; border-left: 3px solid #149AAB;
               padding: 12px 16px; margin-top: 16px; border-radius: 4px;
               font-size: 13px; color: #374151;">
            <strong>Ish beruvchi xabari:</strong><br>
            {note}
          </div>
        """

    html = _html_wrap(
        title="Sizga taklif keldi",
        body_html=body_html,
        cta_text="Taklifni ko'rish",
        cta_url=f"{SITE_URL}/applications",
    )

    return _send(seeker.email, subject, text_body, html)


# ─────────────────────────────────────────────
# Ariza holati o'zgardi → job seeker'ga
# ─────────────────────────────────────────────

def send_application_status_changed_email(application) -> bool:
    """Employer status'ni o'zgartirganda, job seeker emailga xabar oladi."""
    seeker = application.resume.user
    if not seeker or not seeker.email:
        return False

    vacancy = application.vacancy
    org_name = vacancy.organization.name if vacancy.organization else "Tashkilot"
    profession = vacancy.profession.name if vacancy.profession else "vakansiya"
    status_display = application.get_status_display()
    note = (application.note or "").strip()

    # Status emoji va rangi (HTML emailda)
    status_meta = {
        "viewed": ("👀", "#3B82F6", "ko'rib chiqilmoqda"),
        "interview": ("📞", "#F59E0B", "suhbatga chaqirildi"),
        "accepted": ("✅", "#10B981", "qabul qilindi"),
        "hired": ("🎉", "#10B981", "ishga qabul qilindi"),
        "rejected": ("❌", "#EF4444", "rad etildi"),
    }
    emoji, color, _ = status_meta.get(application.status, ("", "#6B7280", ""))

    subject = f"Ariza holati: {status_display} — {profession}"

    text_body = (
        f"Assalomu alaykum!\n\n"
        f"{org_name} ({profession}) sizning arizangizning holatini "
        f"o'zgartirdi: {status_display}\n"
    )
    if note:
        text_body += f"\nIzoh:\n{note}\n"
    text_body += f"\nArizalarni ko'rish: {SITE_URL}/applications\n"

    body_html = f"""
      <p><strong>{org_name}</strong> (\"{profession}\") sizning arizangizning holatini o'zgartirdi.</p>
      <div style="display: inline-block; padding: 8px 16px; margin: 12px 0;
           background: {color}15; color: {color}; border-radius: 20px;
           font-weight: 600; font-size: 14px;">
        {emoji} {status_display}
      </div>
    """
    if note:
        body_html += f"""
          <div style="background: #F9FAFB; border-left: 3px solid #6B7280;
               padding: 12px 16px; margin-top: 16px; border-radius: 4px;
               font-size: 13px; color: #374151;">
            <strong>Ish beruvchi izohi:</strong><br>
            {note}
          </div>
        """

    html = _html_wrap(
        title="Ariza holati o'zgardi",
        body_html=body_html,
        cta_text="Arizalarni ko'rish",
        cta_url=f"{SITE_URL}/applications",
    )

    return _send(seeker.email, subject, text_body, html)
