-- Step 1: Add user_id column to feedback table
ALTER TABLE public.feedback
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid();

-- Step 2: Create index for performance
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);

-- Step 3: Drop existing insecure RLS policies
DROP POLICY IF EXISTS "Authenticated users can read feedback" ON public.feedback;
DROP POLICY IF EXISTS "Authenticated users can submit feedback" ON public.feedback;

-- Step 4: Create new user-scoped RLS policies

-- Users can only view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.feedback
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Users can only insert feedback as themselves
CREATE POLICY "Users can insert their own feedback"
ON public.feedback
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback
CREATE POLICY "Users can update their own feedback"
ON public.feedback
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own feedback
CREATE POLICY "Users can delete their own feedback"
ON public.feedback
FOR DELETE TO authenticated
USING (auth.uid() = user_id);