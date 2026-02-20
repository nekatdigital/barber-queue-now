import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface QueueEntry {
  id: string;
  customer_name: string;
  queue_number: number;
  type: 'Online' | 'Manual' | 'FastTrack';
  status: 'Waiting' | 'Calling' | 'Processing' | 'Done';
  is_notified: boolean;
  created_at: string;
}

export function useQueue() {
  const [queues, setQueues] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueues = useCallback(async () => {
    const { data, error } = await supabase
      .from('queues')
      .select('*')
      .in('status', ['Waiting', 'Calling', 'Processing'])
      .order('created_at', { ascending: true });

    if (!error && data) {
      setQueues(data as QueueEntry[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQueues();

    const channel = supabase
      .channel('queues-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, () => {
        fetchQueues();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchQueues]);

  const sortedQueues = [...queues].sort((a, b) => {
    const statusOrder = { Processing: 0, Calling: 1, Waiting: 2 };
    const aOrder = statusOrder[a.status] ?? 3;
    const bOrder = statusOrder[b.status] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    
    // Within same status, FastTrack comes first
    if (a.status === 'Waiting' && b.status === 'Waiting') {
      if (a.type === 'FastTrack' && b.type !== 'FastTrack') return -1;
      if (a.type !== 'FastTrack' && b.type === 'FastTrack') return 1;
    }
    
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const nowServing = sortedQueues.find(q => q.status === 'Processing');
  const nextQueue = sortedQueues.find(q => q.status === 'Waiting' || q.status === 'Calling');

  return { queues: sortedQueues, nowServing, nextQueue, loading, refetch: fetchQueues };
}

export function useTicket(ticketId: string | null) {
  const [ticket, setTicket] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('queues')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (!error && data) {
      setTicket(data as QueueEntry);
    }
    setLoading(false);
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();

    if (!ticketId) return;

    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'queues',
        filter: `id=eq.${ticketId}`,
      }, (payload) => {
        setTicket(payload.new as QueueEntry);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, fetchTicket]);

  return { ticket, loading };
}

export async function takeQueue(name: string): Promise<QueueEntry | null> {
  const { data, error } = await supabase
    .from('queues')
    .insert({ customer_name: name, type: 'Online' })
    .select()
    .single();

  if (error) return null;
  return data as QueueEntry;
}

export async function addManualEntry(name: string, type: 'Manual' | 'FastTrack' = 'Manual'): Promise<QueueEntry | null> {
  const { data, error } = await supabase
    .from('queues')
    .insert({ customer_name: name, type })
    .select()
    .single();

  if (error) return null;
  return data as QueueEntry;
}

export async function updateQueueStatus(id: string, status: string, isNotified?: boolean) {
  const update: Record<string, unknown> = { status };
  if (isNotified !== undefined) update.is_notified = isNotified;

  const { error } = await supabase
    .from('queues')
    .update(update)
    .eq('id', id);

  return !error;
}

export async function verifyPin(pin: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'admin_pin')
    .single();

  if (error || !data) return false;
  return data.value === pin;
}

export async function archiveCompleted(): Promise<boolean> {
  const { error } = await supabase
    .from('queues')
    .update({ status: 'Done' })
    .eq('status', 'Done');

  // Actually we just need to filter them out in the query, they're already Done
  return !error;
}

export async function getDailyCompletedCount(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('queues')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Done')
    .gte('created_at', today.toISOString());

  if (error) return 0;
  return count ?? 0;
}
