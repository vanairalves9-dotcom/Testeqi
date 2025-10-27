-- Add payment tracking columns to leads table
ALTER TABLE public.leads 
ADD COLUMN payment_confirmed boolean NOT NULL DEFAULT false,
ADD COLUMN payment_id text,
ADD COLUMN payment_status text,
ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Create index for faster payment_id lookups
CREATE INDEX idx_leads_payment_id ON public.leads(payment_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_timestamp
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION update_leads_updated_at();

-- Update RLS policy to allow webhook to update payment status
CREATE POLICY "Allow webhook to update payment status"
ON public.leads
FOR UPDATE
USING (true)
WITH CHECK (true);