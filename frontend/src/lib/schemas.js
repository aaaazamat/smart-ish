import { z } from 'zod'

const phoneRegex = /^\+?998\d{9}$/

export const loginSchema = z.object({
  email: z.string().email('Email formati noto\'g\'ri'),
  password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
})

export const otpSendSchema = z.object({
  email: z.string().email('Email formati noto\'g\'ri'),
})

export const passwordChangeSchema = z
  .object({
    old_password: z.string().min(1, 'Eski parolni kiriting'),
    new_password: z
      .string()
      .min(6, 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
    new_password_confirm: z.string().min(6, 'Tasdiqlash uchun parolni qaytadan kiriting'),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    path: ['new_password_confirm'],
    message: 'Yangi parollar mos kelmadi',
  })
  .refine((data) => data.old_password !== data.new_password, {
    path: ['new_password'],
    message: 'Yangi parol eskisidan farq qilishi kerak',
  })

export const resumeSchema = z.object({
  first_name: z.string().min(1, 'Ism majburiy'),
  last_name: z.string().min(1, 'Familiya majburiy'),
  middle_name: z.string().optional(),
  phone_number: z.string().regex(phoneRegex, 'Telefon +998XXXXXXXXX formatida'),
  email: z.union([z.string().email('Email noto\'g\'ri'), z.literal('')]).optional(),
  birth_date: z.string().min(1, 'Tug\'ilgan sana majburiy'),
  gender: z.enum(['male', 'female'], { message: 'Jinsni tanlang' }),
  region: z.string().optional(),
  district: z.string().optional(),
  profession: z.string().optional(),
  profession_detail: z.string().optional(),
  career_level: z.enum(
    ['beginner', 'junior', 'middle', 'fresh_graduate', 'experienced'],
    { message: 'Karyera darajasini tanlang' }
  ),
  expected_salary: z.string().optional(),
  employment_type: z.enum(['permanent', 'seasonal', 'daily'], {
    message: 'Bandlik turini tanlang',
  }),
  work_mode: z.enum(['office', 'shift', 'remote', 'hybrid', 'freelance'], {
    message: 'Ish rejimini tanlang',
  }),
  employment_status: z.enum(
    ['actively_looking', 'open_to_offers', 'not_looking'],
    { message: 'Holatni tanlang' }
  ),
  skills: z.array(z.union([z.number(), z.string()])).optional(),
  is_disabled: z.boolean().optional(),
  is_social_registry: z.boolean().optional(),
  has_driving_license: z.boolean().optional(),
  driving_license_categories: z.string().optional(),
  is_published: z.boolean().optional(),
})

const currentYear = new Date().getFullYear()
const yearStr = z.coerce.number().int().min(1950).max(currentYear + 5)

export const workExperienceSchema = z
  .object({
    organization_name: z.string().min(1, 'Tashkilot nomi majburiy'),
    position: z.string().min(1, 'Lavozim majburiy'),
    start_month: z.coerce.number().int().min(1).max(12),
    start_year: yearStr,
    end_month: z.union([z.coerce.number().int().min(1).max(12), z.literal(''), z.null()]).optional(),
    end_year: z.union([yearStr, z.literal(''), z.null()]).optional(),
    is_current: z.boolean().optional(),
    responsibilities: z.string().optional(),
  })
  .refine((d) => d.is_current || (d.end_month && d.end_year), {
    message: 'Tugash sanasi yoki "Hozir ishlayapman" tanlash kerak',
    path: ['end_year'],
  })

export const educationSchema = z.object({
  degree_level: z.enum(['secondary_special', 'bachelor', 'master', 'phd'], {
    message: 'Daraja tanlang',
  }),
  university: z.string().optional(),
  direction: z.string().optional(),
  start_year: yearStr,
  end_year: z.union([yearStr, z.literal(''), z.null()]).optional(),
  is_studying: z.boolean().optional(),
})

export const employerVacancySchema = z
  .object({
    profession: z.string().min(1, 'Kasb majburiy'),
    industry: z.string().optional(),
    description: z.string().optional(),
    region: z.string().optional(),
    district: z.string().optional(),
    payment_type: z.enum(['monthly', 'piecework', 'hourly', 'negotiable'], {
      message: "To'lov turini tanlang",
    }),
    salary_from: z.string().optional(),
    salary_to: z.string().optional(),
    experience_required: z.enum(['no_req', 'lt_1', '1_3', '3_5', 'gt_5'], {
      message: 'Tajriba talabini tanlang',
    }),
    education_level: z.enum(
      ['any', 'secondary_special', 'bachelor', 'master', 'phd']
    ).optional(),
    employment_type: z.enum(['permanent', 'seasonal', 'daily'], {
      message: 'Bandlik turini tanlang',
    }),
    work_mode: z.enum(['office', 'shift', 'remote', 'hybrid'], {
      message: 'Ish rejimini tanlang',
    }),
    work_schedule: z.string().optional(),
    gender: z.enum(['any', 'male', 'female']).optional(),
    age_from: z.string().optional(),
    age_to: z.string().optional(),
    for_disabled: z.boolean().optional(),
    for_graduates: z.boolean().optional(),
    for_students: z.boolean().optional(),
    is_active: z.boolean().optional(),
    expires_at: z.string().optional(),
    language_requirements: z
      .array(
        z.object({
          language: z.string().min(1),
          min_level: z.string().min(1),
        })
      )
      .optional(),
  })
  .refine(
    (d) => !d.salary_from || !d.salary_to || Number(d.salary_from) <= Number(d.salary_to),
    { message: '"dan" "gacha"dan kichik bo\'lishi kerak', path: ['salary_to'] }
  )

export const certificateSchema = z.object({
  name: z.string().min(1, 'Sertifikat nomi majburiy'),
  issued_date: z.string().min(1, 'Berilgan sanani kiriting'),
  file_url: z.union([z.string().url('URL noto\'g\'ri'), z.literal('')]).optional(),
})

export const registerSchema = z
  .object({
    phone_number: z
      .string()
      .regex(phoneRegex, 'Telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak'),
    email: z.string().email('Email formati noto\'g\'ri'),
    code: z.string().regex(/^\d{6}$/, 'Kod 6 ta raqamdan iborat bo\'lishi kerak'),
    password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
    password_confirm: z.string().min(6),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Parollar mos kelmadi',
    path: ['password_confirm'],
  })

export const registerEmployerSchema = z
  .object({
    phone_number: z
      .string()
      .regex(phoneRegex, 'Telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak'),
    email: z.string().email('Email formati noto\'g\'ri'),
    code: z.string().regex(/^\d{6}$/, 'Kod 6 ta raqamdan iborat bo\'lishi kerak'),
    organization_id: z.string().min(1, 'Tashkilotni tanlang'),
    password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
    password_confirm: z.string().min(6),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Parollar mos kelmadi',
    path: ['password_confirm'],
  })
