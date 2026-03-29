import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sovereign AI - Property Investment Agent',
  description: 'AI-driven property investment simulator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
