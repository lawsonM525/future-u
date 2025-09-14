import { Space_Grotesk, Rubik_Mono_One } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Providers } from './providers'
import { ToastContainer } from '@/components/ui/toast'
import { Footer } from '@/components/Footer'
import Script from 'next/script'
import { BrowserWarning } from '@/components/BrowserWarning'
import type { Metadata } from 'next'


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

export const metadata: Metadata = {
  metadataBase: new URL('https://future-u.app'),
  applicationName: 'Future U',
  title: {
    default: 'Future U — Your Future, Mapped Out',
    template: '%s | Future U',
  },
  description:
    'Future U is the AI-powered career and life planning app. Build your career strategy, set goals, track daily progress, and level up toward your dream future.',
  keywords: [
    // Core
    'future u app',
    'future you app',
    'career planning app',
    'life planning tool',
    'goal tracking system',
    'personal development app',
    'self improvement platform',
    // Career & Growth
    'career path planning',
    'how to figure out my dream job',
    'career strategy tool',
    'career roadmap generator',
    'future career quiz',
    'career direction app',
    'job planning tool',
    // Productivity & Goals
    'goal setting app',
    'goal tracker for students',
    'daily progress tracker',
    'personal accountability tool',
    'quest tracker app',
    'habit tracking with rewards',
    'glow up progress tracker',
    // Identity & Aspirational
    'design your dream life',
    'how to become the best version of yourself',
    'how to achieve anything you imagine',
    'life direction tool',
    'build your dream future',
    'leveling up system',
    // Gen Z / Community
    'gen z career tools',
    'student productivity apps',
    'how to balance school and building',
    'fun goal tracking for students',
    'future planning for young adults',
  ],
  openGraph: {
    type: 'website',
    url: 'https://future-u.app/',
    siteName: 'Future U',
    title: 'Future U — Your Future, Mapped Out',
    description:
      'AI-powered career strategy and life planning. Turn dreams into daily progress with goals, quests, and rewards.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@futureu_app',
    creator: '@futureu_app',
    title: 'Future U — Your Future, Mapped Out',
    description:
      'AI-powered career strategy and life planning. Turn dreams into daily progress with goals, quests, and rewards.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
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
        {/* Structured Data for AI/SEO */}
        <Script
          id="ld-org"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Future U',
              url: 'https://future-u.app',
              logo: 'https://future-u.app/icons/coach.png',
              sameAs: [
                'https://future-u.app',
              ],
              description:
                'Future U is an AI-powered career and life planning app to design your dream future, set goals, and track daily progress.',
            }),
          }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Future U',
              url: 'https://future-u.app',
              inLanguage: 'en-US',
              about: {
                '@type': 'Thing',
                name: 'AI career planning and goal tracking for students and young adults',
              },
              potentialAction: {
                '@type': 'RegisterAction',
                target: 'https://future-u.app/signup',
              },
            }),
          }}
        />
        <Script
          id="ld-software-app"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Future U',
              applicationCategory: 'ProductivityApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              description:
                'Future U helps you map your career path, set goals, and stay accountable with quests and rewards.',
              url: 'https://future-u.app',
            }),
          }}
        />
      </head>
      <body className={`font-sans bg-background text-foreground min-h-screen flex flex-col`}>
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
