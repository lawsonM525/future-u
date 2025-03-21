import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Future U',
  description: 'Your Future, Mapped Out. AI-Powered Strategy to get you from dreams to success.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
