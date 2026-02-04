-- Migration: Add trigger for sending invitation emails
-- Phase 6: Collaborator Management & Invitations

-- Create trigger function to call Edge Function
CREATE OR REPLACE FUNCTION trigger_send_invitation_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function via pg_net (requires pg_net extension)
  -- Alternative: Handle in application layer
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on workshop_invitations insert
CREATE TRIGGER on_invitation_created
  AFTER INSERT ON workshop_invitations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_invitation_email();

-- Note: Email sending should be handled in application layer or via Supabase webhooks
-- This trigger is a placeholder for future implementation
