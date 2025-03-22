import { TimelineCheckpoint } from '@/models/Timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TimelineProps {
  checkpoints: TimelineCheckpoint[]
}

export function Timeline({ checkpoints }: TimelineProps) {
  return (
    <Card className="border-accent">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-accent">Your Journey to Hero Level</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-accent/20" />
        <div className="space-y-8">
          {checkpoints.map((checkpoint, index) => (
            <div key={checkpoint.year} className="relative pl-8">
              <div className="absolute left-0 w-8 flex items-center">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <div className="flex-1 h-0.5 bg-accent/20" />
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold text-accent">{checkpoint.year}</span>
                  {index === checkpoints.length - 1 && (
                    <span className="text-sm font-medium text-yellow-500">Hero Level 🏆</span>
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
