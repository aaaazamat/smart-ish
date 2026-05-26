from django.apps import AppConfig


class MainProjectAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'main_project_app'
    verbose_name = 'Asosiy modul (Ish/Rezyume/Vakansiya)'

    def ready(self):
        # Avtomatik tarjima signal'larini ulash (yangi yozuv post_save da
        # ru/qaa ga AI bilan tarjima qilinadi).
        from . import signals  # noqa: F401
