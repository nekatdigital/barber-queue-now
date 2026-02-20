import { useState, useEffect, useCallback } from 'react';
import { useQueue, getDailyCompletedCount } from '@/hooks/useQueue';
import { AdminPinForm } from '@/components/AdminPinForm';
import { AdminQueueCard } from '@/components/AdminQueueCard';
import { AddEntryDialog } from '@/components/AddEntryDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scissors, Share2, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
  const [verified, setVerified] = useState(() => localStorage.getItem('admin_verified') === 'true');
  const { queues, loading } = useQueue();
  const [dailyCount, setDailyCount] = useState(0);

  const fetchDailyCount = useCallback(async () => {
    const count = await getDailyCompletedCount();
    setDailyCount(count);
  }, []);

  useEffect(() => {
    if (verified) {
      fetchDailyCount();
      const interval = setInterval(fetchDailyCount, 10000);
      return () => clearInterval(interval);
    }
  }, [verified, fetchDailyCount]);

  // Refetch daily count whenever queues change
  useEffect(() => {
    if (verified) fetchDailyCount();
  }, [queues, verified, fetchDailyCount]);

  const handleShareWhatsApp = () => {
    const url = window.location.origin;
    const text = `✂️ Antrean Barbershop sedang buka! Ambil antrean online di: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    toast.success('Membuka WhatsApp...');
  };

  if (!verified) {
    return <AdminPinForm onSuccess={() => setVerified(true)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-display font-bold text-foreground">
              ADMIN <span className="text-primary">PANEL</span>
            </h1>
          </div>
          <Button size="sm" variant="outline" onClick={handleShareWhatsApp} className="gap-1.5">
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
        </div>
      </header>

      {/* Daily Stats */}
      <div className="p-4 pb-0">
        <Card className="border-primary/20 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Layanan Hari Ini</p>
              <p className="text-3xl font-display font-bold text-primary">{dailyCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pb-2 flex gap-2">
        <AddEntryDialog type="Manual" />
        <AddEntryDialog type="FastTrack" />
      </div>

      {/* Queue List */}
      <main className="flex-1 p-4 pt-2 space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Memuat...</p>
        ) : queues.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Belum ada antrean aktif.</p>
        ) : (
          queues.map((entry) => (
            <AdminQueueCard key={entry.id} entry={entry} />
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="p-3 text-center border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => {
            localStorage.removeItem('admin_verified');
            window.location.reload();
          }}
        >
          Logout
        </Button>
      </footer>
    </div>
  );
};

export default Admin;
