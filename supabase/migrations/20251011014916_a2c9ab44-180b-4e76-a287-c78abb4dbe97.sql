-- Create table for IQ test results
CREATE TABLE public.iq_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id),
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 16,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.iq_test_results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert their test results
CREATE POLICY "Anyone can insert test results" 
ON public.iq_test_results 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to view test results (for now)
CREATE POLICY "Anyone can view test results" 
ON public.iq_test_results 
FOR SELECT 
USING (true);

-- Add index for better performance
CREATE INDEX idx_iq_test_results_lead_id ON public.iq_test_results(lead_id);
CREATE INDEX idx_iq_test_results_created_at ON public.iq_test_results(created_at);