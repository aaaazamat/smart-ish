export function formatNumber(n) {
  if (n === null || n === undefined || n === '') return ''
  return Number(n).toLocaleString('ru-RU').replace(/,/g, ' ')
}

export function formatSalary(from, to) {
  if (!from && !to) return 'Kelishilgan'
  if (from && to) return `${formatNumber(from)} dan ${formatNumber(to)} so'mgacha`
  if (from) return `${formatNumber(from)} so'mdan`
  return `${formatNumber(to)} so'mgacha`
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = d.getFullYear()
  return `${dd}.${mm}.${yy}`
}
