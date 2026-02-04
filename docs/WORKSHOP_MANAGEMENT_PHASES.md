# FlowState – Workshop Management Implementation Plan

## Overview
This document defines the development phases for implementing a complete Workshop Management System with multi-user authentication, CRUD operations, role-based permissions, and workshop lifecycle management.

**Language**: All code, comments, and UI text will be in English.

---

## Phase 1: Authentication & User Management
**Goal**: Implement Supabase Auth with registration, login, and user profiles

### Tasks:

1. **Supabase Auth Setup**
   - Enable Email/Password authentication in Supabase Dashboard
   - Configure email templates (welcome, password reset)
   - Set up auth.users table policies

2. **Database Schema Extensions**
   ```sql
   -- User profiles (extends auth.users)
   profiles:
     - id (uuid, PK, FK -> auth.users.id)
     - email (text, unique)
     - display_name (text)
     - created_at (timestamp)
     - updated_at (timestamp)

   -- Trigger: Auto-create profile on user signup
   CREATE TRIGGER on_auth_user_created
   ```

3. **Auth Service**
   ```typescript
   // src/services/auth.ts
   class AuthService {
     signUp(email: string, password: string, displayName: string)
     signIn(email: string, password: string)
     signOut()
     resetPassword(email: string)
     updateProfile(displayName: string)
     getCurrentUser()
   }
   ```

4. **Auth Screens (React Native Paper)**
   - `/auth/login` - Login form with email/password
   - `/auth/register` - Registration form with display name
   - `/auth/forgot-password` - Password reset
   - Protected route wrapper for authenticated pages

5. **Auth State Management**
   - Zustand store for auth state
   - Persist session with Expo SecureStore
   - Auto-redirect logic (logged in → dashboard, logged out → login)

**Deliverable**: Users can register, login, and access protected routes.

---

## Phase 2: Workshop CRUD & Database Schema
**Goal**: Extend database schema and implement workshop CRUD operations

### Tasks:

1. **Extended Database Schema**
   ```sql
   -- Extend workshops table
   workshops:
     + is_archived (boolean, default false)
     + archived_at (timestamp, nullable)
     + is_template (boolean, default false)
     + is_completed (boolean, default false)
     + completed_at (timestamp, nullable)
     + created_by (uuid, FK -> auth.users.id)

   -- Workshop-User relationship (n:m with roles)
   workshop_users:
     - id (uuid, PK)
     - workshop_id (uuid, FK -> workshops.id, ON DELETE CASCADE)
     - user_id (uuid, FK -> auth.users.id, ON DELETE CASCADE)
     - role (enum: 'owner', 'collaborator')
     - created_at (timestamp)
     - UNIQUE(workshop_id, user_id)

   -- Workshop invitations
   workshop_invitations:
     - id (uuid, PK)
     - workshop_id (uuid, FK -> workshops.id, ON DELETE CASCADE)
     - invited_by (uuid, FK -> auth.users.id)
     - invited_email (text)
     - token (uuid, unique)
     - status (enum: 'pending', 'accepted', 'declined')
     - created_at (timestamp)
     - expires_at (timestamp)
   ```

2. **Row Level Security (RLS) Policies**
   ```sql
   -- Workshops: Users can view workshops where they are owner or collaborator
   CREATE POLICY "Users can view their workshops"
   ON workshops FOR SELECT
   USING (
     id IN (
       SELECT workshop_id FROM workshop_users 
       WHERE user_id = auth.uid()
     )
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
       title = OLD.title AND
       description = OLD.description AND
       date = OLD.date AND
       buffer_strategy = OLD.buffer_strategy AND
       is_archived = OLD.is_archived
     ))
   );

   -- Sessions: Owners and collaborators can manage
   CREATE POLICY "Users can manage sessions"
   ON sessions FOR ALL
   USING (
     workshop_id IN (
       SELECT workshop_id FROM workshop_users 
       WHERE user_id = auth.uid()
     )
   );
   ```

3. **Workshop Service Extensions**
   ```typescript
   // src/services/workshop.ts
   class WorkshopService {
     // Existing methods...
     
     // New methods:
     createWorkshop(data: CreateWorkshopInput): Promise<Workshop>
     updateWorkshop(id: string, data: UpdateWorkshopInput): Promise<Workshop>
     archiveWorkshop(id: string): Promise<void>
     restoreWorkshop(id: string): Promise<void>
     deleteWorkshop(id: string): Promise<void>
     
     getUserWorkshops(userId: string, includeArchived: boolean): Promise<Workshop[]>
     getWorkshopRole(workshopId: string, userId: string): Promise<'owner' | 'collaborator' | null>
     
     duplicateAsTemplate(workshopId: string): Promise<Workshop>
     createFromTemplate(templateId: string): Promise<Workshop>
     
     resetWorkshop(workshopId: string): Promise<void> // Resets timer + deletes interactions
     markAsCompleted(workshopId: string): Promise<void>
   }
   ```

4. **Permission Helper**
   ```typescript
   // src/utils/permissions.ts
   const PERMISSIONS = {
     owner: ['read', 'write', 'delete', 'start', 'manage_users', 'archive', 'edit_settings'],
     collaborator: ['read', 'write', 'start']
   }

   function canUserPerformAction(
     role: 'owner' | 'collaborator',
     action: string
   ): boolean
   ```

**Deliverable**: Complete CRUD operations for workshops with role-based permissions.

---

## Phase 3: Workshop Dashboard & List View
**Goal**: Create main dashboard with workshop list, filters, and actions

### Tasks:

1. **Dashboard Route Structure**
   ```
   /dashboard
     - Shows all workshops (owner + collaborator)
     - Tabs: "Active" | "Archived"
     - Filter: "All" | "Owner" | "Collaborator"
   ```

2. **Workshop List Component**
   ```typescript
   // src/components/dashboard/WorkshopList.tsx
   - Card-based layout with Paper components
   - Each card shows:
     * Workshop title
     * Date
     * Role badge (Owner/Collaborator)
     * Status badge (Completed/Active)
     * Quick actions: Start, Edit, Archive (owner only)
   ```

3. **Workshop Card Component**
   ```typescript
   // src/components/dashboard/WorkshopCard.tsx
   - Surface with elevation
   - Badges: Role (primary/secondary color), Status (success/default)
   - Action buttons: IconButton for quick actions
   - Long-press menu (native) / Context menu (web)
   ```

4. **Empty States**
   - No workshops: "Create your first workshop" CTA
   - No archived workshops: "No archived workshops"
   - Loading state with skeleton screens

5. **Search & Filter**
   - Search bar (filters by title)
   - Filter chips: Role, Status
   - Sort options: Date (newest/oldest), Title (A-Z)

6. **Floating Action Button (FAB)**
   - Paper FAB component
   - Action: Navigate to `/workshop/create`
   - Icon: "plus"

**Deliverable**: Functional dashboard with workshop list and navigation.

---

## Phase 4: Workshop Creation Flow
**Goal**: Implement `/workshop/create` route with form validation

### Tasks:

1. **Create Workshop Screen**
   ```
   /workshop/create
   - Form fields:
     * Title (required, TextInput)
     * Description (optional, multiline TextInput)
     * Date (DateTimePicker - Expo)
     * Total Duration (number input, minutes)
     * Buffer Strategy (SegmentedButtons: Fixed/Distributed/End)
   - Actions:
     * Cancel (navigate back)
     * Create (validate + save + navigate to edit)
   ```

2. **Form Validation**
   - Title: min 3 characters
   - Date: cannot be in the past
   - Total Duration: min 15 minutes
   - Show inline error messages with Paper HelperText

3. **Workshop Creation Logic**
   ```typescript
   async function handleCreateWorkshop(data: CreateWorkshopInput) {
     // 1. Create workshop
     const workshop = await WorkshopService.createWorkshop(data)
     
     // 2. Create workshop_users entry (owner)
     await WorkshopService.addUserToWorkshop(workshop.id, currentUser.id, 'owner')
     
     // 3. Initialize workshop_states
     await WorkshopService.initializeWorkshopState(workshop.id)
     
     // 4. Navigate to edit screen
     router.push(`/workshop/${workshop.id}/edit`)
   }
   ```

4. **Template Selection (Optional)**
   - Show list of user's templates before form
   - "Start from template" vs "Start from scratch"
   - Pre-fill form with template data

**Deliverable**: Users can create new workshops with validation.

---

## Phase 5: Workshop Edit Screen with Tabs
**Goal**: Implement `/workshop/[id]/edit` with three tabs

### Tasks:

1. **Route Structure**
   ```
   /workshop/[id]/edit
   - Tab Navigation (React Native Paper Tabs or custom)
   - Tabs:
     1. Planner (Session management)
     2. Collaborators (User management)
     3. Settings (Workshop metadata)
   ```

2. **Tab 1: Planner (Session Management)**
   - Reuse existing `PlanningEditor` component
   - Drag-and-drop session list (react-native-draggable-flatlist)
   - Session cards with inline editing
   - Method library sidebar
   - Timeline visualization
   - Add/Remove/Reorder sessions
   - **Permission**: Owner + Collaborator

3. **Tab 2: Collaborators**
   ```typescript
   // src/components/workshop/CollaboratorsTab.tsx
   - List of current collaborators
     * Avatar + Name + Email
     * Role badge
     * Remove button (owner only)
   
   - Add collaborator section:
     * Email search input
     * Search results: Existing users
     * "Send invitation" button for non-existing users
   
   - Pending invitations list:
     * Email + Status + Resend/Cancel buttons
   ```

4. **Tab 3: Settings**
   - Reuse existing `WorkshopForm` component
   - Fields: Title, Description, Date, Total Duration, Buffer Strategy
   - Save button
   - **Permission**: Owner only (disable for collaborators)
   - Additional actions:
     * "Save as Template" button
     * "Archive Workshop" button (owner only)
     * "Delete Workshop" button (owner only, with confirmation)

5. **Permission-based UI**
   - Disable/hide elements based on user role
   - Show tooltip: "Only owners can edit settings"

6. **Header Actions**
   - Back button
   - Workshop title (editable inline for owners)
   - "Start Workshop" button (owner + collaborator)

**Deliverable**: Complete workshop editing interface with role-based access.

---

## Phase 6: Collaborator Management & Invitations
**Goal**: Implement user search, invitations, and email notifications

### Tasks:

1. **User Search API**
   ```typescript
   // src/services/user.ts
   class UserService {
     searchUsersByEmail(query: string): Promise<User[]>
     getUserByEmail(email: string): Promise<User | null>
   }
   ```

2. **Invitation System**
   ```typescript
   // src/services/invitation.ts
   class InvitationService {
     createInvitation(workshopId: string, email: string): Promise<Invitation>
     acceptInvitation(token: string): Promise<void>
     declineInvitation(token: string): Promise<void>
     resendInvitation(invitationId: string): Promise<void>
     cancelInvitation(invitationId: string): Promise<void>
     getPendingInvitations(workshopId: string): Promise<Invitation[]>
   }
   ```

3. **Email Notifications (Supabase Edge Function)**
   ```typescript
   // supabase/functions/send-invitation/index.ts
   // Triggered when invitation is created
   // Sends email with:
   // - Workshop name
   // - Invited by (name)
   // - Accept/Decline links
   // - Link format: https://app.flowstate.com/invitation/accept?token={token}
   ```

4. **Invitation Accept Flow**
   ```
   /invitation/accept?token={token}
   - If user logged in: Accept invitation → Redirect to workshop
   - If user not logged in: Show login/register → Accept invitation → Redirect
   - If user not registered: Pre-fill email in registration form
   ```

5. **Collaborator List Component**
   - Avatar (first letter of name)
   - Name + Email
   - Role badge
   - Remove button (with confirmation dialog)
   - Empty state: "No collaborators yet"

6. **Add Collaborator Component**
   - Email input with search-as-you-type
   - Dropdown with search results
   - "Add" button for existing users
   - "Send invitation" button for non-existing users
   - Success/Error toast notifications

**Deliverable**: Complete collaborator management with email invitations.

---

## Phase 7: Workshop Lifecycle Management
**Goal**: Implement start, reset, complete, archive, and delete operations

### Tasks:

1. **Start Workshop Action**
   ```typescript
   // src/services/workshop.ts
   async function startWorkshop(workshopId: string) {
     // 1. Reset workshop state (if previously run)
     await resetWorkshop(workshopId)
     
     // 2. Start first session
     const sessions = await getSessions(workshopId)
     const firstSession = sessions.sort((a, b) => a.order_index - b.order_index)[0]
     
     if (firstSession) {
       await startSession(workshopId, firstSession.id)
     }
     
     // 3. Navigate to moderator live view
     router.push(`/moderator?workshopId=${workshopId}`)
   }
   ```

2. **Reset Workshop Function**
   ```typescript
   async function resetWorkshop(workshopId: string) {
     // 1. Reset workshop_states
     await supabase
       .from('workshop_states')
       .update({
         current_session_id: null,
         status: 'planned',
         started_at: null,
         paused_at: null,
         session_started_at: null,
         session_ends_at: null,
         server_time_offset: 0
       })
       .eq('workshop_id', workshopId)
     
     // 2. Delete all interactions
     await supabase
       .from('interactions')
       .delete()
       .in('session_id', (
         await supabase
           .from('sessions')
           .select('id')
           .eq('workshop_id', workshopId)
       ).data.map(s => s.id))
     
     // 3. Reset session actual_duration
     await supabase
       .from('sessions')
       .update({ actual_duration: null })
       .eq('workshop_id', workshopId)
     
     // 4. Set is_completed to false
     await supabase
       .from('workshops')
       .update({ is_completed: false, completed_at: null })
       .eq('id', workshopId)
   }
   ```

3. **Auto-Complete Detection**
   ```typescript
   // In timer service: When last session ends
   async function onLastSessionComplete(workshopId: string) {
     await supabase
       .from('workshops')
       .update({
         is_completed: true,
         completed_at: new Date().toISOString()
       })
       .eq('id', workshopId)
   }
   ```

4. **Archive/Restore Actions**
   ```typescript
   async function archiveWorkshop(workshopId: string) {
     await supabase
       .from('workshops')
       .update({
         is_archived: true,
         archived_at: new Date().toISOString()
       })
       .eq('id', workshopId)
   }

   async function restoreWorkshop(workshopId: string) {
     await supabase
       .from('workshops')
       .update({
         is_archived: false,
         archived_at: null
       })
       .eq('id', workshopId)
   }
   ```

5. **Delete Workshop (Hard Delete)**
   ```typescript
   async function deleteWorkshop(workshopId: string) {
     // Cascade delete via FK constraints:
     // - workshop_users
     // - sessions
     // - workshop_states
     // - interactions (via sessions)
     // - workshop_invitations
     
     await supabase
       .from('workshops')
       .delete()
       .eq('id', workshopId)
   }
   ```

6. **Confirmation Dialogs**
   - Archive: "Archive this workshop? You can restore it later."
   - Delete: "Permanently delete this workshop? This cannot be undone."
   - Reset: "Reset workshop? All participant interactions will be deleted."

7. **Status Badges**
   - Completed: Green chip with checkmark icon
   - Active: Default chip
   - Archived: Gray chip

**Deliverable**: Complete workshop lifecycle with all state transitions.

---

## Phase 8: Template System
**Goal**: Allow users to save workshops as templates and create from templates

### Tasks:

1. **Save as Template**
   ```typescript
   async function saveAsTemplate(workshopId: string) {
     // 1. Duplicate workshop
     const workshop = await getWorkshop(workshopId)
     const template = await createWorkshop({
       ...workshop,
       title: `${workshop.title} (Template)`,
       is_template: true,
       is_archived: false,
       is_completed: false
     })
     
     // 2. Duplicate sessions
     const sessions = await getSessions(workshopId)
     for (const session of sessions) {
       await createSession(template.id, {
         ...session,
         actual_duration: null
       })
     }
     
     // 3. Add owner relationship
     await addUserToWorkshop(template.id, currentUser.id, 'owner')
     
     return template
   }
   ```

2. **Template List View**
   ```
   /templates
   - List of user's templates
   - Card layout similar to workshop list
   - Badge: "Template"
   - Actions: "Use Template", "Edit", "Delete"
   ```

3. **Create from Template**
   ```typescript
   async function createFromTemplate(templateId: string) {
     // Similar to saveAsTemplate, but:
     // - is_template: false
     // - title: Remove "(Template)" suffix
     // - Prompt user for new title, date
   }
   ```

4. **Template Selection in Create Flow**
   - Add "Templates" tab in `/workshop/create`
   - Show template cards
   - Click template → Pre-fill form → User can modify → Create

5. **Template Badge**
   - Show "Template" badge on workshop cards
   - Different color (e.g., purple)

**Deliverable**: Users can save and reuse workshop templates.

---

## Phase 9: UI Polish & Navigation Updates
**Goal**: Update navigation, remove old routes, add proper loading states

### Tasks:

1. **Navigation Structure Update**
   ```
   Remove:
   - /planner

   Add:
   - /dashboard (default after login)
   - /workshop/create
   - /workshop/[id]/edit
   - /templates
   - /invitation/accept

   Keep:
   - /moderator (with workshopId param)
   - /participant
   - /display
   - /join/[id]
   ```

2. **Index Page Update**
   ```typescript
   // app/index.tsx
   - If logged in: Redirect to /dashboard
   - If not logged in: Show landing page with "Login" / "Register" buttons
   ```

3. **Header/AppBar Component**
   - Logo + App name
   - User menu (avatar dropdown):
     * Profile
     * Templates
     * Logout
   - Back button (context-aware)

4. **Loading States**
   - Skeleton screens for lists
   - Spinner for actions (start, archive, delete)
   - Progress indicators for long operations

5. **Error Handling**
   - Toast notifications for errors (Paper Snackbar)
   - Retry buttons for failed operations
   - Offline detection with banner

6. **Responsive Design**
   - Mobile: Stack layout
   - Tablet/Desktop: Side-by-side layout for edit screen
   - Adaptive navigation (drawer on large screens)

7. **Accessibility**
   - Proper labels for screen readers
   - Keyboard navigation
   - Focus management

**Deliverable**: Polished UI with proper navigation and error handling.

---

## Phase 10: Testing & Migration
**Goal**: Test all features, migrate existing data, deploy

### Tasks:

1. **Data Migration Script**
   ```sql
   -- Migrate existing workshops to new schema
   -- 1. Add created_by to existing workshops (set to first user)
   -- 2. Create workshop_users entries for all workshops
   -- 3. Initialize workshop_states for existing workshops
   ```

2. **Integration Testing**
   - Test all user flows:
     * Registration → Create workshop → Add sessions → Start workshop
     * Invite collaborator → Accept invitation → Edit workshop
     * Archive → Restore → Delete
     * Save as template → Create from template
   - Test permissions (owner vs collaborator)
   - Test edge cases (expired invitations, deleted users)

3. **Performance Optimization**
   - Add indexes to database:
     * workshop_users(user_id, workshop_id)
     * workshops(created_by, is_archived, is_completed)
     * workshop_invitations(token, status)
   - Optimize queries (use joins instead of multiple queries)
   - Add pagination to workshop list (if > 50 workshops)

4. **Documentation**
   - User guide (how to create workshops, invite collaborators)
   - API documentation for services
   - Database schema diagram

5. **Deployment**
   - Deploy database migrations to production
   - Deploy Edge Functions (invitation emails)
   - Deploy web app (Vercel/Netlify)
   - Build native apps (EAS Build)
   - Test on production environment

**Deliverable**: Fully tested and deployed workshop management system.

---

## Database Migration Summary

```sql
-- Phase 1: Auth & Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Phase 2: Workshop Extensions
ALTER TABLE workshops
  ADD COLUMN is_archived BOOLEAN DEFAULT FALSE,
  ADD COLUMN archived_at TIMESTAMP,
  ADD COLUMN is_template BOOLEAN DEFAULT FALSE,
  ADD COLUMN is_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN completed_at TIMESTAMP,
  ADD COLUMN created_by UUID REFERENCES auth.users(id);

CREATE TABLE workshop_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'collaborator')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workshop_id, user_id)
);

CREATE TABLE workshop_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id),
  invited_email TEXT NOT NULL,
  token UUID UNIQUE DEFAULT gen_random_uuid(),
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indexes
CREATE INDEX idx_workshop_users_user_id ON workshop_users(user_id);
CREATE INDEX idx_workshop_users_workshop_id ON workshop_users(workshop_id);
CREATE INDEX idx_workshops_created_by ON workshops(created_by);
CREATE INDEX idx_workshops_archived ON workshops(is_archived);
CREATE INDEX idx_invitations_token ON workshop_invitations(token);
CREATE INDEX idx_invitations_status ON workshop_invitations(status);
```

---

## Implementation Order

1. **Phase 1** (Auth) → Foundation for all user-specific features
2. **Phase 2** (Database) → Required for all subsequent phases
3. **Phase 3** (Dashboard) → Main entry point after login
4. **Phase 4** (Create) → Basic workshop creation
5. **Phase 5** (Edit) → Complete workshop management
6. **Phase 6** (Collaborators) → Multi-user features
7. **Phase 7** (Lifecycle) → Workshop state management
8. **Phase 8** (Templates) → Advanced feature
9. **Phase 9** (Polish) → UX improvements
10. **Phase 10** (Testing) → Final validation

---

## Estimated Timeline

- Phase 1: 2-3 days (Auth setup + screens)
- Phase 2: 2-3 days (Database + RLS + services)
- Phase 3: 2 days (Dashboard + list)
- Phase 4: 1-2 days (Create form)
- Phase 5: 3-4 days (Edit screen with tabs)
- Phase 6: 2-3 days (Invitations + email)
- Phase 7: 2 days (Lifecycle management)
- Phase 8: 1-2 days (Templates)
- Phase 9: 2-3 days (Polish + navigation)
- Phase 10: 2-3 days (Testing + deployment)

**Total: ~20-28 working days**

---

## Next Steps

Start with **Phase 1** using this prompt:

```
Implement Supabase Email/Password authentication for FlowState. Create the profiles 
table with auto-creation trigger. Build AuthService with signUp, signIn, signOut, 
and resetPassword methods. Create auth screens (/auth/login, /auth/register, 
/auth/forgot-password) using React Native Paper components. Implement auth state 
management with Zustand and persist sessions with Expo SecureStore. Add protected 
route wrapper that redirects to /auth/login if not authenticated. All code and UI 
text must be in English.
```
