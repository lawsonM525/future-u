import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Future Career Quiz — Find Your Direction',
  description:
    'Take the Future U career quiz to discover your strengths, clarify your path, and generate an AI-powered career strategy you can act on today.',
  keywords: [
    'future career quiz',
    'career path planning',
    'how to figure out my dream job',
    'career direction app',
    'career roadmap generator',
  ],
  openGraph: {
    title: 'Future Career Quiz — Find Your Direction',
    description:
      'Discover your strengths and generate a personalized career strategy with Future U\'s AI-powered quiz.',
    url: 'https://future-u.app/quiz-selection',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Future Career Quiz — Find Your Direction',
    description:
      'Discover your strengths and generate a personalized career strategy with Future U\'s AI-powered quiz.',
  },
}

export default function QuizSelectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
