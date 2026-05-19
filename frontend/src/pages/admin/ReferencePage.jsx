import { useSearchParams } from 'react-router-dom'
import {
  MapPin, Map, Briefcase, Sparkles, Building2, GraduationCap,
  BookOpen, Database, Building,
} from 'lucide-react'
import {
  adminRegions,
  adminDistricts,
  adminProfessions,
  adminSkills,
  adminIndustries,
  adminUniversities,
  adminDirections,
  adminOrganizations,
} from '@/hooks/useAdminReference'
import { cn } from '@/lib/cn'
import ReferenceCrud from '@/components/admin/ReferenceCrud'

const TABS = [
  { key: 'regions', label: 'Hududlar', icon: MapPin },
  { key: 'districts', label: 'Tumanlar', icon: Map },
  { key: 'professions', label: 'Kasblar', icon: Briefcase },
  { key: 'skills', label: 'Ko\'nikmalar', icon: Sparkles },
  { key: 'industries', label: 'Sohalar', icon: Building2 },
  { key: 'universities', label: 'Universitetlar', icon: GraduationCap },
  { key: 'directions', label: 'Yo\'nalishlar', icon: BookOpen },
  { key: 'organizations', label: 'Tashkilotlar', icon: Building },
]

function DistrictsCrud() {
  const { data: regions = [] } = adminRegions.useList()
  return (
    <ReferenceCrud
      title="Tumanlar"
      hooks={adminDistricts}
      parentField="region"
      parentLabel="Hudud"
      parentOptions={regions}
      parentDisplayKey="region_name"
    />
  )
}

function DirectionsCrud() {
  const { data: universities = [] } = adminUniversities.useList()
  return (
    <ReferenceCrud
      title="Yo'nalishlar"
      hooks={adminDirections}
      parentField="university"
      parentLabel="Universitet"
      parentOptions={universities}
      parentDisplayKey="university_name"
    />
  )
}

function OrganizationsCrud() {
  // Tashkilot CRUD — Reference'dan ko'ra ko'proq maydon (INN, website)
  return (
    <ReferenceCrud
      title="Tashkilotlar"
      hooks={adminOrganizations}
      extraFields={[
        { key: 'inn', label: 'INN', placeholder: '300000000', type: 'text' },
        { key: 'website', label: 'Veb-sayt', placeholder: 'https://example.uz', type: 'url' },
        { key: 'description', label: "Tavsif", placeholder: 'Qisqacha tavsif', type: 'text' },
      ]}
    />
  )
}

function AdminReferencePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'regions'

  const setTab = (value) => {
    setSearchParams(value === 'regions' ? new URLSearchParams() : new URLSearchParams({ tab: value }))
  }

  const renderContent = () => {
    switch (tab) {
      case 'regions': return <ReferenceCrud title="Hududlar" hooks={adminRegions} />
      case 'districts': return <DistrictsCrud />
      case 'professions': return <ReferenceCrud title="Kasblar / Lavozimlar" hooks={adminProfessions} />
      case 'skills': return <ReferenceCrud title="Ko'nikmalar" hooks={adminSkills} />
      case 'industries': return <ReferenceCrud title="Sohalar" hooks={adminIndustries} />
      case 'universities': return <ReferenceCrud title="Universitetlar" hooks={adminUniversities} />
      case 'directions': return <DirectionsCrud />
      case 'organizations': return <OrganizationsCrud />
      default: return null
    }
  }

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Database className="w-7 h-7 text-brand-500" />
        <h1 className="text-3xl font-bold text-gray-900">Ma'lumotnoma</h1>
      </div>
      <p className="text-gray-500 mb-6">
        Tizim ma'lumotlarini boshqarish — hududlar, kasblar, ko'nikmalar va boshqalar
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="bg-white rounded-2xl border border-gray-200 p-3 h-fit lg:sticky lg:top-28">
          <nav className="space-y-1">
            {TABS.map((t) => {
              const Icon = t.icon
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left',
                    active
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className={cn('w-4 h-4', active ? 'text-brand-500' : 'text-gray-400')} />
                  {t.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default AdminReferencePage
