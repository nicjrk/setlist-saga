
-- Songs table
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  musical_key TEXT,
  verses_count INTEGER DEFAULT 0,
  intro_info TEXT,
  notes TEXT,
  structure JSONB NOT NULL DEFAULT '[]'::jsonb,
  reference_url TEXT,
  pdf_url TEXT,
  pdf_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Setlists table
CREATE TABLE public.setlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  song_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setlists ENABLE ROW LEVEL SECURITY;

-- Open access policies (shared band workspace)
CREATE POLICY "Anyone can view songs" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert songs" ON public.songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update songs" ON public.songs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete songs" ON public.songs FOR DELETE USING (true);

CREATE POLICY "Anyone can view setlists" ON public.setlists FOR SELECT USING (true);
CREATE POLICY "Anyone can insert setlists" ON public.setlists FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update setlists" ON public.setlists FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete setlists" ON public.setlists FOR DELETE USING (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER songs_updated_at BEFORE UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER setlists_updated_at BEFORE UPDATE ON public.setlists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('sheet-music', 'sheet-music', true);

CREATE POLICY "Anyone can view sheet music" ON storage.objects
  FOR SELECT USING (bucket_id = 'sheet-music');
CREATE POLICY "Anyone can upload sheet music" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'sheet-music');
CREATE POLICY "Anyone can update sheet music" ON storage.objects
  FOR UPDATE USING (bucket_id = 'sheet-music');
CREATE POLICY "Anyone can delete sheet music" ON storage.objects
  FOR DELETE USING (bucket_id = 'sheet-music');
