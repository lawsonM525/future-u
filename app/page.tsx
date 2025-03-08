import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="fixed top-4 right-4 flex gap-4">
        <Link href="/login">
          <Button 
            variant="outline"
            size="lg"
            className="font-semibold"
          >
            Sign In
          </Button>
        </Link>
        <Link href="/quiz-selection">
          <Button 
            variant="yellow"
            size="lg"
            className="font-semibold"
          >
            Start Journey
          </Button>
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-6 animate-slide-up">Welcome to Future U</h1>
      <p className="text-xl mb-8 text-center max-w-2xl animate-slide-up">
      Your Future, Mapped Out.
      </p>
      {/*  AI-Powered Strategy to get you from dreams to success.  */}
      <Link href="/quiz-selection">
        <Button 
          variant="yellow"
          size="lg" 
          className="animate-slide-up font-bold"
        >
          Start Your Journey
        </Button>
      </Link>
    </div>
  )
}
