import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Providers } from './providers'
import { ToastContainer } from '@/components/ui/toast'
import { Footer } from '@/components/Footer'

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
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Providers>
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ToastContainer />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
