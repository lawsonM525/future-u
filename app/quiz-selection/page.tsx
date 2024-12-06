import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const quizOptions = [
  {
    title: 'The Quickie',
    description: 'Short, quick insights. Rapid career snapshot.',
    questions: 10,
    href: '/quiz/quickie',
  },
  {
    title: 'I\'ve Got Some Time',
    description: 'Medium-depth career analysis. More detailed insights.',
    questions: 40,
    href: '/quiz/medium',
  },
  {
    title: 'The Deep Dive',
    description: 'Comprehensive career exploration. Thorough goal and situation assessment.',
    questions: 100,
    href: '/quiz/deep-dive',
  },
]

export default function QuizSelection() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 animate-slide-up">Choose Your Quiz</h1>
      <div className="grid gap-6 md:grid-cols-3">
        {quizOptions.map((option, index) => (
          <Card key={option.title} className={`w-full max-w-sm animate-slide-up`} style={{animationDelay: `${index * 0.1}s`}}>
            <CardHeader>
              <CardTitle>{option.title}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{option.questions} Questions</p>
              <Link href={option.href}>
                <Button variant="yellow" className="w-full font-bold">Start Quiz</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
