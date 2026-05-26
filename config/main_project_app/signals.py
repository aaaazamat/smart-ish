"""Avtomatik tarjima signal'lari.

Yangi referens yoki user content yaratilganda/o'zgartirilganda, AI yordamida
ru va qaa tillariga avtomatik tarjima qiladi. Asinxron — ai_tasks.submit
orqali fon rejimida, HTTP javobini bloklab qo'ymasligi uchun.

Signal qayta trigger qilmasligi uchun `Model.objects.filter().update()`
ishlatiladi (save() emas — bu post_save signalini chaqirar edi).
"""
import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from . import ai_tasks
from .translation_service import translate_text
from .models import (
    Region, District, Profession, Skill,
    University, UniversityDirection, Industry,
    Vacancy, Organization, Resume,
)

logger = logging.getLogger(__name__)

# Referens modellar (name maydoni tarjima qilinadi)
REFERENCE_MODELS = [
    Region, District, Profession, Skill,
    University, UniversityDirection, Industry,
]

# User content modellari va ularning tarjimaga muhtoj maydonlari
USER_CONTENT_MAP = {
    Vacancy: "description",
    Organization: "description",
    Resume: "profession_detail",
}


def _translate_and_save(model_label: str, pk, base_field: str):
    """Fon rejimida bajariladigan tarjima ishi.

    Args:
        model_label: "app.ModelName" formatida (apps.get_model uchun)
        pk: instance pk
        base_field: "name" yoki "description" yoki "profession_detail"
    """
    from django.apps import apps as django_apps

    try:
        app_label, model_name = model_label.split(".")
        Model = django_apps.get_model(app_label, model_name)
    except (ValueError, LookupError) as e:
        logger.warning("Translate job: model topilmadi (%s): %s", model_label, e)
        return

    try:
        instance = Model.objects.get(pk=pk)
    except Model.DoesNotExist:
        logger.info("Translate job: instance #%s o'chirilgan (model=%s)", pk, model_label)
        return

    # Manba matn: avval *_uz, keyin asl `name` / `description` / `profession_detail`
    src = getattr(instance, f"{base_field}_uz", "") or getattr(instance, base_field, "")
    if not src:
        return

    updates = {}

    # Agar *_uz bo'sh bo'lsa, asl qiymatdan ko'chirish (yangi yozuv holati)
    if not getattr(instance, f"{base_field}_uz", ""):
        updates[f"{base_field}_uz"] = src

    # ru va qaa uchun AI tarjima — faqat bo'sh bo'lganlarini
    for lang in ("ru", "qaa"):
        attr = f"{base_field}_{lang}"
        if not getattr(instance, attr, ""):
            try:
                translated = translate_text(src, lang)
                # Faqat AI haqiqatan ham boshqa narsa qaytarganda yangilash
                if translated and translated != src:
                    updates[attr] = translated
            except Exception as e:
                logger.warning("Auto-translate %s→%s xato (%s#%s): %s",
                               base_field, lang, Model.__name__, pk, e)

    if updates:
        # filter().update() ishlatish — signal qayta trigger qilmaydi
        Model.objects.filter(pk=pk).update(**updates)
        logger.info("Auto-translated %s#%s: %s", Model.__name__, pk, list(updates.keys()))


def _enqueue_translation(instance, base_field: str):
    """Signal handler'dan chaqiriladi — fon thread'iga ish yuboradi."""
    model = type(instance)
    model_label = f"{model._meta.app_label}.{model.__name__}"
    try:
        ai_tasks.submit(_translate_and_save, model_label, instance.pk, base_field)
    except Exception as e:
        logger.exception("ai_tasks.submit xato (%s): %s", model_label, e)


# ─── Referens modellar (name) ─────────────────────────────

@receiver(post_save, sender=Region)
@receiver(post_save, sender=District)
@receiver(post_save, sender=Profession)
@receiver(post_save, sender=Skill)
@receiver(post_save, sender=University)
@receiver(post_save, sender=UniversityDirection)
@receiver(post_save, sender=Industry)
def auto_translate_reference_name(sender, instance, created, **kwargs):
    """Referens yozuv saqlanganda — name'ni 3 tilga tarjima qilish."""
    # Faqat *_ru yoki *_qaa bo'sh bo'lsa ishni ishga tushiramiz
    if not instance.name_ru or not instance.name_qaa or not instance.name_uz:
        _enqueue_translation(instance, "name")


# ─── User content (description / profession_detail) ──────

@receiver(post_save, sender=Vacancy)
def auto_translate_vacancy_description(sender, instance, created, **kwargs):
    if not instance.description_ru or not instance.description_qaa or not instance.description_uz:
        if instance.description or instance.description_uz:
            _enqueue_translation(instance, "description")


@receiver(post_save, sender=Organization)
def auto_translate_organization_description(sender, instance, created, **kwargs):
    if not instance.description_ru or not instance.description_qaa or not instance.description_uz:
        if instance.description or instance.description_uz:
            _enqueue_translation(instance, "description")


@receiver(post_save, sender=Resume)
def auto_translate_resume_detail(sender, instance, created, **kwargs):
    if (not instance.profession_detail_ru
            or not instance.profession_detail_qaa
            or not instance.profession_detail_uz):
        if instance.profession_detail or instance.profession_detail_uz:
            _enqueue_translation(instance, "profession_detail")
