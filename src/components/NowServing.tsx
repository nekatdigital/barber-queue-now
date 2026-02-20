import { QueueEntry } from '@/hooks/useQueue';
import { Card, CardContent } from '@/components/ui/card';
import { Scissors } from 'lucide-react';

interface Props {
  nowServing: QueueEntry | undefined;
  nextQueue: QueueEntry | undefined;
}

export function NowServing({ nowServing, nextQueue }: Props) {
  return (
    <div className="space-y-4">
      {/* Now Serving */}
      <Card className="border-primary/30 bg-card animate-slide-up">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Scissors className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Now Serving</p>
          </div>
          {nowServing ? (
            <>
              <p className="text-7xl font-display font-bold text-primary animate-pulse-gold">
                {String(nowServing.queue_number).padStart(3, '0')}
              </p>
              <p className="text-lg text-foreground/80 mt-2">{nowServing.customer_name}</p>
            </>
          ) : (
            <p className="text-3xl font-display text-muted-foreground">---</p>
          )}
        </CardContent>
      </Card>

      {/* Next Queue */}
      <Card className="border-border bg-secondary/50">
        <CardContent className="p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Next</p>
          {nextQueue ? (
            <p className="text-3xl font-display font-bold text-foreground">
              {String(nextQueue.queue_number).padStart(3, '0')}
            </p>
          ) : (
            <p className="text-2xl font-display text-muted-foreground">---</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
