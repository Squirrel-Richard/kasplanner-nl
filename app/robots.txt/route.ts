import { NextResponse } from 'next/server'

export async function GET() {
  const robots = `User-agent: *
Allow: /
Allow: /prijzen
Disallow: /dashboard
Disallow: /scenarios
Disallow: /integraties
Disallow: /onboarding
Disallow: /api/

Sitemap: https://kasplanner.nl/sitemap.xml`

  return new NextResponse(robots, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
