-- Fix workshop_invitations SELECT policy

DROP POLICY IF EXISTS "Users can view relevant invitations" ON workshop_invitations;

CREATE POLICY "Users can view invitations for their workshops"
ON workshop_invitations FOR SELECT
USING (
  workshop_id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid()
  )
);
