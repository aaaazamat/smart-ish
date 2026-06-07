import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'SmartIsh'
const SITE_URL = 'https://smart-ish.vercel.app'
const DEFAULT_DESC =
  "SmartIsh — sun'iy intellekt yordamida ish izlash platformasi. " +
  "O'zbekistondagi minglab vakansiyalar va nomzodlar bir joyda."
const DEFAULT_IMAGE = `${SITE_URL}/favicon.svg`

/**
 * Har sahifa uchun SEO meta teglari (title, description, Open Graph, canonical).
 *
 * Props:
 *   title       — sahifa sarlavhasi (SITE_NAME avtomatik qo'shiladi)
 *   description — meta description (bo'lmasa default)
 *   path        — kanonik yo'l, masalan "/vacancies/41"
 *   image       — OG rasm (ijtimoiy tarmoq preview)
 *   jsonLd      — structured data obyekti (ixtiyoriy)
 */
export default function Seo({ title, description, path = '', image, jsonLd }) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — AI yordamida ish topish`
  const desc = (description || DEFAULT_DESC).slice(0, 300)
  const url = SITE_URL + path
  const img = image || DEFAULT_IMAGE

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      {/* Open Graph (Telegram, Facebook, LinkedIn preview) */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}
