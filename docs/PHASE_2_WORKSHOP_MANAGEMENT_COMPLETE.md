# Phase 2: Workshop CRUD & Database Schema - COMPLETE ✅

## Implementation Summary

Phase 2 extends the database schema and implements complete CRUD operations for workshops with multi-user support, role-based permissions, and workshop lifecycle management.

---

## 1. Database Schema Extensions ✅

### Migration File
- **Location**: `supabase/migrations/007_phase2_workshop_management.sql`

### Extended Tables

#### workshops (extended)
```sql
+ is_archived (boolean, default false)
+ archived_at (timestamp, nullable)
+ is_template (boolean, default false)
+ is_completed (boolean, default false)
+ completed_at (timestamp, nullable)
+ created_by (uuid, FK -> auth.users.id) -- already existed
```

#### workshop_users (new)
```sql
- id (uuid, PK)
- workshop_id (uuid, FK -> workshops.id, ON DELETE CASCADE)
- user_id (uuid, FK -> auth.users.id, ON DELETE CASCADE)
- role (enum: 'owner', 'collaborator')
- created_at (timestamp)
- UNIQUE(workshop_id, user_id)
```

#### workshop_invitations (new)
```sql
- id (uuid, PK)
- workshop_id (uuid, FK -> workshops.id, ON DELETE CASCADE)
- invited_by (uuid, FK -> auth.users.id)
- invited_email (text)
- token (uuid, unique)
- status (enum: 'pending', 'accepted', 'declined')
- created_at (timestamp)
- expires_at (timestamp, default NOW() + 7 days)
```

### Indexes
```sql
- idx_workshop_users_user_id
- idx_workshop_users_workshop_id
- idx_workshops_created_by
- idx_workshops_archived
- idx_invitations_token
- idx_invitations_status
```

---

## 2. Row Level Security (RLS) Policies ✅

### Workshops
- ✅ Users can view workshops where they are owner or collaborator
- ✅ Users can create workshops (become owner via trigger)
- ✅ Owners can update everything
- ✅ Collaborators can update sessions but NOT title, description, date, buffer_strategy, is_archived
- ✅ Only owners can delete workshops

### Sessions
- ✅ Users can view/create/update/delete sessions for their workshops

### Workshop_users
- ✅ Users can view their own memberships
- ✅ Only owners can add/remove users

### Workshop_invitations
- ✅ Users can view invitations they sent or received
- ✅ Owners can create/update/delete invitations

### Workshop_states
- ✅ Users can view/update states for their workshops

### Auto-Owner Trigger
```sql
CREATE TRIGGER on_workshop_created
  AFTER INSERT ON workshops
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_owner();
```
Automatically adds creator as owner when workshop is created.

---

## 3. TypeScript Types ✅

### Updated: `src/types/database.ts`

Added types:
```typescript
export type WorkshopUserRole = 'owner' | 'collaborator'
export type InvitationStatus = 'pending' | 'accepted' | 'declined'
```

Extended workshops table types with new fields:
- is_archived, archived_at
- is_template
- is_completed, completed_at

Added new table types:
- workshop_users
- workshop_invitations

---

## 4. Workshop Service Extensions ✅

### Updated: `src/services/workshop.ts`

#### New Methods

**User & Role Management:**
```typescript
getUserWorkshops(userId, includeArchived): Promise<Workshop[]>
getWorkshopRole(workshopId, userId): Promise<'owner' | 'collaborator' | null>
addUserToWorkshop(workshopId, userId, role)
removeUserFromWorkshop(workshopId, userId)
```

**Lifecycle Management:**
```typescript
archiveWorkshop(id): Promise<Workshop>
restoreWorkshop(id): Promise<Workshop>
markAsCompleted(workshopId): Promise<Workshop>
resetWorkshop(workshopId): Promise<void>
completeSession(workshopId, sessionId): Promise<void>
```

**Template System:**
```typescript
duplicateAsTemplate(workshopId, userId): Promise<Workshop>
createFromTemplate(templateId, userId, newTitle, newDate): Promise<Workshop>
```

**Updated Methods:**
```typescript
createWorkshop(workshop, userId) // Now requires userId and auto-creates owner relationship
deleteWorkshop(id) // Cascade deletes all related data
```

---

## 5. Permission Helper ✅

### New: `src/utils/permissions.ts`

```typescript
const PERMISSIONS = {
  owner: ['read', 'write', 'delete', 'start', 'manage_users', 'archive', 'edit_settings'],
  collaborator: ['read', 'write', 'start']
}

// Helper functions
canUserPerformAction(role, action): boolean
getUserPermissions(role): Permission[]
canEditSettings(role): boolean
canManageUsers(role): boolean
canArchive(role): boolean
canDelete(role): boolean
canStart(role): boolean
canWrite(role): boolean
canRead(role): boolean
```

---

## 6. Invitation Service ✅

### New: `src/services/invitation.ts`

```typescript
class InvitationService {
  createInvitation(workshopId, email, invitedBy): Promise<Invitation>
  acceptInvitation(token, userId): Promise<workshopId>
  declineInvitation(token): Promise<void>
  resendInvitation(invitationId): Promise<Invitation>
  cancelInvitation(invitationId): Promise<void>
  getPendingInvitations(workshopId): Promise<Invitation[]>
  getInvitationByToken(token): Promise<Invitation | null>
  getUserInvitations(email): Promise<Invitation[]>
}
```

**Features:**
- Token-based invitations with 7-day expiry
- Email validation
- Automatic collaborator role assignment on accept
- Resend with new token generation

---

## 7. User Service ✅

### New: `src/services/user.ts`

```typescript
class UserService {
  searchUsersByEmail(query): Promise<User[]>
  getUserByEmail(email): Promise<User | null>
  getUserById(id): Promise<User | null>
  getWorkshopCollaborators(workshopId): Promise<User[]>
}
```

---

## Key Features Implemented

### ✅ Multi-User Support
- Workshop ownership and collaboration
- Role-based permissions (owner vs collaborator)
- User search and invitation system

### ✅ Workshop Lifecycle
- Archive/Restore functionality
- Template creation and usage
- Workshop completion tracking
- Reset functionality (clears interactions and timer)

### ✅ Security
- Row Level Security policies for all tables
- Permission checks at database level
- Cascade deletes for data integrity

### ✅ Data Integrity
- Foreign key constraints
- Unique constraints (workshop_id, user_id)
- Automatic owner assignment via trigger
- Automatic workshop_state initialization

---

## Database Migration Instructions

### Apply Migration

```bash
# Navigate to flowstate directory
cd flowstate

# Apply migration via Supabase CLI
supabase db push

# Or apply directly in Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy contents of supabase/migrations/007_phase2_workshop_management.sql
# 3. Execute
```

### Verify Migration

```sql
-- Check new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'workshops';

-- Check new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('workshop_users', 'workshop_invitations');

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_workshop_created';
```

---

## Usage Examples

### Create Workshop with Owner
```typescript
import { WorkshopService } from './services/workshop'
import { useAuthStore } from './stores/authStore'

const user = useAuthStore.getState().user
const workshop = await WorkshopService.createWorkshop({
  title: 'My Workshop',
  description: 'Workshop description',
  date: new Date().toISOString(),
  total_duration: 120,
  buffer_strategy: 'distributed'
}, user.id)

// Owner relationship is auto-created via trigger
```

### Check Permissions
```typescript
import { canEditSettings, canManageUsers } from './utils/permissions'
import { WorkshopService } from './services/workshop'

const role = await WorkshopService.getWorkshopRole(workshopId, userId)

if (canEditSettings(role)) {
  // Show settings form
}

if (canManageUsers(role)) {
  // Show collaborator management
}
```

### Invite Collaborator
```typescript
import { InvitationService } from './services/invitation'
import { UserService } from './services/user'

// Check if user exists
const existingUser = await UserService.getUserByEmail('colleague@example.com')

if (existingUser) {
  // Add directly as collaborator
  await WorkshopService.addUserToWorkshop(workshopId, existingUser.id, 'collaborator')
} else {
  // Send invitation email
  const invitation = await InvitationService.createInvitation(
    workshopId,
    'colleague@example.com',
    currentUser.id
  )
  // TODO: Send email with invitation.token
}
```

### Accept Invitation
```typescript
import { InvitationService } from './services/invitation'

// From invitation link: /invitation/accept?token={token}
const workshopId = await InvitationService.acceptInvitation(token, userId)
router.push(`/workshop/${workshopId}/edit`)
```

### Archive/Restore Workshop
```typescript
// Archive
await WorkshopService.archiveWorkshop(workshopId)

// Restore
await WorkshopService.restoreWorkshop(workshopId)

// Get workshops (excluding archived)
const workshops = await WorkshopService.getUserWorkshops(userId, false)

// Get all workshops (including archived)
const allWorkshops = await WorkshopService.getUserWorkshops(userId, true)
```

### Reset Workshop
```typescript
// Resets timer, deletes interactions, resets sessions
await WorkshopService.resetWorkshop(workshopId)
```

### Template System
```typescript
// Save as template
const template = await WorkshopService.duplicateAsTemplate(workshopId, userId)

// Create from template
const newWorkshop = await WorkshopService.createFromTemplate(
  templateId,
  userId,
  'New Workshop Title',
  new Date().toISOString()
)
```

---

## Next Steps: Phase 3

Phase 3 will implement the Workshop Dashboard & List View:
- Dashboard route with workshop list
- Workshop cards with role/status badges
- Search and filter functionality
- Empty states and loading skeletons
- FAB for creating new workshops

---

## Testing Checklist

### Database
- [ ] Migration applied successfully
- [ ] All tables created with correct schema
- [ ] Indexes created
- [ ] RLS policies active
- [ ] Trigger working (auto-owner assignment)

### Services
- [ ] Create workshop with owner
- [ ] Get user workshops (owner + collaborator)
- [ ] Get workshop role
- [ ] Add/remove collaborators
- [ ] Archive/restore workshop
- [ ] Reset workshop
- [ ] Create/use templates
- [ ] Create/accept/decline invitations

### Permissions
- [ ] Owner can edit settings
- [ ] Collaborator cannot edit settings
- [ ] Owner can manage users
- [ ] Collaborator cannot manage users
- [ ] Both can start workshop
- [ ] Both can edit sessions

### Security
- [ ] Users can only see their workshops
- [ ] Users cannot access other users' workshops
- [ ] RLS blocks unauthorized access
- [ ] Cascade deletes work correctly

---

## Files Created/Modified

### Created
- ✅ `supabase/migrations/007_phase2_workshop_management.sql`
- ✅ `src/utils/permissions.ts`
- ✅ `src/services/invitation.ts`
- ✅ `src/services/user.ts`

### Modified
- ✅ `src/types/database.ts` (extended types)
- ✅ `src/services/workshop.ts` (added Phase 2 methods)

---

**Phase 2 Status: COMPLETE ✅**

All database schema extensions, services, and permission helpers are implemented and ready for use in Phase 3 (Dashboard UI).
