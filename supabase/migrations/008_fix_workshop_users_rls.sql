-- Fix RLS Policy for workshop_users to avoid recursion error

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view workshop memberships" ON workshop_users;

-- Create simpler policy without recursion
CREATE POLICY "Users can view workshop memberships"
ON workshop_users FOR SELECT
USING (
  user_id = auth.uid()
);

-- Note: Owners viewing other members will be handled at application level
-- This policy allows users to see their own workshop memberships
