import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Loader2, AlertCircle, Phone, Mail, MapPin,
  Briefcase, GraduationCap, Award, Calendar, User, Send,
} from 'lucide-react'
import { useEmployerResumeDetail, useEmployerVacancies } from '@/hooks/useEmployer'
import { formatDate, formatNumber } from '@/lib/format'
import Button from '@/components/ui/Button'
import InviteModal from '@/components/employer/InviteModal'
import MatchCard from '@/components/ai/MatchCard'

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
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

function EmployerResumeDetailPage() {
  const { id } = useParams()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [matchVacancyId, setMatchVacancyId] = useState('')
  const { data: r, isLoading, isError, error } = useEmployerResumeDetail(id)
  const { data: vacancies = [] } = useEmployerVacancies()
  const activeVacancies = vacancies.filter((v) => v.is_active)

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-16 flex items-center justify-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Yuklanmoqda...
      </div>
    )
  }

  if (isError || !r) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error?.message || 'Rezyume topilmadi'}</span>
        </div>
      </div>
    )
  }

  const fullName = [r.last_name, r.first_name, r.middle_name].filter(Boolean).join(' ')
  const location = [r.region?.name, r.district?.name].filter(Boolean).join(', ')

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <Link
        to="/employer/resumes"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Rezyumelarga qaytish
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Section title="Asosiy ma'lumotlar" icon={User}>
            <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
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
          </Section>

          <Section title="Ish istaklari">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {r.career_level_display && (
                <div><span className="text-gray-500">Daraja:</span> <span className="text-gray-900 font-medium">{r.career_level_display}</span></div>
              )}
              {r.expected_salary && (
                <div><span className="text-gray-500">Maosh:</span> <span className="text-gray-900 font-medium">{formatNumber(r.expected_salary)} so'm</span></div>
              )}
              {r.employment_type_display && (
                <div><span className="text-gray-500">Bandlik:</span> <span className="text-gray-900">{r.employment_type_display}</span></div>
              )}
              {r.work_mode_display && (
                <div><span className="text-gray-500">Rejim:</span> <span className="text-gray-900">{r.work_mode_display}</span></div>
              )}
              {r.employment_status_display && (
                <div className="md:col-span-2"><span className="text-gray-500">Holat:</span> <span className="text-gray-900">{r.employment_status_display}</span></div>
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

          {r.languages?.length > 0 && (
            <Section title="Tillar">
              <div className="flex flex-wrap gap-2">
                {r.languages.map((l) => (
                  <Pill key={l.id}>{l.language_display} — {l.level_display}</Pill>
                ))}
              </div>
            </Section>
          )}

          {r.work_experiences?.length > 0 && (
            <Section title="Ish tajribasi" icon={Briefcase}>
              <div className="space-y-4">
                {r.work_experiences.map((we) => (
                  <div key={we.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
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
                    {c.file_url && (
                      <a href={c.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:underline">
                        Sertifikatga o'tish
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 h-fit">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <Button
              size="lg"
              className="w-full"
              onClick={() => setInviteOpen(true)}
            >
              <Send className="w-4 h-4" />
              Taklif yuborish
            </Button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Nomzodga vakansiyangiz haqida xabar yuboring
            </p>
          </div>

          {activeVacancies.length > 0 && (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Mosligini taqqoslash uchun vakansiya
                </label>
                <select
                  value={matchVacancyId}
                  onChange={(e) => setMatchVacancyId(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="">Tanlang</option>
                  {activeVacancies.map((v) => (
                    <option key={v.id} value={v.id}>{v.profession_name}</option>
                  ))}
                </select>
              </div>
              {matchVacancyId && (
                <MatchCard
                  key={matchVacancyId}
                  vacancyId={matchVacancyId}
                  resumeId={r.id}
                  hasResume
                  title="AI: Nomzod sizga mosmi?"
                />
              )}
            </div>
          )}

          {(r.is_disabled || r.is_social_registry || r.has_driving_license) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Qo'shimcha</h3>
              <div className="flex flex-wrap gap-2">
                {r.is_disabled && <Pill color="green">Nogironlik</Pill>}
                {r.is_social_registry && <Pill color="green">Ijtimoiy reestr</Pill>}
                {r.has_driving_license && (
                  <Pill color="amber">
                    Haydovchilik {r.driving_license_categories && `(${r.driving_license_categories})`}
                  </Pill>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} resume={r} />
    </div>
  )
}

export default EmployerResumeDetailPage
