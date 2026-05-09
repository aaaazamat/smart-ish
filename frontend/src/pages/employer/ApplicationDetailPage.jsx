import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Loader2, AlertCircle, Phone, Mail, MapPin,
  Briefcase, GraduationCap, Award, Calendar, User,
} from 'lucide-react'
import {
  useEmployerApplicationDetail,
  useUpdateApplicationStatus,
} from '@/hooks/useEmployer'
import {
  EMPLOYER_STATUS_TRANSITIONS,
  APPLICATION_STATUS_COLORS,
} from '@/lib/constants'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-5 h-5 text-brand-500" />}
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Pill({ children, color = 'gray' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    brand: 'bg-brand-50 text-brand-700',
  }
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

function EmployerApplicationDetailPage() {
  const { id } = useParams()
  const { data: app, isLoading, isError, error } = useEmployerApplicationDetail(id)
  const updateStatus = useUpdateApplicationStatus()

  // Auto-mark as viewed when employer opens
  useEffect(() => {
    if (app && app.status === 'pending') {
      updateStatus.mutate({ id: app.id, status: 'viewed' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.id])

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-16 flex items-center justify-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Yuklanmoqda...
      </div>
    )
  }

  if (isError || !app) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error?.message || 'Ariza topilmadi'}</span>
        </div>
      </div>
    )
  }

  const r = app.resume
  const fullName = r ? [r.last_name, r.first_name, r.middle_name].filter(Boolean).join(' ') : ''
  const location = r ? [r.region?.name, r.district?.name].filter(Boolean).join(', ') : ''
  const statusColor = APPLICATION_STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <Link
        to="/employer/applications"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Arizalarga qaytish
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Section title="Ariza ma'lumotlari" icon={Briefcase}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Vakansiya</div>
                <Link
                  to={`/vacancies/${app.vacancy?.id}`}
                  target="_blank"
                  className="text-sm font-medium text-brand-500 hover:underline"
                >
                  {app.vacancy?.profession_name}
                </Link>
              </div>
              <div>
                <div className="text-xs text-gray-500">Yuborilgan</div>
                <div className="text-sm text-gray-900">{formatDate(app.applied_at)}</div>
              </div>
            </div>
            {app.cover_letter && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1.5">Sopromorat xat</div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{app.cover_letter}</p>
              </div>
            )}
          </Section>

          {r && (
            <>
              <Section title="Nomzod" icon={User}>
                <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
                {r.profession?.name && (
                  <p className="text-base text-brand-500 mt-1">{r.profession.name}</p>
                )}
                {r.profession_detail && (
                  <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">
                    {r.profession_detail}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 pt-4 border-t border-gray-100">
                  {r.phone_number && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" /> {r.phone_number}
                    </div>
                  )}
                  {r.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" /> {r.email}
                    </div>
                  )}
                  {location && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" /> {location}
                    </div>
                  )}
                  {r.birth_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" /> Tug'ilgan: {r.birth_date}
                    </div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  {r.career_level_display && (
                    <div><span className="text-gray-500">Daraja:</span> <span className="text-gray-900">{r.career_level_display}</span></div>
                  )}
                  {r.expected_salary && (
                    <div><span className="text-gray-500">Maosh:</span> <span className="text-gray-900">{Number(r.expected_salary).toLocaleString('ru-RU').replace(/,/g, ' ')} so'm</span></div>
                  )}
                  {r.employment_type_display && (
                    <div><span className="text-gray-500">Bandlik:</span> <span className="text-gray-900">{r.employment_type_display}</span></div>
                  )}
                  {r.work_mode_display && (
                    <div><span className="text-gray-500">Rejim:</span> <span className="text-gray-900">{r.work_mode_display}</span></div>
                  )}
                </div>
              </Section>

              {r.skills?.length > 0 && (
                <Section title="Ko'nikmalar">
                  <div className="flex flex-wrap gap-2">
                    {r.skills.map((s) => <Pill key={s.id} color="brand">{s.name}</Pill>)}
                  </div>
                </Section>
              )}

              {r.work_experiences?.length > 0 && (
                <Section title="Ish tajribasi" icon={Briefcase}>
                  <div className="space-y-3">
                    {r.work_experiences.map((we) => (
                      <div key={we.id} className="pb-3 border-b border-gray-100 last:border-0">
                        <div className="font-medium text-gray-900">{we.position}</div>
                        <div className="text-sm text-gray-600">{we.organization_name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {we.start_year}-{String(we.start_month).padStart(2, '0')} —{' '}
                          {we.is_current ? 'Hozir' : `${we.end_year}-${String(we.end_month).padStart(2, '0')}`}
                        </div>
                        {we.responsibilities && (
                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{we.responsibilities}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {r.educations?.length > 0 && (
                <Section title="Ta'lim" icon={GraduationCap}>
                  <div className="space-y-3">
                    {r.educations.map((e) => (
                      <div key={e.id} className="pb-3 border-b border-gray-100 last:border-0">
                        <div className="font-medium text-gray-900">{e.degree_level_display}</div>
                        {e.university_name && <div className="text-sm text-gray-600">{e.university_name}</div>}
                        {e.direction_name && <div className="text-sm text-gray-600">{e.direction_name}</div>}
                        <div className="text-xs text-gray-500 mt-0.5">
                          {e.start_year} — {e.is_studying ? 'Hozir' : e.end_year}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {r.certificates?.length > 0 && (
                <Section title="Sertifikatlar" icon={Award}>
                  <div className="space-y-2">
                    {r.certificates.map((c) => (
                      <div key={c.id} className="text-sm">
                        <div className="font-medium text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-500">Berilgan: {formatDate(c.issued_date)}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 h-fit">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="text-xs text-gray-500 mb-2">Ariza holati</div>
            <span className={cn(
              'inline-block px-3 py-1 rounded-full text-sm font-medium border mb-4',
              statusColor
            )}>
              {app.status_display}
            </span>

            <div className="text-xs text-gray-500 mb-2 mt-4">Holatni o'zgartirish</div>
            <div className="space-y-2">
              {EMPLOYER_STATUS_TRANSITIONS.filter((s) => s.value !== app.status).map((s) => (
                <Button
                  key={s.value}
                  variant={s.value === 'rejected' ? 'secondary' : s.value === 'hired' ? 'primary' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  loading={updateStatus.isPending}
                  onClick={() => {
                    if (window.confirm(`Holatni "${s.label}" ga o'zgartirasizmi?`)) {
                      updateStatus.mutate({ id: app.id, status: s.value })
                    }
                  }}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default EmployerApplicationDetailPage
