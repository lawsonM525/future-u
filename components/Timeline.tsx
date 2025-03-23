import { TimelineCheckpoint } from '@/models/Timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TimelineProps {
  checkpoints: TimelineCheckpoint[]
}

export function Timeline({ checkpoints }: TimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-accent">Your Journey to Future U</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-accent/20" />
        <div className="space-y-8">
          {checkpoints.map((checkpoint, index) => (
            <div key={checkpoint.year} className="relative pl-8">
              <div className="absolute left-0 w-8 flex items-center">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <div className="flex-1 h-0.5 bg-accent/20" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-accent">{checkpoint.year}</span>
                  <span className="text-xl font-semibold">{checkpoint.title}</span>
                  {index === checkpoints.length - 1 && (
                    <span className="ml-2 px-2 py-0.5 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">Hero Level 🏆</span>
                  )}
                </div>
                <p className="text-muted-foreground">{checkpoint.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
