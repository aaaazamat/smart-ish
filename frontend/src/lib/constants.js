export const GENDER_OPTIONS = [
  { value: 'male', label: 'Erkak' },
  { value: 'female', label: 'Ayol' },
]

export const CAREER_LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Ish faoliyatini yangi boshlamoqda' },
  { value: 'junior', label: 'Ish tajribasi kam, o\'rganishga tayyor' },
  { value: 'middle', label: 'Amaliyot va nazariy bilimlarga ega' },
  { value: 'fresh_graduate', label: 'Yangi bitiruvchi' },
  { value: 'experienced', label: 'Tajribali mutaxassis' },
]

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'permanent', label: 'Doimiy' },
  { value: 'seasonal', label: 'Mavsumiy' },
  { value: 'daily', label: 'Kunlik' },
]

export const WORK_MODE_OPTIONS = [
  { value: 'office', label: 'Odatiy (ish joyida)' },
  { value: 'shift', label: 'Smenali ish' },
  { value: 'remote', label: 'Masofaviy' },
  { value: 'hybrid', label: 'Gibrid' },
  { value: 'freelance', label: 'Kasanachilik' },
]

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'actively_looking', label: 'Faol ish qidiruvchiman' },
  { value: 'open_to_offers', label: 'Yangi imkoniyatlarni ko\'rib chiqayapman' },
  { value: 'not_looking', label: 'Hozircha ish qidirmayapman' },
]

export const DEGREE_LEVEL_OPTIONS = [
  { value: 'secondary_special', label: "O'rta maxsus" },
  { value: 'bachelor', label: 'Bakalavr' },
  { value: 'master', label: 'Magistratura' },
  { value: 'phd', label: 'PhD' },
]

export const APPLICATION_STATUS_OPTIONS = [
  { value: '', label: 'Barcha holatlar' },
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'viewed', label: "Ko'rildi" },
  { value: 'invited', label: 'Taklif yuborildi' },
  { value: 'interview', label: 'Suhbatga chaqirildi' },
  { value: 'accepted', label: 'Qabul qilindi' },
  { value: 'hired', label: 'Ishga qabul qilindi' },
  { value: 'rejected', label: 'Rad etildi' },
]

// Statuses an employer can SET on an application (subset of all statuses)
export const EMPLOYER_STATUS_TRANSITIONS = [
  { value: 'viewed', label: "Ko'rildi deb belgilash" },
  { value: 'interview', label: 'Suhbatga chaqirish' },
  { value: 'accepted', label: 'Qabul qilish' },
  { value: 'hired', label: 'Ishga olindi' },
  { value: 'rejected', label: 'Rad etish' },
]

export const APPLICATION_STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  viewed: 'bg-blue-50 text-blue-700 border-blue-200',
  invited: 'bg-purple-50 text-purple-700 border-purple-200',
  interview: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  hired: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

export const PAYMENT_TYPE_OPTIONS = [
  { value: 'monthly', label: 'Oylik' },
  { value: 'piecework', label: 'Ishbay' },
  { value: 'hourly', label: 'Soatbay' },
  { value: 'negotiable', label: 'Shartnomaviy' },
]

export const EXPERIENCE_REQUIRED_OPTIONS = [
  { value: 'no_req', label: 'Talab etilmaydi' },
  { value: 'lt_1', label: '1 yilgacha' },
  { value: '1_3', label: '1-3 yil' },
  { value: '3_5', label: '3-5 yil' },
  { value: 'gt_5', label: '5 yildan ortiq' },
]

export const EDUCATION_LEVEL_OPTIONS = [
  { value: 'any', label: 'Ahamiyatga ega emas' },
  { value: 'secondary_special', label: "O'rta maxsus" },
  { value: 'bachelor', label: 'Oliy (Bakalavr)' },
  { value: 'master', label: 'Oliy (Magistratura)' },
  { value: 'phd', label: 'PhD' },
]

export const VACANCY_EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'permanent', label: 'Doimiy' },
  { value: 'seasonal', label: 'Mavsumiy' },
  { value: 'daily', label: 'Kunlik' },
]

export const VACANCY_WORK_MODE_OPTIONS = [
  { value: 'office', label: 'Odatiy' },
  { value: 'shift', label: 'Smenali' },
  { value: 'remote', label: 'Masofaviy' },
  { value: 'hybrid', label: 'Gibrid' },
]

export const WORK_SCHEDULE_OPTIONS = [
  { value: '6/1', label: '6/1' },
  { value: '5/2', label: '5/2' },
  { value: '4/4', label: '4/4' },
  { value: '4/3', label: '4/3' },
  { value: '4/2', label: '4/2' },
  { value: '3/3', label: '3/3' },
  { value: '3/2', label: '3/2' },
  { value: '2/2', label: '2/2' },
  { value: '2/1', label: '2/1' },
  { value: '1/3', label: '1/3' },
  { value: '1/2', label: '1/2' },
  { value: 'free', label: 'Erkin grafik' },
]

export const VACANCY_GENDER_OPTIONS = [
  { value: 'any', label: 'Ahamiyatsiz' },
  { value: 'male', label: 'Erkak' },
  { value: 'female', label: 'Ayol' },
]

export const LANGUAGE_OPTIONS = [
  { value: 'uz', label: "O'zbek tili" },
  { value: 'ru', label: 'Rus tili' },
  { value: 'en', label: 'Ingliz tili' },
  { value: 'tr', label: 'Turk tili' },
  { value: 'ko', label: 'Koreys tili' },
  { value: 'zh', label: 'Xitoy tili' },
  { value: 'de', label: 'Nemis tili' },
]

export const LANGUAGE_LEVEL_OPTIONS = [
  { value: 'A1', label: "A1 — Boshlang'ich" },
  { value: 'A2', label: 'A2 — Elementar' },
  { value: 'B1', label: "B1 — O'rta" },
  { value: 'B2', label: "B2 — O'rtadan yuqori" },
  { value: 'C1', label: "C1 — Ilg'or" },
  { value: 'C2', label: 'C2 — Mukammal' },
]

export const MONTH_OPTIONS = [
  { value: 1, label: 'Yanvar' },
  { value: 2, label: 'Fevral' },
  { value: 3, label: 'Mart' },
  { value: 4, label: 'Aprel' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Iyun' },
  { value: 7, label: 'Iyul' },
  { value: 8, label: 'Avgust' },
  { value: 9, label: 'Sentabr' },
  { value: 10, label: 'Oktabr' },
  { value: 11, label: 'Noyabr' },
  { value: 12, label: 'Dekabr' },
]
