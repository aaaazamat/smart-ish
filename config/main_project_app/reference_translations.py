"""Referens ma'lumotlar uchun statik (qo'lda tayyorlangan) ru/qaa tarjima lug'ati.

Ham `seed_translations` management command (eski ma'lumotlar), ham `signals.py`
(yangi qo'shilgan ma'lumotlar) shu lug'atdan foydalanadi.

Mantiq:
- Yangi yozuv lug'atda bo'lsa  → darhol statik tarjima (Gemini'siz, ishonchli)
- Lug'atda bo'lmasa            → AI (Gemini) bilan tarjima (signals.py)
"""

# ── (uz) → (ru, qaa) ───────────────────────────────────────────

REGION_TR = {
    "Andijon": ("Андижан", "Andijan"),
    "Buxoro": ("Бухара", "Buxara"),
    "Farg'ona": ("Фергана", "Ferǵana"),
    "Namangan": ("Наманган", "Namangan"),
    "Qashqadaryo": ("Кашкадарья", "Qashqadárya"),
    "Samarqand": ("Самарканд", "Samarqand"),
    "Toshkent": ("Ташкент", "Tashkent"),
    "Toshkent shahri": ("город Ташкент", "Tashkent qalası"),
    "Toshkent viloyati": ("Ташкентская область", "Tashkent wálayatı"),
    "Sirdaryo": ("Сырдарья", "Sırdárya"),
    "Jizzax": ("Джизак", "Jizzax"),
    "Navoiy": ("Навои", "Nawayı"),
    "Surxondaryo": ("Сурхандарья", "Surxandárya"),
    "Xorazm": ("Хорезм", "Xorezm"),
    "Qoraqalpog'iston": ("Каракалпакстан", "Qaraqalpaqstan"),
}

INDUSTRY_TR = {
    "IT va Aloqa": ("ИТ и связь", "IT hám baylanıs"),
    "Ishlab chiqarish": ("Производство", "Óndiris"),
    "Logistika": ("Логистика", "Logistika"),
    "Moliya va Bank": ("Финансы и банки", "Finans hám Bank"),
    "Qurilish": ("Строительство", "Qurılıs"),
    "Savdo": ("Торговля", "Sawda"),
    "Sog'liqni saqlash": ("Здравоохранение", "Densawlıqtı saqlaw"),
    "Ta'lim": ("Образование", "Bilimlendiriw"),
    "Qishloq xo'jaligi": ("Сельское хозяйство", "Awıl xojalıǵı"),
    "Transport": ("Транспорт", "Transport"),
    "Turizm": ("Туризм", "Turizm"),
    "Media": ("Медиа", "Media"),
}

PROFESSION_TR = {
    "Administrator": ("Администратор", "Administrator"),
    "Arxitektor": ("Архитектор", "Arxitektor"),
    "Backend Developer": ("Backend-разработчик", "Backend Developer"),
    "Buxgalter": ("Бухгалтер", "Buxgalter"),
    "Buxgalter-ekspert": ("Бухгалтер-эксперт", "Buxgalter-ekspert"),
    "DevOps muhandis": ("DevOps-инженер", "DevOps injener"),
    "Dizayner": ("Дизайнер", "Dizayner"),
    "Frontend Developer": ("Frontend-разработчик", "Frontend Developer"),
    "Full-stack Developer": ("Full-stack разработчик", "Full-stack Developer"),
    "Grafik dizayner": ("Графический дизайнер", "Grafik dizayner"),
    "HR direktori": ("HR-директор", "HR direktorı"),
    "HR mutaxassisi": ("HR-специалист", "HR qániygesi"),
    "Hamshira": ("Медсестра", "Medbiyke"),
    "Haydovchi": ("Водитель", "Aydawshı"),
    "Hisobchi": ("Бухгалтер", "Esapshı"),
    "IT-mutaxassis": ("IT-специалист", "IT qániyge"),
    "Kontent menejer": ("Контент-менеджер", "Kontent menejer"),
    "Loyiha menejeri": ("Менеджер проектов", "Joybar menejeri"),
    "Mahsulot menejeri": ("Продакт-менеджер", "Ónim menejeri"),
    "Marketolog": ("Маркетолог", "Marketolog"),
    "Menejer": ("Менеджер", "Menejer"),
    "Muhandis-loyihachi": ("Инженер-проектировщик", "Injener-joybarshı"),
    "O'qituvchi": ("Учитель", "Oqıtıwshı"),
    "Ofitsiant": ("Официант", "Ofitsiant"),
    "Oshpaz": ("Повар", "Aspaz"),
    "QA tester": ("QA-тестировщик", "QA tester"),
    "Quruvchi": ("Строитель", "Qurıwshı"),
    "SMM mutaxassisi": ("SMM-специалист", "SMM qániyge"),
    "Sotuvchi-konsultant": ("Продавец-консультант", "Satıwshı-konsultant"),
    "Tarbiyachi": ("Воспитатель", "Tárbiyashı"),
    "Test Backend": ("Test Backend", "Test Backend"),
    "UX/UI dizayner": ("UX/UI дизайнер", "UX/UI dizayner"),
    "Vrach-terapevt": ("Врач-терапевт", "Terapevt shıpaker"),
    "Yuridik maslahatchi": ("Юрисконсульт", "Yuridik másláhátshı"),
}

DISTRICT_TR = {
    "Andijon shahri": ("город Андижан", "Andijan qalası"),
    "Asaka": ("Асака", "Asaka"),
    "Bekobod": ("Бекабад", "Bekobod"),
    "Bulung'ur": ("Булунгур", "Bulunǵur"),
    "Buxoro shahri": ("город Бухара", "Buxara qalası"),
    "Chilonzor": ("Чиланзар", "Shılanzar"),
    "Chinoz": ("Чиназ", "Shınaz"),
    "Chortoq": ("Чартак", "Shortaq"),
    "Chust": ("Чуст", "Shust"),
    "Farg'ona shahri": ("город Фергана", "Ferǵana qalası"),
    "G'ijduvon": ("Гиждуван", "Ǵijduwan"),
    "Kattaqo'rg'on": ("Каттакурган", "Kattaqorǵan"),
    "Kitob": ("Китаб", "Kitob"),
    "Kogon": ("Каган", "Kogon"),
    "Marg'ilon": ("Маргилан", "Marǵilan"),
    "Marhamat": ("Мархамат", "Marhamat"),
    "Mirobod": ("Мирабад", "Mirobod"),
    "Mirzo Ulug'bek": ("Мирзо-Улугбек", "Mirzo Ulugʻbek"),
    "Namangan shahri": ("город Наманган", "Namangan qalası"),
    "Ohangaron": ("Ахангаран", "Ohangaron"),
    "Olmazor": ("Алмазар", "Olmazor"),
    "Qarshi": ("Карши", "Qarshı"),
    "Quva": ("Кува", "Quva"),
    "Quvasoy": ("Кувасай", "Quvasoy"),
    "Samarqand shahri": ("город Самарканд", "Samarqand qalası"),
    "Sergeli": ("Сергели", "Sergeli"),
    "Shahrisabz": ("Шахрисабз", "Shahrisabz"),
    "Urgut": ("Ургут", "Urgut"),
    "Vobkent": ("Вабкент", "Vobkent"),
    "Xonobod": ("Ханабад", "Xonobod"),
    "Yakkasaroy": ("Яккасарай", "Yakkasaray"),
    "Yangiyo'l": ("Янгиюль", "Yangiyol"),
    "Yunusobod": ("Юнусабад", "Yunusobod"),
    "Zangiota": ("Зангиата", "Zangiota"),
}

# Model nomi → lug'at (signals.py va seed_translations uchun)
STATIC_BY_MODEL = {
    "Region": REGION_TR,
    "Industry": INDUSTRY_TR,
    "Profession": PROFESSION_TR,
    "District": DISTRICT_TR,
}


def lookup_static(model_name: str, name: str):
    """Model nomi va uz nomi bo'yicha statik (ru, qaa) tarjimani qaytaradi.

    Topilmasa None — bu holda AI (Gemini) bilan tarjima qilinadi.
    """
    table = STATIC_BY_MODEL.get(model_name)
    if not table:
        return None
    return table.get((name or "").strip())
