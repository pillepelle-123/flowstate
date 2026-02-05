-- Add fields for material and interaction notifications
-- These will be used to notify participants in real-time

ALTER TABLE workshop_states
ADD COLUMN IF NOT EXISTS show_material BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_interaction BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_updated_at TIMESTAMP WITH TIME ZONE;

-- Enable realtime for workshop_states if not already enabled
ALTER PUBLICATION supabase_realtime ADD TABLE workshop_states;
