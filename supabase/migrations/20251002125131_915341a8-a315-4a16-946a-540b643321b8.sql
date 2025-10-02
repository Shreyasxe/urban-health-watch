-- Update feedback table RLS policies to require authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read feedback" ON public.feedback;
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;

-- Create new authenticated policies
CREATE POLICY "Authenticated users can read feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can submit feedback"
ON public.feedback
FOR INSERT
TO authenticated
WITH CHECK (true);