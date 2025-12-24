-- Create visibility enum
CREATE TYPE public.prompt_visibility AS ENUM ('public', 'private');

-- Add visibility column to prompts table (default to private)
ALTER TABLE public.prompts 
ADD COLUMN visibility public.prompt_visibility NOT NULL DEFAULT 'private';

-- Update existing published prompts to be public
UPDATE public.prompts SET visibility = 'public' WHERE status = 'published';

-- Update RLS policy to show public prompts to anyone
DROP POLICY IF EXISTS "Anyone can view published prompts" ON public.prompts;
CREATE POLICY "Anyone can view public prompts" 
ON public.prompts 
FOR SELECT 
USING (visibility = 'public' AND status = 'published');