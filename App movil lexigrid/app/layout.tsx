import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { LexiGridProvider } from '@/lib/lg/store'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'LexiGrid — Digitalización de formularios de aspirantes',
  description:
    'Prototipo de LexiGrid: captura móvil, revisión asistida por OCR y envío al CRM de formularios de aspirantes de la Universidad de San Buenaventura Cali.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1e3a6e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={geist.variable}>
      <body className="font-sans antialiased">
        <LexiGridProvider>{children}</LexiGridProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
