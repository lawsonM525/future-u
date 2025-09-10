import { Space_Grotesk, Rubik_Mono_One } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Providers } from './providers'
import { ToastContainer } from '@/components/ui/toast'
import { Footer } from '@/components/Footer'
import { BetaBanner } from '@/components/BetaBanner'
import Script from 'next/script'
import { BrowserWarning } from '@/components/BrowserWarning'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk'
})

const rubikMonoOne = Rubik_Mono_One({ 
  subsets: ['latin'],
  weight: '400',
  variable: '--font-rubik-mono-one'
})

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
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${rubikMonoOne.variable}`}>
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-9Y008B0W5Z"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-9Y008B0W5Z');
            `,
          }}
        />
        <Script
          defer
          data-website-id="68b369d183c35f185a6d208d"
          data-domain="future-u.app"
          src="https://datafa.st/js/script.js"
        />
      </head>
      <body className={`font-sans bg-background text-foreground min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Providers>
            <BetaBanner />
            <BrowserWarning />
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
