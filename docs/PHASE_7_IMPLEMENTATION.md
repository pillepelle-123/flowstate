# Phase 7: Workshop Lifecycle Management - Implementation Complete

## Overview
Phase 7 implements complete workshop lifecycle operations including start, reset, complete, archive, restore, and delete with confirmation dialogs.

## Implemented Features

### 1. Workshop Service Methods (Already Existed)
- ✅ `startSession()` - Start first session and navigate to moderator view
- ✅ `resetWorkshop()` - Reset state and delete interactions
- ✅ `markAsCompleted()` - Mark workshop as completed
- ✅ `archiveWorkshop()` - Archive workshop
- ✅ `restoreWorkshop()` - Restore archived workshop
- ✅ `deleteWorkshop()` - Hard delete with cascade

### 2. New Components

#### ConfirmDialog
- **File**: `src/components/shared/ConfirmDialog.tsx`
- **Purpose**: Reusable confirmation dialog for destructive actions
- **Props**: title, message, confirmLabel, confirmColor, onConfirm, onCancel

#### StatusBadge
- **File**: `src/components/shared/StatusBadge.tsx`
- **Purpose**: Display workshop status (Active/Completed/Archived)
- **Features**: Icon + color coding

#### StartWorkshopButton
- **File**: `src/components/workshop/StartWorkshopButton.tsx`
- **Features**:
  - Confirmation dialog before starting
  - Warning for restarting completed workshops
  - Auto-start first session
  - Navigate to moderator view

### 3. Enhanced Components

#### SettingsTab
- **File**: `src/components/workshop/SettingsTab.tsx`
- **New Actions**:
  - Reset Workshop (with confirmation)
  - Archive Workshop (with confirmation)
  - Delete Workshop (with confirmation)
  - Save as Template
- **Permissions**: Owner-only actions

#### WorkshopCard
- **File**: `src/components/dashboard/WorkshopCard.tsx`
- **Enhancement**: Uses StatusBadge for consistent status display

#### TimerControlService
- **File**: `src/services/timerControl.ts`
- **Enhancement**: Auto-complete detection when last session ends

## Lifecycle Operations

### 1. Start Workshop
```typescript
// Triggered from: Dashboard, Edit Screen
async function startWorkshop(workshopId: string) {
  // 1. Get first session
  const sessions = await WorkshopService.getSessions(workshopId)
  const firstSession = sessions.sort((a, b) => a.order_index - b.order_index)[0]
  
  // 2. Start session
  if (firstSession) {
    await WorkshopService.startSession(workshopId, firstSession.id)
  }
  
  // 3. Navigate to moderator
  router.push(`/moderator?workshopId=${workshopId}`)
}
```

**Confirmation**: Shows warning if workshop is already completed

### 2. Reset Workshop
```typescript
// Triggered from: Settings Tab (Owner only)
async function resetWorkshop(workshopId: string) {
  // 1. Reset workshop_states
  // 2. Delete all interactions
  // 3. Reset session actual_duration
  // 4. Set is_completed to false
}
```

**Confirmation**: "Reset workshop? All participant interactions will be deleted."

### 3. Auto-Complete Detection
```typescript
// Triggered in: TimerControlService.completeSession()
async function completeSession(workshopId: string, sessionId: string) {
  // 1. Update session actual_duration
  // 2. Reset workshop_states
  // 3. Check if last session
  if (isLastSession) {
    // 4. Mark workshop as completed
    await markAsCompleted(workshopId)
  }
}
```

**Automatic**: No user interaction required

### 4. Archive Workshop
```typescript
// Triggered from: Settings Tab, Dashboard
async function archiveWorkshop(workshopId: string) {
  await supabase
    .from('workshops')
    .update({
      is_archived: true,
      archived_at: new Date().toISOString()
    })
    .eq('id', workshopId)
}
```

**Confirmation**: "Archive this workshop? You can restore it later."

### 5. Restore Workshop
```typescript
// Triggered from: Dashboard (Archived tab)
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

**No confirmation**: Non-destructive action

### 6. Delete Workshop
```typescript
// Triggered from: Settings Tab (Owner only)
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

**Confirmation**: "Permanently delete this workshop? This cannot be undone."
**Color**: Red (#ef4444)

## Status Badges

### Active
- **Icon**: clock-outline
- **Color**: Default theme color
- **Condition**: `!is_completed && !is_archived`

### Completed
- **Icon**: check-circle
- **Color**: Green (#10b981)
- **Condition**: `is_completed && !is_archived`

### Archived
- **Icon**: archive
- **Color**: Gray (#9ca3af)
- **Condition**: `is_archived`

## Permissions

### Owner Can:
- Start workshop
- Reset workshop
- Archive workshop
- Restore workshop
- Delete workshop
- Save as template

### Collaborator Can:
- Start workshop
- View status

### Collaborator Cannot:
- Reset workshop
- Archive workshop
- Delete workshop
- Save as template

## UI Flow

### Settings Tab (Owner)
```
[Workshop Form]
  ↓
[Save Button]
  ↓
[Divider]
  ↓
[Save as Template] → Creates template copy
[Reset Workshop] → Confirmation → Reset
[Archive Workshop] → Confirmation → Archive → Back to dashboard
[Delete Workshop] → Confirmation (Red) → Delete → Redirect to dashboard
```

### Dashboard Card Actions
```
[Workshop Card]
  ├─ [Play Icon] → Start Workshop → Confirmation → Moderator View
  ├─ [Edit Icon] → Edit Screen
  └─ [Archive Icon] → Confirmation → Archive
```

### Start Workshop Flow
```
[Start Button Clicked]
  ↓
[Check if completed]
  ├─ Yes → Show warning: "This will reset progress"
  └─ No → Show confirmation: "Start workshop now?"
  ↓
[User confirms]
  ↓
[Get first session]
  ↓
[Start session in database]
  ↓
[Navigate to /moderator?workshopId={id}]
```

## Database State Transitions

### Workshop Status Flow
```
planned → running → paused → running → ... → completed
   ↓                                              ↓
archived ←──────────────────────────────────────┘
   ↓
restored (back to planned/completed)
   ↓
deleted (permanent)
```

### Reset Operation
```
completed/running → planned
- Clears all interactions
- Resets session durations
- Resets workshop_states
```

## Testing Checklist

- [ ] Start workshop from dashboard
- [ ] Start workshop from edit screen
- [ ] Start completed workshop (shows warning)
- [ ] Reset workshop (clears interactions)
- [ ] Complete last session (auto-marks workshop as completed)
- [ ] Archive workshop (owner only)
- [ ] Restore archived workshop
- [ ] Delete workshop (owner only, with confirmation)
- [ ] Verify collaborator cannot reset/archive/delete
- [ ] Status badges display correctly
- [ ] Confirmation dialogs work for all actions
- [ ] Navigation after actions works correctly

## Error Handling

All operations include try-catch blocks with user-friendly error messages:
- "Failed to start workshop"
- "Failed to reset workshop"
- "Failed to archive workshop"
- "Failed to delete workshop"

## Next Steps

**Phase 8**: Template System
- Save workshops as templates
- Create from templates
- Template list view
- Template badge
- Template selection in create flow
