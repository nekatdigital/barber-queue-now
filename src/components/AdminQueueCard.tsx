import { QueueEntry, updateQueueStatus } from '@/hooks/useQueue';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Scissors, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  entry: QueueEntry;
}

export function AdminQueueCard({ entry }: Props) {
  const isFastTrack = entry.type === 'FastTrack';

  const handleCall = async () => {
    const ok = await updateQueueStatus(entry.id, 'Calling', true);
    if (ok) toast.success(`Memanggil ${entry.customer_name}`);
  };

  const handleStart = async () => {
    const ok = await updateQueueStatus(entry.id, 'Processing');
    if (ok) toast.success(`Memulai layanan ${entry.customer_name}`);
  };

  const handleDone = async () => {
    const ok = await updateQueueStatus(entry.id, 'Done');
    if (ok) toast.success(`${entry.customer_name} selesai!`);
  };

  return (
    <Card
      className={`border-border bg-card animate-slide-up ${
        isFastTrack ? 'gold-gradient-border animate-pulse-gold' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-display font-bold text-primary">
              {String(entry.queue_number).padStart(3, '0')}
            </span>
            <div>
              <p className="font-medium text-foreground">{entry.customer_name}</p>
              <div className="flex gap-1.5 mt-1">
                <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                  {entry.type}
                </Badge>
                <Badge
                  className={`text-xs ${
                    entry.status === 'Processing'
                      ? 'bg-green-600 text-white'
                      : entry.status === 'Calling'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {entry.status}
                </Badge>
                {isFastTrack && (
                  <Badge className="text-xs bg-primary/20 text-primary border border-primary/30">
                    ⚡ VIP
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {entry.status === 'Waiting' && (
            <Button size="sm" onClick={handleCall} className="flex-1 gap-1 font-display">
              <Bell className="w-3.5 h-3.5" /> Panggil
            </Button>
          )}
          {(entry.status === 'Waiting' || entry.status === 'Calling') && (
            <Button size="sm" variant="secondary" onClick={handleStart} className="flex-1 gap-1 font-display">
              <Scissors className="w-3.5 h-3.5" /> Mulai
            </Button>
          )}
          {entry.status !== 'Done' && (
            <Button size="sm" variant="outline" onClick={handleDone} className="flex-1 gap-1 font-display">
              <CheckCircle className="w-3.5 h-3.5" /> Selesai
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
