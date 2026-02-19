import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'KasPlanner — Cashflow forecasting voor Nederlands MKB',
    template: '%s | KasPlanner',
  },
  description:
    'Altijd weten hoeveel geld er over 30, 60 en 90 dagen op je rekening staat. Koppel Moneybird of e-Boekhouden en zie direct je cashflow forecast.',
  keywords: [
    'cashflow planning MKB',
    'Moneybird cashflow',
    'liquiditeitsplanning Nederland',
    'cashflow forecast software NL',
    'e-Boekhouden koppeling cashflow',
    'kasplanner',
    'cashflow forecast MKB',
  ],
  authors: [{ name: 'AIOW BV' }],
  metadataBase: new URL('https://kasplanner.nl'),
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://kasplanner.nl',
    siteName: 'KasPlanner',
    title: 'KasPlanner — Cashflow forecasting voor Nederlands MKB',
    description:
      'Altijd weten hoeveel geld er over 30, 60 en 90 dagen op je rekening staat.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KasPlanner — Cashflow forecasting voor Nederlands MKB',
    description: 'Koppel Moneybird of e-Boekhouden en zie direct je cashflow forecast.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
