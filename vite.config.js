import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { loadSalon, SALON_FILE, GOOGLE_FILE } from './scripts/salon-data.mjs'
import { DAY_LABELS } from './src/lib/hours.js'

const VIRTUAL_ID = 'virtual:salon'
const RESOLVED_ID = '\0virtual:salon'

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function headTags(salon) {
  const abs = (url) => (salon.siteUrl && url.startsWith('/') ? salon.siteUrl + url : url)
  const meta = (attrs) => ({ tag: 'meta', attrs, injectTo: 'head' })
  const pad = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: salon.name,
    description: salon.description,
    telephone: salon.phone,
    image: abs(salon.seo.image),
    ...(salon.siteUrl && { url: salon.siteUrl }),
    ...(salon.email && { email: salon.email }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: salon.address.street || salon.address.full,
      addressLocality: salon.address.city,
      addressRegion: salon.address.state,
      postalCode: salon.address.postalCode,
      addressCountry: salon.address.country,
    },
    ...(salon.hours && {
      openingHoursSpecification: salon.hours.flatMap((ranges, day) =>
        ranges.map(([start, end]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: DAY_LABELS[day], opens: pad(start), closes: pad(end) })),
      ),
    }),
    ...(salon.ratingSource === 'google' && salon.reviewCountNumber && {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: salon.rating, reviewCount: salon.reviewCountNumber },
    }),
    ...(Object.keys(salon.social).length && { sameAs: Object.values(salon.social) }),
  }

  const tags = [
    { tag: 'title', children: escapeHtml(salon.seo.title), injectTo: 'head' },
    meta({ name: 'description', content: salon.seo.description }),
    meta({ name: 'keywords', content: salon.seo.keywords }),
    meta({ property: 'og:type', content: 'website' }),
    meta({ property: 'og:title', content: salon.seo.title }),
    meta({ property: 'og:description', content: salon.seo.description }),
    meta({ property: 'og:image', content: abs(salon.seo.image) }),
    meta({ name: 'twitter:card', content: 'summary_large_image' }),
    {
      tag: 'script',
      attrs: { type: 'application/ld+json' },
      children: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      injectTo: 'head',
    },
  ]
  if (salon.siteUrl) {
    tags.push({ tag: 'link', attrs: { rel: 'canonical', href: `${salon.siteUrl}/` }, injectTo: 'head' })
    tags.push(meta({ property: 'og:url', content: `${salon.siteUrl}/` }))
  }
  const themeCss = Object.entries(salon.theme).map(([k, v]) => `${k}:${v}`).join(';')
  if (themeCss) tags.push({ tag: 'style', children: `:root{${themeCss}}`, injectTo: 'head' })
  return tags
}

// Serves salon.json (merged with salon.google.json) to the app as `virtual:salon`
// and reloads the dev server whenever either file changes.
function salonPlugin() {
  let root
  let salon
  const files = () => [path.join(root, SALON_FILE), path.join(root, GOOGLE_FILE)]

  return {
    name: 'salon-data',
    configResolved(config) {
      root = config.root
    },
    buildStart() {
      salon = loadSalon(root)
      files().forEach((f) => this.addWatchFile(f))
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id === RESOLVED_ID) return `export default ${JSON.stringify(salon)}`
    },
    transformIndexHtml(html) {
      const abs = (url) => (salon.siteUrl && url.startsWith('/') ? salon.siteUrl + url : url)
      const faviconUrl = abs(salon.favicon || '/favicon.svg')
      const type = faviconUrl.endsWith('.png') ? 'image/png' : 'image/svg+xml'
      const updatedHtml = html.replace(
        /<link id="app-favicon"[^>]*>/,
        `<link id="app-favicon" rel="icon" type="${type}" href="${escapeHtml(faviconUrl)}" />`
      )
      return {
        html: updatedHtml,
        tags: headTags(salon),
      }
    },
    configureServer(server) {
      server.watcher.add(files())
      server.watcher.on('change', (file) => {
        if (!files().includes(path.resolve(file))) return
        try {
          salon = loadSalon(root)
        } catch (err) {
          server.config.logger.error(err.message)
          server.ws.send({ type: 'error', err: { message: err.message, stack: '' } })
          return
        }
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [salonPlugin(), react()],
})
