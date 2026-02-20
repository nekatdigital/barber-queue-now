import { useSearchParams } from 'react-router-dom';
import { useQueue } from '@/hooks/useQueue';
import { NowServing } from '@/components/NowServing';
import { TakeQueueForm } from '@/components/TakeQueueForm';
import { VirtualTicket } from '@/components/VirtualTicket';
import { Scissors } from 'lucide-react';

const Index = () => {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticket');
  const { nowServing, nextQueue, loading } = useQueue();

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="p-4 text-center border-b border-border">
        <div className="flex items-center justify-center gap-2">
          <Scissors className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-display font-bold tracking-wide text-foreground">
            BARBER<span className="text-primary">SHOP</span>
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">Sistem Antrean Digital</p>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Memuat...</p>
          </div>
        ) : ticketId ? (
          <>
            <NowServing nowServing={nowServing} nextQueue={nextQueue} />
            <VirtualTicket ticketId={ticketId} />
          </>
        ) : (
          <>
            <NowServing nowServing={nowServing} nextQueue={nextQueue} />
            <TakeQueueForm />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="p-3 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">Powered by Digital Queue System</p>
      </footer>
    </div>
  );
};

export default Index;
