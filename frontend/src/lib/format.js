import i18n from '@/i18n'

export function formatNumber(n) {
  if (n === null || n === undefined || n === '') return ''
  return Number(n).toLocaleString('ru-RU').replace(/,/g, ' ')
}

export function formatSalary(from, to) {
  // i18n.t — React komponenti emas, shuning uchun i18n instance'dan to'g'ridan-to'g'ri
  const t = i18n.t.bind(i18n)
  if (!from && !to) return t('salary.negotiable')
  if (from && to) return t('salary.range', { from: formatNumber(from), to: formatNumber(to) })
  if (from) return t('salary.from', { from: formatNumber(from) })
  return t('salary.to', { to: formatNumber(to) })
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = d.getFullYear()
  return `${dd}.${mm}.${yy}`
}
