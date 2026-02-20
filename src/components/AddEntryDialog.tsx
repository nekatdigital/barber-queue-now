import { useState } from 'react';
import { addManualEntry } from '@/hooks/useQueue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  type: 'Manual' | 'FastTrack';
}

export function AddEntryDialog({ type }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const entry = await addManualEntry(name.trim(), type);
    setLoading(false);

    if (entry) {
      toast.success(`${name} ditambahkan (${type})`);
      setName('');
      setOpen(false);
    } else {
      toast.error('Gagal menambahkan.');
    }
  };

  const isFastTrack = type === 'FastTrack';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isFastTrack ? 'default' : 'secondary'}
          className={`gap-1.5 font-display ${isFastTrack ? '' : ''}`}
        >
          {isFastTrack ? <Zap className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {isFastTrack ? 'Fast Track' : 'Walk-in'}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            {isFastTrack ? <Zap className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5" />}
            {isFastTrack ? 'Fast Track (VIP)' : 'Tambah Walk-in'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Nama pelanggan..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-secondary border-border"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={!name.trim() || loading} className="font-display shrink-0">
            Tambah
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
