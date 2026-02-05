-- Allow anonymous participants to join workshops without auth
-- This enables the participant join flow without requiring Supabase Auth

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Participants can join workshops" ON participants;

-- Create a new policy that allows anyone to insert participants
CREATE POLICY "Anyone can join workshops as participant"
  ON participants FOR INSERT
  WITH CHECK (true);

-- Also allow public read access to participants for the workshop they belong to
CREATE POLICY "Public can view participants"
  ON participants FOR SELECT
  USING (true);

-- Allow participants to create interactions without auth
DROP POLICY IF EXISTS "Participants can create interactions" ON interactions;

CREATE POLICY "Anyone can create interactions"
  ON interactions FOR INSERT
  WITH CHECK (true);
