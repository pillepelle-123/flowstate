import React from 'react'
import { FlatList, View, StyleSheet } from 'react-native'
import { Text, ActivityIndicator } from 'react-native-paper'
import { WorkshopCard } from './WorkshopCard'
import { WorkshopUserRole } from '../../types/database'

interface Workshop {
  id: string
  title: string
  date: string | null
  is_completed: boolean
  is_archived: boolean
  workshop_users: Array<{ role: WorkshopUserRole }>
}

interface WorkshopListProps {
  workshops: Workshop[]
  loading: boolean
  onWorkshopPress: (id: string) => void
  onStart: (id: string) => void
  onEdit: (id: string) => void
  onArchive: (id: string) => void
  emptyMessage?: string
}

export function WorkshopList({
  workshops,
  loading,
  onWorkshopPress,
  onStart,
  onEdit,
  onArchive,
  emptyMessage = 'No workshops found'
}: WorkshopListProps) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (workshops.length === 0) {
    return (
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          {emptyMessage}
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={workshops}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <WorkshopCard
          workshop={item}
          role={item.workshop_users[0]?.role || 'collaborator'}
          onPress={() => onWorkshopPress(item.id)}
          onStart={() => onStart(item.id)}
          onEdit={() => onEdit(item.id)}
          onArchive={() => onArchive(item.id)}
        />
      )}
      contentContainerStyle={styles.list}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
})
