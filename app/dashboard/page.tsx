import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function Dashboard() {
  return (
    <div className="min-h-screen p-4 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 animate-slide-up">Your Career Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {['Recent Quiz Results', 'Career Goals', 'Recommendation Feed'].map((title, index) => (
          <Card key={title} className={`animate-slide-up`} style={{animationDelay: `${index * 0.1}s`}}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{title === 'Recent Quiz Results' ? "You haven't taken any quizzes yet." : 
                  title === 'Career Goals' ? "Set your career goals to track your progress." :
                  "Personalized career advice will appear here."}</p>
              {title === 'Recent Quiz Results' ? (
                <Button variant="yellow" className="mt-4 font-bold">
                  Take Career Values Assessment
                </Button>
              ) : title === 'Career Goals' ? (
                <Button variant="yellow" className="mt-4 font-bold">
                  Take Skills Assessment
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
