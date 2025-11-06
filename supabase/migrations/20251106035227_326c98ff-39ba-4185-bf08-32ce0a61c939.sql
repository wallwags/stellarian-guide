-- Create dreams table with RLS
CREATE TABLE public.dreams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dream_text text NOT NULL,
  analysis jsonb,
  created_at timestamptz DEFAULT now(),
  is_favorite boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dreams
CREATE POLICY "Users can view their own dreams"
  ON public.dreams
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dreams"
  ON public.dreams
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dreams"
  ON public.dreams
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dreams"
  ON public.dreams
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add astro_data column to profiles
ALTER TABLE public.profiles ADD COLUMN astro_data jsonb;

-- Create index for better performance
CREATE INDEX idx_dreams_user_id ON public.dreams(user_id);
CREATE INDEX idx_dreams_created_at ON public.dreams(created_at DESC);