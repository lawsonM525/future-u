import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

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
  // Get this from Google Cloud Console
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            {children}
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

