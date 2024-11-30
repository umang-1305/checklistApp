import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const inter = Poppins({ weight: "400", style: "normal", subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Checklist App',
  description: 'A customizable checklist application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

