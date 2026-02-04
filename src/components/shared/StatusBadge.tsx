import React from 'react'
import { Chip } from 'react-native-paper'

interface StatusBadgeProps {
  isCompleted: boolean
  isArchived: boolean
  compact?: boolean
}

export function StatusBadge({ isCompleted, isArchived, compact = false }: StatusBadgeProps) {
  if (isArchived) {
    return (
      <Chip compact={compact} icon="archive" style={{ backgroundColor: '#9ca3af' }}>
        Archived
      </Chip>
    )
  }
  
  if (isCompleted) {
    return (
      <Chip compact={compact} icon="check-circle" style={{ backgroundColor: '#10b981' }}>
        Completed
      </Chip>
    )
  }
  
  return (
    <Chip compact={compact} icon="clock-outline">
      Active
    </Chip>
  )
}
