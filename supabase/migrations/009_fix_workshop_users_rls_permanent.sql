-- Permanent fix: Ultra-simple RLS policy for workshop_users
-- No subqueries, no recursion, just direct user_id check

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view workshop memberships" ON workshop_users;
DROP POLICY IF EXISTS "Owners can manage workshop users" ON workshop_users;
DROP POLICY IF EXISTS "Users can view their memberships" ON workshop_users;
DROP POLICY IF EXISTS "Owners can view all members" ON workshop_users;
DROP POLICY IF EXISTS "Owners can add members" ON workshop_users;
DROP POLICY IF EXISTS "Owners can remove members" ON workshop_users;

-- Single simple policy: Users can only see their own workshop_users entries
CREATE POLICY "Users see own memberships"
ON workshop_users FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Re-enable RLS
ALTER TABLE workshop_users ENABLE ROW LEVEL SECURITY;
