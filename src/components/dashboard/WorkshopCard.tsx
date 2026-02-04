import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Surface, Text, Chip, IconButton, useTheme } from 'react-native-paper'
import { WorkshopUserRole } from '../../types/database'
import { canArchive, canStart } from '../../utils/permissions'
import { StatusBadge } from '../shared/StatusBadge'

interface WorkshopCardProps {
  workshop: {
    id: string
    title: string
    date: string | null
    is_completed: boolean
    is_archived: boolean
  }
  role: WorkshopUserRole
  onPress: () => void
  onStart: () => void
  onEdit: () => void
  onArchive?: () => void
}

export function WorkshopCard({ workshop, role, onPress, onStart, onEdit, onArchive }: WorkshopCardProps) {
  const theme = useTheme()

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date set'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.content} onTouchEnd={onPress}>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
            {workshop.title}
          </Text>
          <View style={styles.badges}>
            <Chip
              mode="flat"
              compact
              style={[
                styles.badge,
                { backgroundColor: role === 'owner' ? theme.colors.primaryContainer : theme.colors.secondaryContainer }
              ]}
              textStyle={{ fontSize: 11 }}
            >
              {role === 'owner' ? 'Owner' : 'Collaborator'}
            </Chip>
            <StatusBadge 
              isCompleted={workshop.is_completed} 
              isArchived={workshop.is_archived} 
              compact 
            />
          </View>
        </View>

        <Text variant="bodySmall" style={styles.date}>
          {formatDate(workshop.date)}
        </Text>
      </View>

      <View style={styles.actions}>
        {canStart(role) && !workshop.is_completed && (
          <IconButton icon="play" size={20} onPress={onStart} />
        )}
        <IconButton icon="pencil" size={20} onPress={onEdit} />
        {canArchive(role) && onArchive && !workshop.is_archived && (
          <IconButton icon="archive" size={20} onPress={onArchive} />
        )}
      </View>
    </Surface>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontWeight: '600',
    marginRight: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    height: 24,
  },
  date: {
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    paddingRight: 4,
  },
})
