-- Phase 2: Workshop CRUD & Database Schema Extensions
-- Extends workshops table and adds multi-user support

-- ============================================
-- 1. Extend workshops table
-- ============================================
ALTER TABLE workshops
  ADD COLUMN is_archived BOOLEAN DEFAULT FALSE,
  ADD COLUMN archived_at TIMESTAMP,
  ADD COLUMN is_template BOOLEAN DEFAULT FALSE,
  ADD COLUMN is_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN completed_at TIMESTAMP;

-- Update created_by to reference auth.users (already exists but may be null)
-- No need to alter, just ensure it's properly used going forward

-- ============================================
-- 2. Workshop-User relationship (n:m with roles)
-- ============================================
CREATE TABLE workshop_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'collaborator')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workshop_id, user_id)
);

-- ============================================
-- 3. Workshop invitations
-- ============================================
CREATE TABLE workshop_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_email TEXT NOT NULL,
  token UUID UNIQUE DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

-- ============================================
-- 4. Indexes for performance
-- ============================================
CREATE INDEX idx_workshop_users_user_id ON workshop_users(user_id);
CREATE INDEX idx_workshop_users_workshop_id ON workshop_users(workshop_id);
CREATE INDEX idx_workshops_created_by ON workshops(created_by);
CREATE INDEX idx_workshops_archived ON workshops(is_archived);
CREATE INDEX idx_invitations_token ON workshop_invitations(token);
CREATE INDEX idx_invitations_status ON workshop_invitations(status);

-- ============================================
-- 5. Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on new tables
ALTER TABLE workshop_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_invitations ENABLE ROW LEVEL SECURITY;

-- Workshops: Users can view workshops where they are owner or collaborator
CREATE POLICY "Users can view their workshops"
ON workshops FOR SELECT
USING (
  id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid()
  )
);

-- Workshops: Users can insert workshops (will become owner via trigger)
CREATE POLICY "Users can create workshops"
ON workshops FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Workshops: Owners and collaborators can update (with restrictions)
CREATE POLICY "Users can update their workshops"
ON workshops FOR UPDATE
USING (
  id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  -- Owners can update everything
  (id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid() AND role = 'owner'
  ))
  OR
  -- Collaborators cannot update title, description, date, buffer_strategy, is_archived
  (id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid() AND role = 'collaborator'
  ) AND (
    title = (SELECT title FROM workshops WHERE id = workshops.id) AND
    description IS NOT DISTINCT FROM (SELECT description FROM workshops WHERE id = workshops.id) AND
    date IS NOT DISTINCT FROM (SELECT date FROM workshops WHERE id = workshops.id) AND
    buffer_strategy = (SELECT buffer_strategy FROM workshops WHERE id = workshops.id) AND
    is_archived = (SELECT is_archived FROM workshops WHERE id = workshops.id)
  ))
);

-- Workshops: Only owners can delete/archive
CREATE POLICY "Only owners can delete workshops"
ON workshops FOR DELETE
USING (
  id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Sessions: Owners and collaborators can view sessions
CREATE POLICY "Users can view sessions"
ON sessions FOR SELECT
USING (
  workshop_id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid()
  )
);

-- Sessions: Owners and collaborators can manage sessions
CREATE POLICY "Users can create sessions"
ON sessions FOR INSERT
WITH CHECK (
  workshop_id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update sessions"
ON sessions FOR UPDATE
USING (
  workshop_id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete sessions"
ON sessions FOR DELETE
USING (
  workshop_id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid()
  )
);

-- Workshop_users: Users can view their own relationships
CREATE POLICY "Users can view workshop memberships"
ON workshop_users FOR SELECT
USING (
  user_id = auth.uid() OR
  workshop_id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Workshop_users: Only owners can add/remove users
CREATE POLICY "Owners can manage workshop users"
ON workshop_users FOR ALL
USING (
  workshop_id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Workshop_invitations: Users can view invitations they sent or received
CREATE POLICY "Users can view relevant invitations"
ON workshop_invitations FOR SELECT
USING (
  invited_by = auth.uid() OR
  invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  workshop_id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Workshop_invitations: Owners can create invitations
CREATE POLICY "Owners can create invitations"
ON workshop_invitations FOR INSERT
WITH CHECK (
  workshop_id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Workshop_invitations: Owners can update/delete their invitations
CREATE POLICY "Owners can manage invitations"
ON workshop_invitations FOR UPDATE
USING (
  workshop_id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

CREATE POLICY "Owners can delete invitations"
ON workshop_invitations FOR DELETE
USING (
  workshop_id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- Workshop_states: Users can view states for their workshops
CREATE POLICY "Users can view workshop states"
ON workshop_states FOR SELECT
USING (
  workshop_id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update workshop states"
ON workshop_states FOR UPDATE
USING (
  workshop_id IN (
    SELECT workshop_id FROM workshop_users 
    WHERE user_id = auth.uid()
  )
);

-- ============================================
-- 6. Trigger: Auto-add creator as owner
-- ============================================
CREATE OR REPLACE FUNCTION add_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Only add if created_by is set and user is authenticated
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO workshop_users (workshop_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner')
    ON CONFLICT (workshop_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_workshop_created
  AFTER INSERT ON workshops
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_owner();
