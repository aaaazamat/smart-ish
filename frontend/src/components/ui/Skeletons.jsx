/**
 * Skeleton komponentlar to'plami — sahifa yuklanish paytida
 * mazmun joyini "soxta" ko'rinishda ko'rsatadi.
 *
 * Foydalanish:
 *   {isLoading ? <VacancyCardSkeleton /> : <VacancyCard data={item} />}
 *
 * Bir vaqtning o'zida bir nechta skeleton ko'rsatish:
 *   {isLoading && <SkeletonList count={5} component={VacancyCardSkeleton} />}
 */
import Skeleton from 'react-loading-skeleton'

// ───────────────────────────────────────────────
// 1. Vakansiya kartochkasi — VacancyListPage uchun
// ───────────────────────────────────────────────
export function VacancyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Tashkilot logosi */}
        <Skeleton circle width={48} height={48} />

        <div className="flex-1 min-w-0">
          {/* Lavozim sarlavhasi */}
          <Skeleton height={22} width="60%" className="mb-2" />
          {/* Tashkilot nomi */}
          <Skeleton height={16} width="40%" className="mb-3" />

          {/* Belgilar (location, salary, work mode) */}
          <div className="flex gap-2 flex-wrap">
            <Skeleton height={26} width={90} borderRadius={13} />
            <Skeleton height={26} width={110} borderRadius={13} />
            <Skeleton height={26} width={80} borderRadius={13} />
          </div>
        </div>

        {/* Like button */}
        <Skeleton circle width={36} height={36} />
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────
// 2. Rezyume kartochkasi — ResumeListPage uchun
// ───────────────────────────────────────────────
export function ResumeCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <Skeleton circle width={56} height={56} />
        <div className="flex-1">
          <Skeleton height={20} width="50%" className="mb-2" />
          <Skeleton height={16} width="35%" className="mb-3" />
          <div className="flex gap-2">
            <Skeleton height={24} width={70} borderRadius={12} />
            <Skeleton height={24} width={90} borderRadius={12} />
            <Skeleton height={24} width={80} borderRadius={12} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────
// 3. Dashboard statistika kartochkasi
// ───────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
      <Skeleton height={14} width="50%" className="mb-3" />
      <Skeleton height={32} width="40%" className="mb-2" />
      <Skeleton height={12} width="60%" />
    </div>
  )
}

// ───────────────────────────────────────────────
// 4. Jadval qatori — Admin sahifalari uchun
// ───────────────────────────────────────────────
export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b border-neutral-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton height={16} />
        </td>
      ))}
    </tr>
  )
}

// ───────────────────────────────────────────────
// 5. Rezyume detali — to'liq sahifa
// ───────────────────────────────────────────────
export function ResumeDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Foydalanuvchi sarlavhasi */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <Skeleton circle width={80} height={80} />
          <div className="flex-1">
            <Skeleton height={24} width="40%" className="mb-2" />
            <Skeleton height={18} width="30%" className="mb-3" />
            <div className="flex gap-2">
              <Skeleton height={28} width={100} borderRadius={14} />
              <Skeleton height={28} width={120} borderRadius={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Ish tajribasi */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
        <Skeleton height={20} width={140} className="mb-4" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="mb-4">
            <Skeleton height={18} width="60%" className="mb-1" />
            <Skeleton height={14} width="40%" className="mb-2" />
            <Skeleton count={2} height={14} />
          </div>
        ))}
      </div>

      {/* Ko'nikmalar */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
        <Skeleton height={20} width={120} className="mb-4" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={28} width={70 + (i % 3) * 20} borderRadius={14} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────
// 6. Vakansiya detali — to'liq sahifa
// ───────────────────────────────────────────────
export function VacancyDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
        <Skeleton height={28} width="60%" className="mb-3" />
        <Skeleton height={18} width="35%" className="mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton height={28} width={90} borderRadius={14} />
          <Skeleton height={28} width={110} borderRadius={14} />
          <Skeleton height={28} width={80} borderRadius={14} />
        </div>
        <Skeleton count={4} height={14} />
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────
// 7. AI tavsiya kartochkasi (skor bilan)
// ───────────────────────────────────────────────
export function AiMatchCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton height={18} width="55%" className="mb-1" />
          <Skeleton height={14} width="35%" />
        </div>
        {/* Doiraviy skor */}
        <Skeleton circle width={56} height={56} />
      </div>
      <Skeleton count={2} height={12} />
      <div className="flex gap-1 mt-3">
        <Skeleton height={20} width={60} borderRadius={10} />
        <Skeleton height={20} width={75} borderRadius={10} />
        <Skeleton height={20} width={50} borderRadius={10} />
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────
// 8. Bildirishnoma elementi
// ───────────────────────────────────────────────
export function NotificationItemSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 flex gap-3">
      <Skeleton circle width={40} height={40} />
      <div className="flex-1">
        <Skeleton height={16} width="60%" className="mb-2" />
        <Skeleton height={12} width="90%" />
      </div>
      <Skeleton width={60} height={12} />
    </div>
  )
}

// ───────────────────────────────────────────────
// Yordamchi — N ta skeleton'ni ketma-ket ko'rsatish
// ───────────────────────────────────────────────
export function SkeletonList({ count = 3, Component = VacancyCardSkeleton, className = 'space-y-3' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  )
}

// Default export — eng ko'p ishlatilgani
export default Skeleton
