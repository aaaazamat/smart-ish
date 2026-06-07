/**
 * Build paytida sitemap.xml ni STATIK faylga yozadi.
 *
 * Nega: Render bepul tarifda uxlab qoladi. Agar Google sitemap'ni to'g'ridan-
 * to'g'ri backend'dan so'rasa, cold-start sabab timeout bo'lishi mumkin
 * ("Не получено"). Build paytida bir marta olib, Vercel'da statik fayl
 * sifatida beramiz — har doim tez va ishonchli.
 *
 * Manba: backend /sitemap.xml (u FRONTEND_URL bilan to'g'ri URL'lar qaytaradi).
 * Backend javob bermasa — minimal fallback (asosiy sahifalar) yoziladi.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const BACKEND =
  process.env.SITEMAP_SOURCE || 'https://osonish-backend.onrender.com/sitemap.xml'
const FRONTEND = process.env.SITE_URL || 'https://smart-ish.vercel.app'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml')

const FALLBACK = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${FRONTEND}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
<url><loc>${FRONTEND}/vacancies</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
<url><loc>${FRONTEND}/resumes</loc><changefreq>daily</changefreq><priority>0.7</priority></url>
</urlset>
`

async function main() {
  try {
    const ctrl = new AbortController()
    // Render cold-start uchun saxiy 90 soniya
    const timer = setTimeout(() => ctrl.abort(), 90_000)
    const res = await fetch(`${BACKEND}?build=${Date.now()}`, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()
    if (!xml.includes('<urlset')) throw new Error('yaroqsiz XML')
    writeFileSync(OUT, xml)
    const count = (xml.match(/<url>/g) || []).length
    console.log(`[sitemap] OK — backend'dan ${count} ta URL olindi -> public/sitemap.xml`)
  } catch (e) {
    console.warn(`[sitemap] Backend'dan olib bo'lmadi (${e.message}). Fallback yoziladi.`)
    writeFileSync(OUT, FALLBACK)
  }
}

main()
