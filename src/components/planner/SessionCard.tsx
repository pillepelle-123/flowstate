import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
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

const TYPE_COLORS: Record<SessionType, string> = {
  input: '#3b82f6',
  interaction: '#8b5cf6',
  individual: '#10b981',
  group: '#f59e0b',
  break: '#6b7280',
  orga: '#ef4444',
}

export function SessionCard({ session, onEdit, onDelete }: SessionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={styles.icon}>{TYPE_ICONS[session.type]}</Text>
          <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[session.type] }]}>
            <Text style={styles.typeText}>{session.type}</Text>
          </View>
          {session.is_buffer && <Text style={styles.bufferBadge}>🔵 Buffer</Text>}
        </View>
        <Text style={styles.duration}>{session.planned_duration} Min</Text>
      </View>

      <Text style={styles.title}>{session.title}</Text>
      
      {session.description && (
        <Text style={styles.description} numberOfLines={2}>{session.description}</Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(session)}>
          <Text style={styles.actionText}>✏️ Bearbeiten</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(session.id)}>
          <Text style={[styles.actionText, styles.deleteText]}>🗑️ Löschen</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { fontSize: 20 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeText: { fontSize: 12, fontWeight: '600', color: '#ffffff', textTransform: 'capitalize' },
  bufferBadge: { fontSize: 12, color: '#3b82f6' },
  duration: { fontSize: 16, fontWeight: '700', color: '#111827' },
  title: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 },
  description: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  actionButton: { flex: 1, padding: 8, alignItems: 'center' },
  actionText: { fontSize: 14, fontWeight: '600', color: '#3b82f6' },
  deleteText: { color: '#ef4444' },
})
