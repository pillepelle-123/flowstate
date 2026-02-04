-- Fix RLS policy for profiles to allow viewing workshop collaborators

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Users can view workshop collaborators"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR
    id IN (
      SELECT user_id FROM workshop_users
      WHERE workshop_id IN (
        SELECT workshop_id FROM workshop_users WHERE user_id = auth.uid()
      )
    )
  );
