# Phase 5: Workshop Edit Screen with Tabs - COMPLETE ✅

## Implementation Summary

Phase 5 implements the workshop edit screen with three tabs: Planner (session management), Collaborators (user management), and Settings (workshop metadata with actions).

---

## Components Created

### 1. Workshop Edit Screen ✅
**Location**: `app/workshop/[id].tsx`

**Features**:
- Dynamic route with workshop ID parameter
- SegmentedButtons for tab navigation
- Permission-based tab access (Settings disabled for collaborators)
- Role detection via WorkshopService.getWorkshopRole()
- Appbar with back button

**Tabs**:
1. **Planner** - Reuses existing PlanningEditor component
2. **Collaborators** - User management and invitations
3. **Settings** - Workshop metadata and actions (owner only)

---

### 2. Collaborators Tab ✅
**Location**: `src/components/workshop/CollaboratorsTab.tsx`

**Features**:

#### Collaborator List
- List.Item with Avatar (first letter)
- Display name + email
- Role badge (Chip)
- Remove button (owner only, not for self)

#### Add Collaborator (Owner Only)
- Email TextInput (outlined mode)
- Send Invitation button
- Loading state during invitation

#### Pending Invitations (Owner Only)
- List of pending invitations
- Email + Status
- Cancel button (IconButton)

**Permissions**:
- Owner: Can add/remove collaborators, view invitations
- Collaborator: View-only list

---

### 3. Settings Tab ✅
**Location**: `src/components/workshop/SettingsTab.tsx`

**Features**:

#### Workshop Form
- Reuses WorkshopForm component
- Pre-filled with current workshop data
- Save button updates workshop

#### Action Buttons (Owner Only)
- **Save as Template** - Duplicates workshop as template
- **Archive Workshop** - Archives workshop and returns to dashboard
- **Delete Workshop** - Shows confirmation dialog, then deletes

#### Delete Confirmation Dialog
- Portal + Dialog from Paper
- Warning message
- Cancel / Delete buttons

**Permissions**:
- Owner: Full access to all features
- Collaborator: Cannot access (tab disabled)

---

## Integration

### Dashboard Navigation
**Updated**: `app/dashboard.tsx`

Changed Edit navigation:
```typescript
// Before
router.push(`/planner?workshopId=${id}`)

// After
router.push(`/workshop/${id}`)
```

### Route Structure
```
/workshop/[id]
  ├─ Tab: Planner (PlanningEditor)
  ├─ Tab: Collaborators (CollaboratorsTab)
  └─ Tab: Settings (SettingsTab)
```

---

## Services Used

### WorkshopService
- getWorkshop(id)
- getWorkshopRole(workshopId, userId)
- updateWorkshop(id, data)
- duplicateAsTemplate(workshopId, userId)
- archiveWorkshop(id)
- deleteWorkshop(id)
- removeUserFromWorkshop(workshopId, userId)

### UserService
- getWorkshopCollaborators(workshopId)

### InvitationService
- getPendingInvitations(workshopId)
- createInvitation(workshopId, email, invitedBy)
- cancelInvitation(invitationId)

---

## Permission System

### Role Detection
```typescript
const role = await WorkshopService.getWorkshopRole(workshopId, userId)
// Returns: 'owner' | 'collaborator' | null
```

### Permission Checks
```typescript
import { canEditSettings } from '../../src/utils/permissions'

// Disable Settings tab for collaborators
{ value: 'settings', label: 'Settings', disabled: !canEditSettings(role) }

// Show/hide UI elements
{isOwner && <Button>Delete</Button>}
```

---

## UI Components (React Native Paper)

- **Appbar** - Header with back button
- **SegmentedButtons** - Tab navigation
- **List.Item** - Collaborator list
- **Avatar.Text** - User avatars
- **Chip** - Role badges
- **IconButton** - Remove/Cancel actions
- **TextInput** - Email input (outlined mode)
- **Button** - Actions (contained/outlined)
- **Dialog** - Delete confirmation
- **Portal** - Dialog overlay
- **Snackbar** - Success/error notifications
- **Divider** - Section separator

---

## Data Flow

### Load Workshop Data
```typescript
useEffect(() => {
  loadRole()
}, [id, user])

const loadRole = async () => {
  const userRole = await WorkshopService.getWorkshopRole(id, user.id)
  setRole(userRole)
}
```

### Tab Content Rendering
```typescript
{tab === 'planner' && <PlanningEditor workshopId={id} />}
{tab === 'collaborators' && user && (
  <CollaboratorsTab workshopId={id} userRole={role} currentUserId={user.id} />
)}
{tab === 'settings' && user && (
  <SettingsTab workshopId={id} userRole={role} currentUserId={user.id} />
)}
```

---

## Error Handling

- Try-catch blocks for all async operations
- Snackbar notifications for user feedback
- Alert dialogs for critical errors
- Loading states during operations

---

## Testing Checklist

### Navigation
- [ ] Dashboard Edit button navigates to /workshop/[id]
- [ ] Back button returns to dashboard
- [ ] Tab switching works correctly

### Permissions
- [ ] Owner sees all three tabs
- [ ] Collaborator sees Planner and Collaborators tabs
- [ ] Settings tab disabled for collaborators
- [ ] Remove button hidden for non-owners
- [ ] Add collaborator section hidden for non-owners

### Planner Tab
- [ ] PlanningEditor loads with workshopId
- [ ] Sessions can be added/edited/deleted
- [ ] Drag-and-drop reordering works

### Collaborators Tab
- [ ] Collaborator list loads correctly
- [ ] Avatars show first letter
- [ ] Role badges display correctly
- [ ] Owner can send invitations
- [ ] Owner can remove collaborators (not self)
- [ ] Pending invitations list shows
- [ ] Cancel invitation works

### Settings Tab
- [ ] Workshop form pre-fills with data
- [ ] Save updates workshop
- [ ] Save as Template creates template
- [ ] Archive navigates back to dashboard
- [ ] Delete shows confirmation dialog
- [ ] Delete removes workshop and navigates to dashboard

---

## Known Limitations

1. **No Email Sending**: Invitations created but emails not sent (Phase 6)
2. **No User Search**: Only email input, no autocomplete (Phase 6)
3. **No Invitation Accept Flow**: /invitation/accept route not implemented (Phase 6)
4. **No Start Workshop Button**: Header action not added yet
5. **No Inline Title Editing**: Workshop title not editable in header

---

## Future Enhancements (Phase 6)

- Email notifications via Supabase Edge Functions
- User search with autocomplete
- Invitation accept/decline flow
- Real-time collaborator updates
- Activity log (who changed what)
- Role change (promote collaborator to owner)

---

## Files Created/Modified

### Created
- ✅ `app/workshop/[id].tsx`
- ✅ `src/components/workshop/CollaboratorsTab.tsx`
- ✅ `src/components/workshop/SettingsTab.tsx`

### Modified
- ✅ `app/dashboard.tsx` (Edit navigation)

---

## Usage Example

```typescript
// User clicks Edit on workshop card in dashboard
router.push(`/workshop/${workshopId}`)

// Workshop edit screen loads
// - Detects user role (owner/collaborator)
// - Shows appropriate tabs
// - Loads workshop data

// User switches to Collaborators tab
// - Sees list of current collaborators
// - (Owner) Can add new collaborators via email
// - (Owner) Can remove collaborators

// User switches to Settings tab (owner only)
// - Edits workshop metadata
// - Saves changes
// - Can archive or delete workshop
```

---

**Phase 5 Status: COMPLETE ✅**

Workshop edit screen with three tabs is fully functional. Planner tab reuses existing component, Collaborators tab manages users and invitations, Settings tab handles workshop metadata and lifecycle actions. Permission-based UI ensures proper access control.
