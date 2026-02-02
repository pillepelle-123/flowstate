import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Database } from '../../types/database'

type Session = Database['public']['Tables']['sessions']['Row']

interface DraggableSessionListProps {
  sessions: Session[]
  onReorder: (sessions: Session[]) => void
  onEdit: (session: Session) => void
  onDelete: (sessionId: string) => void
}

const SESSION_TYPE_ICONS: Record<string, string> = {
  input: '📝',
  interaction: '🤝',
  individual: '👤',
  group: '👥',
  break: '☕',
  orga: '📋',
}

export function DraggableSessionList({
  sessions,
  onReorder,
  onEdit,
  onDelete,
}: DraggableSessionListProps) {
  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<Session>) => (
    <ScaleDecorator>
      <View style={[styles.card, isActive && styles.cardActive]}>
        <TouchableOpacity 
          style={styles.dragHandle} 
          onLongPress={drag}
          delayLongPress={100}
        >
          <Text style={styles.dragIcon}>☰</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.content}
          onPress={() => onEdit(item)}
          disabled={isActive}
        >
          <View style={styles.header}>
            <Text style={styles.icon}>{SESSION_TYPE_ICONS[item.type]}</Text>
            <Text style={styles.title}>{item.title}</Text>
            {item.is_buffer && <Text style={styles.bufferBadge}>Puffer</Text>}
          </View>
          <Text style={styles.duration}>{item.planned_duration} Min</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
          disabled={isActive}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </ScaleDecorator>
  )

  return (
    <GestureHandlerRootView style={styles.container}>
      <DraggableFlatList
        data={sessions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => onReorder(data)}
        contentContainerStyle={styles.list}
        activationDistance={10}
      />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dragHandle: {
    marginRight: 12,
    padding: 4,
  },
  dragIcon: {
    fontSize: 20,
    color: '#9ca3af',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  bufferBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  duration: {
    fontSize: 14,
    color: '#6b7280',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 18,
  },
})
