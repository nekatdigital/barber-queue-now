
-- Create queues table
CREATE TABLE public.queues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  queue_number INT8 NOT NULL,
  type TEXT NOT NULL DEFAULT 'Online' CHECK (type IN ('Online', 'Manual', 'FastTrack')),
  status TEXT NOT NULL DEFAULT 'Waiting' CHECK (status IN ('Waiting', 'Calling', 'Processing', 'Done')),
  is_notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a sequence for queue numbers that never resets
CREATE SEQUENCE public.queue_number_seq START WITH 1 INCREMENT BY 1 NO MAXVALUE NO CYCLE;

-- Set default for queue_number to use the sequence
ALTER TABLE public.queues ALTER COLUMN queue_number SET DEFAULT nextval('public.queue_number_seq');

-- Create settings table for admin PIN
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default admin PIN (1234)
INSERT INTO public.settings (key, value) VALUES ('admin_pin', '1234');

-- Enable RLS on both tables
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Queues: public read access
CREATE POLICY "Anyone can read queues"
  ON public.queues FOR SELECT
  USING (true);

-- Queues: public insert access (customers take a number)
CREATE POLICY "Anyone can insert queues"
  ON public.queues FOR INSERT
  WITH CHECK (true);

-- Queues: public update access (admin actions via PIN, no auth)
CREATE POLICY "Anyone can update queues"
  ON public.queues FOR UPDATE
  USING (true);

-- Settings: public read access (for PIN verification)
CREATE POLICY "Anyone can read settings"
  ON public.settings FOR SELECT
  USING (true);

-- Enable realtime on queues table
ALTER PUBLICATION supabase_realtime ADD TABLE public.queues;
