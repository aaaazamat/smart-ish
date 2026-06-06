import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { adminApi } from '@/api/endpoints'

// Brand-mos rang palitralari
const C = {
  users: '#149AAB',
  vacancies: '#8B5CF6',
  applications: '#F59E0B',
}
const ROLE_COLORS = { job_seeker: '#3B82F6', employer: '#10B981', admin: '#6B7280' }
const STATUS_COLORS = {
  pending: '#F59E0B', viewed: '#3B82F6', accepted: '#10B981',
  interview: '#6366F1', hired: '#059669', rejected: '#EF4444',
}

function Card({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// timeline endpointdagi alohida massivlarni uzluksiz kunlik o'qqa birlashtirish
function buildTimeline(data) {
  if (!data?.since) return []
  const byDate = {}
  const add = (arr, key) =>
    (arr || []).forEach((r) => {
      byDate[r.date] = byDate[r.date] || {}
      byDate[r.date][key] = r.count
    })
  add(data.users, 'users')
  add(data.vacancies, 'vacancies')
  add(data.applications, 'applications')

  const out = []
  const end = new Date(data.until)
  for (let d = new Date(data.since); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10)
    const e = byDate[iso] || {}
    out.push({
      date: iso,
      users: e.users || 0,
      vacancies: e.vacancies || 0,
      applications: e.applications || 0,
    })
  }
  return out
}

const fmtDay = (iso) => {
  const [, m, d] = iso.split('-')
  return `${d}.${m}`
}

const RANGES = [
  { label: '7 kun', value: 7 },
  { label: '30 kun', value: 30 },
  { label: '90 kun', value: 90 },
]

function TimelineChart() {
  const [days, setDays] = useState(30)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats-timeline', days],
    queryFn: () => adminApi.statsTimeline({ days }),
  })
  const series = buildTimeline(data)
  const tickStep = Math.max(1, Math.floor(series.length / 8))

  return (
    <Card
      title="Faollik dinamikasi"
      subtitle="Kunlik yangi foydalanuvchi, vakansiya va ariza"
      className="col-span-1 lg:col-span-2"
    >
      <div className="flex gap-1.5 mb-3">
        {RANGES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setDays(r.value)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              days === r.value
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
          Yuklanmoqda...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={series} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              {Object.entries(C).map(([k, color]) => (
                <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDay}
              interval={tickStep - 1}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <Tooltip
              labelFormatter={fmtDay}
              formatter={(v, name) => [v, { users: 'Foydalanuvchi', vacancies: 'Vakansiya', applications: 'Ariza' }[name] || name]}
              contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
            />
            <Legend
              formatter={(name) => ({ users: 'Foydalanuvchi', vacancies: 'Vakansiya', applications: 'Ariza' }[name] || name)}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Area type="monotone" dataKey="users" stroke={C.users} fill="url(#g-users)" strokeWidth={2} />
            <Area type="monotone" dataKey="vacancies" stroke={C.vacancies} fill="url(#g-vacancies)" strokeWidth={2} />
            <Area type="monotone" dataKey="applications" stroke={C.applications} fill="url(#g-applications)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

function DonutChart({ title, subtitle, data, colors }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) {
    return (
      <Card title={title} subtitle={subtitle}>
        <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
          Ma'lumot yo'q
        </div>
      </Card>
    )
  }
  return (
    <Card title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, n) => [`${v} (${Math.round((v / total) * 100)}%)`, n]}
            contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}

function TopBarChart({ title, subtitle, rows, color }) {
  const data = (rows || []).filter((r) => r.count > 0).slice(0, 7)
  if (data.length === 0) {
    return (
      <Card title={title} subtitle={subtitle}>
        <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
          Ma'lumot yo'q
        </div>
      </Card>
    )
  }
  return (
    <Card title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 11, fill: '#374151' }}
          />
          <Tooltip
            cursor={{ fill: '#F9FAFB' }}
            contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
            formatter={(v) => [v, 'Faol vakansiya']}
          />
          <Bar dataKey="count" fill={color} radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

export default function DashboardCharts({ overview }) {
  const u = overview?.users || {}
  const v = overview?.vacancies || {}
  const a = overview?.applications || {}

  const { data: top } = useQuery({
    queryKey: ['admin-stats-top'],
    queryFn: () => adminApi.statsTop(),
  })

  const roleData = [
    { name: 'Ish izlovchi', value: u.by_role?.job_seeker || 0, key: 'job_seeker' },
    { name: 'Ish beruvchi', value: u.by_role?.employer || 0, key: 'employer' },
    { name: 'Admin', value: u.by_role?.admin || 0, key: 'admin' },
  ]
  const statusData = [
    { name: 'Kutilmoqda', value: a.pending || 0, key: 'pending' },
    { name: "Ko'rildi", value: a.viewed || 0, key: 'viewed' },
    { name: 'Qabul', value: a.accepted || 0, key: 'accepted' },
    { name: 'Suhbat', value: a.interview || 0, key: 'interview' },
    { name: 'Ishga olindi', value: a.hired || 0, key: 'hired' },
    { name: 'Rad etildi', value: a.rejected || 0, key: 'rejected' },
  ].filter((d) => d.value > 0)
  const vacancyData = [
    { name: 'Faol', value: v.active || 0 },
    { name: 'Yopiq', value: v.closed || 0 },
  ]

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Diagrammalar
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <TimelineChart />
        <DonutChart
          title="Foydalanuvchilar (rol)"
          subtitle="Rol bo'yicha taqsimot"
          data={roleData}
          colors={roleData.map((d) => ROLE_COLORS[d.key])}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DonutChart
          title="Arizalar holati"
          subtitle="Bosqichlar bo'yicha"
          data={statusData}
          colors={statusData.map((d) => STATUS_COLORS[d.key])}
        />
        <TopBarChart
          title="Top kasblar"
          subtitle="Faol vakansiyalar soni"
          rows={top?.top_professions}
          color="#149AAB"
        />
        <TopBarChart
          title="Top hududlar"
          subtitle="Faol vakansiyalar soni"
          rows={top?.top_regions}
          color="#8B5CF6"
        />
      </div>
    </div>
  )
}
