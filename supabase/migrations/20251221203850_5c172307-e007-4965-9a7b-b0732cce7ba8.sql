-- Drop existing insert policy for prompts
DROP POLICY IF EXISTS "Editors can create prompts" ON public.prompts;

-- Create new policy allowing all authenticated users to create prompts
CREATE POLICY "Authenticated users can create prompts" 
ON public.prompts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- Also allow users to view their own prompts (regardless of status or role)
DROP POLICY IF EXISTS "Editors can view own prompts" ON public.prompts;
CREATE POLICY "Users can view own prompts" 
ON public.prompts 
FOR SELECT 
USING (created_by = auth.uid());

-- Allow users to update their own prompts
DROP POLICY IF EXISTS "Editors can update own prompts" ON public.prompts;
CREATE POLICY "Users can update own prompts" 
ON public.prompts 
FOR UPDATE 
USING (created_by = auth.uid());

-- Allow users to delete their own prompts
DROP POLICY IF EXISTS "Editors can delete own prompts" ON public.prompts;
CREATE POLICY "Users can delete own prompts" 
ON public.prompts 
FOR DELETE 
USING (created_by = auth.uid());