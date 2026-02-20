import { useState } from 'react';
import { verifyPin } from '@/hooks/useQueue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onSuccess: () => void;
}

export function AdminPinForm({ onSuccess }: Props) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (pin.length < 4) return;
    setLoading(true);
    const valid = await verifyPin(pin);
    setLoading(false);

    if (valid) {
      localStorage.setItem('admin_verified', 'true');
      onSuccess();
    } else {
      toast.error('PIN salah!');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-primary/20 bg-card">
        <CardHeader className="text-center">
          <Lock className="w-10 h-10 text-primary mx-auto mb-2" />
          <CardTitle className="font-display text-2xl">Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground">Masukkan PIN untuk masuk</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <InputOTP maxLength={4} value={pin} onChange={setPin}>
            <InputOTPGroup>
              <InputOTPSlot index={0} className="border-border bg-secondary" />
              <InputOTPSlot index={1} className="border-border bg-secondary" />
              <InputOTPSlot index={2} className="border-border bg-secondary" />
              <InputOTPSlot index={3} className="border-border bg-secondary" />
            </InputOTPGroup>
          </InputOTP>
          <Button onClick={handleVerify} disabled={pin.length < 4 || loading} className="w-full font-display">
            {loading ? 'Verifikasi...' : 'Masuk'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
