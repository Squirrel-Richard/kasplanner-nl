import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://kasplanner.nl'
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/prijzen', priority: '0.9', changefreq: 'monthly' },
    { url: '/onboarding', priority: '0.8', changefreq: 'monthly' },
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
