import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Card, IconButton, Chip, useTheme } from 'react-native-paper'
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
  const theme = useTheme()

  const renderItem = ({ item, drag, isActive }: RenderItemParams<Session>) => (
    <ScaleDecorator>
      <Card
        style={[styles.card, isActive && { backgroundColor: theme.colors.primaryContainer }]}
        onPress={() => !isActive && onEdit(item)}
      >
        <Card.Content style={styles.content}>
          <IconButton
            icon="drag-horizontal-variant"
            size={20}
            onLongPress={drag}
            style={styles.dragHandle}
          />
          <View style={styles.info}>
            <View style={styles.header}>
              <Text variant="bodyLarge">{SESSION_TYPE_ICONS[item.type]} {item.title}</Text>
              {item.is_buffer && (
                <Chip compact style={{ backgroundColor: theme.colors.tertiaryContainer }}>Buffer</Chip>
              )}
            </View>
            <Text variant="bodyMedium" style={{ opacity: 0.7 }}>{item.planned_duration} min</Text>
          </View>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => !isActive && onDelete(item.id)}
          />
        </Card.Content>
      </Card>
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
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    margin: 0,
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
})
