import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { takeQueue } from '@/hooks/useQueue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export function TakeQueueForm() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const entry = await takeQueue(name.trim());
    setLoading(false);

    if (entry) {
      navigate(`/?ticket=${entry.id}`);
    } else {
      toast.error('Gagal mengambil antrean. Coba lagi.');
    }
  };

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Ambil Antrean
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Nama Anda..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-secondary border-border"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !name.trim()} className="font-display shrink-0">
            {loading ? '...' : 'Ambil'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
