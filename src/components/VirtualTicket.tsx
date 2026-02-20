import { useEffect, useRef, useState } from 'react';
import { useTicket, QueueEntry } from '@/hooks/useQueue';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Scissors, CheckCircle } from 'lucide-react';

const BELL_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Waiting: { label: 'Menunggu', color: 'bg-muted text-muted-foreground', icon: <Clock className="w-4 h-4" /> },
  Calling: { label: 'Dipanggil!', color: 'bg-primary text-primary-foreground', icon: <Bell className="w-4 h-4" /> },
  Processing: { label: 'Sedang Dilayani', color: 'bg-green-600 text-white', icon: <Scissors className="w-4 h-4" /> },
  Done: { label: 'Selesai', color: 'bg-muted text-muted-foreground', icon: <CheckCircle className="w-4 h-4" /> },
};

interface Props {
  ticketId: string;
}

export function VirtualTicket({ ticketId }: Props) {
  const { ticket, loading } = useTicket(ticketId);
  const [showOverlay, setShowOverlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevNotified = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio(BELL_SOUND_URL);
  }, []);

  useEffect(() => {
    if (ticket?.is_notified && !prevNotified.current) {
      audioRef.current?.play().catch(() => {});
      setShowOverlay(true);
      setTimeout(() => setShowOverlay(false), 5000);
    }
    prevNotified.current = ticket?.is_notified ?? false;
  }, [ticket?.is_notified]);

  if (loading) {
    return (
      <Card className="border-border bg-card animate-pulse">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Memuat tiket...</p>
        </CardContent>
      </Card>
    );
  }

  if (!ticket) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Tiket tidak ditemukan.</p>
        </CardContent>
      </Card>
    );
  }

  const config = statusConfig[ticket.status];

  return (
    <>
      {/* Notification Overlay */}
      {showOverlay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
          onClick={() => setShowOverlay(false)}
        >
          <div className="text-center animate-slide-up">
            <Bell className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
            <p className="text-5xl font-display font-bold text-primary mb-2">Silakan Masuk!</p>
            <p className="text-xl text-foreground/70">Antrean #{String(ticket.queue_number).padStart(3, '0')}</p>
          </div>
        </div>
      )}

      {/* Ticket Card */}
      <Card className="border-primary/30 bg-card animate-slide-up">
        <CardContent className="p-6 text-center space-y-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Nomor Antrean Anda</p>
          <p className="text-8xl font-display font-bold text-primary">
            {String(ticket.queue_number).padStart(3, '0')}
          </p>
          <p className="text-lg text-foreground/80">{ticket.customer_name}</p>
          <Badge className={`${config.color} text-sm px-4 py-1.5 gap-1.5`}>
            {config.icon}
            {config.label}
          </Badge>
          {ticket.type === 'FastTrack' && (
            <Badge variant="outline" className="border-primary text-primary ml-2">⚡ Fast Track</Badge>
          )}
        </CardContent>
      </Card>
    </>
  );
}
