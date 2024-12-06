import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <h1 className="text-4xl font-bold mb-6 animate-slide-up">Welcome to Future U</h1>
      <p className="text-xl mb-8 text-center max-w-2xl animate-slide-up">
        Discover your personalized 10-year career development roadmap using AI and behavioral psychology principles.
      </p>
      <Link href="/quiz-selection">
        <Button 
          variant="yellow"
          size="lg" 
          className="animate-slide-up font-bold"
        >
          Start Your Career Journey
        </Button>
      </Link>
    </div>
  )
}
