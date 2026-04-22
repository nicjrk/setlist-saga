
-- Band members table
CREATE TABLE public.band_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  instruments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.band_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view band_members" ON public.band_members FOR SELECT USING (true);
CREATE POLICY "Anyone can insert band_members" ON public.band_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update band_members" ON public.band_members FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete band_members" ON public.band_members FOR DELETE USING (true);

CREATE TRIGGER band_members_updated_at BEFORE UPDATE ON public.band_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add intro_starter_ids to songs (list of band_member IDs who start the intro)
ALTER TABLE public.songs
  ADD COLUMN intro_starter_ids JSONB NOT NULL DEFAULT '[]'::jsonb;
