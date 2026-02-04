import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Card, Button, Chip, useTheme } from 'react-native-paper'
import { Database } from '../../types/database'

type Session = Database['public']['Tables']['sessions']['Row']
type SessionType = Database['public']['Enums']['session_type']

interface SessionCardProps {
  session: Session
  onEdit: (session: Session) => void
  onDelete: (sessionId: string) => void
}

const TYPE_ICONS: Record<SessionType, string> = {
  input: '📝',
  interaction: '💬',
  individual: '👤',
  group: '👥',
  break: '☕',
  orga: '📋',
}

export function SessionCard({ session, onEdit, onDelete }: SessionCardProps) {
  const theme = useTheme()

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            <Text variant="titleLarge">{TYPE_ICONS[session.type]}</Text>
            <Chip compact>{session.type}</Chip>
            {session.is_buffer && (
              <Chip compact icon="buffer" style={{ backgroundColor: theme.colors.tertiaryContainer }}>
                Buffer
              </Chip>
            )}
          </View>
          <Text variant="titleMedium">{session.planned_duration} min</Text>
        </View>

        <Text variant="titleLarge" style={styles.title}>{session.title}</Text>
        
        {session.description && (
          <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>
            {session.description}
          </Text>
        )}
      </Card.Content>

      <Card.Actions>
        <Button icon="pencil" onPress={() => onEdit(session)}>Edit</Button>
        <Button icon="delete" textColor={theme.colors.error} onPress={() => onDelete(session.id)}>
          Delete
        </Button>
      </Card.Actions>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    opacity: 0.7,
  },
})
