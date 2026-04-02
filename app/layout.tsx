import './globals.css'
import type { Metadata } from 'next'
import ClientProviders from '@/components/ClientProviders'

export const metadata: Metadata = {
  title: 'Sovereign AI - Property Investment Agent',
  description: 'AI-driven property investment simulator',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders />
        {children}
      </body>
    </html>
  )
}
