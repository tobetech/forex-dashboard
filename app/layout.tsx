import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Forex Dashboard',
  description: 'Trading performance dashboard powered by Supabase',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen antialiased transition-colors duration-200">
        {children}
      </body>
    </html>
  )
}
