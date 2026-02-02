import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { WorkshopService } from '../../services/workshop'
import { WorkshopForm } from './WorkshopForm'
import { SessionEditor } from './SessionEditor'
import { TimelineView } from './TimelineView'
import { DraggableSessionList } from './DraggableSessionList'
import { MethodLibrary } from './MethodLibrary'
import { Database } from '../../types/database'

type Workshop = Database['public']['Tables']['workshops']['Row']
type Session = Database['public']['Tables']['sessions']['Row']

interface PlanningEditorProps {
  workshopId?: string
  onSave?: (workshopId: string) => void
}

export function PlanningEditor({ workshopId, onSave }: PlanningEditorProps) {
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [showWorkshopForm, setShowWorkshopForm] = useState(!workshopId)
  const [showSessionEditor, setShowSessionEditor] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | undefined>()
  const [showTimeline, setShowTimeline] = useState(false)
  const [showMethodLibrary, setShowMethodLibrary] = useState(false)

  useEffect(() => {
    if (workshopId) {
      loadWorkshop()
    }
  }, [workshopId])

  const loadWorkshop = async () => {
    if (!workshopId && !workshop?.id) return
    const id = workshopId || workshop?.id
    if (!id) return
    setLoading(true)
    try {
      const [workshopData, sessionsData] = await Promise.all([
        WorkshopService.getWorkshop(id),
        WorkshopService.getSessions(id),
      ])
      setWorkshop(workshopData)
      setSessions(sessionsData)
    } catch (error) {
      Alert.alert('Fehler', 'Workshop konnte nicht geladen werden')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleWorkshopSubmit = async (formData: any) => {
    setLoading(true)
    try {
      const newWorkshop = await WorkshopService.createWorkshop({
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        total_duration: formData.totalDuration,
        buffer_strategy: formData.bufferStrategy,
      })
      setWorkshop(newWorkshop)
      setSessions([])
      setShowWorkshopForm(false)
      onSave?.(newWorkshop.id)
    } catch (error) {
      Alert.alert('Fehler', 'Workshop konnte nicht gespeichert werden')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSessionSave = async (sessionData: any) => {
    if (!workshop) {
      Alert.alert('Fehler', 'Kein Workshop ausgewählt')
      return
    }
    setLoading(true)
    try {
      if (sessionData.id) {
        await WorkshopService.updateSession(sessionData.id, sessionData)
      } else {
        await WorkshopService.createSession({
          ...sessionData,
          workshop_id: workshop.id,
          order_index: sessions.length,
        })
      }
      await loadWorkshop()
      setShowSessionEditor(false)
      setEditingSession(undefined)
    } catch (error) {
      Alert.alert('Fehler', 'Session konnte nicht gespeichert werden')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSessionDelete = async (sessionId: string) => {
    Alert.alert('Session löschen', 'Möchtest du diese Session wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            await WorkshopService.deleteSession(sessionId)
            await loadWorkshop()
          } catch (error) {
            Alert.alert('Fehler', 'Session konnte nicht gelöscht werden')
          }
        },
      },
    ])
  }

  const handleSessionReorder = async (reorderedSessions: Session[]) => {
    const updatedSessions = reorderedSessions.map((session, index) => ({
      ...session,
      order_index: index,
    }))
    setSessions(updatedSessions)
    try {
      await Promise.all(
        updatedSessions.map((session) =>
          WorkshopService.updateSession(session.id, { order_index: session.order_index })
        )
      )
    } catch (error) {
      Alert.alert('Fehler', 'Reihenfolge konnte nicht gespeichert werden')
      await loadWorkshop()
    }
  }

  const handleTemplateSelect = async (template: any) => {
    if (!workshop) return
    try {
      await WorkshopService.createSession({
        workshop_id: workshop.id,
        title: template.name,
        type: 'interaction',
        planned_duration: template.default_duration || 30,
        description: template.description || '',
        order_index: sessions.length,
        is_buffer: false,
      })
      await loadWorkshop()
      setShowMethodLibrary(false)
    } catch (error) {
      Alert.alert('Fehler', 'Session konnte nicht erstellt werden')
    }
  }

  const totalPlannedDuration = sessions.reduce((sum, s) => sum + s.planned_duration, 0)
  const isOverTime = workshop && totalPlannedDuration > workshop.total_duration

  if (showWorkshopForm) {
    return (
      <WorkshopForm
        initialData={workshop ? {
          title: workshop.title,
          description: workshop.description || '',
          date: workshop.date,
          totalDuration: workshop.total_duration,
          bufferStrategy: workshop.buffer_strategy,
        } : undefined}
        onSubmit={handleWorkshopSubmit}
      />
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{workshop?.title || 'Neuer Workshop'}</Text>
          <Text style={styles.subtitle}>
            {totalPlannedDuration} / {workshop?.total_duration} Min
            {isOverTime && <Text style={styles.warning}> ⚠️ Überschreitung!</Text>}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowMethodLibrary(!showMethodLibrary)}
          >
            <Text style={styles.headerButtonText}>📚</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowTimeline(!showTimeline)}
          >
            <Text style={styles.headerButtonText}>
              {showTimeline ? '📋' : '📊'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showMethodLibrary ? (
        <MethodLibrary onSelectTemplate={handleTemplateSelect} />
      ) : showTimeline ? (
        <TimelineView sessions={sessions} totalDuration={workshop?.total_duration || 0} />
      ) : (
        <DraggableSessionList
          sessions={sessions}
          onReorder={handleSessionReorder}
          onEdit={(s) => {
            setEditingSession(s)
            setShowSessionEditor(true)
          }}
          onDelete={handleSessionDelete}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingSession(undefined)
          setShowSessionEditor(true)
        }}
      >
        <Text style={styles.addButtonText}>+ Session hinzufügen</Text>
      </TouchableOpacity>

      <SessionEditor
        visible={showSessionEditor}
        session={editingSession}
        onSave={handleSessionSave}
        onCancel={() => {
          setShowSessionEditor(false)
          setEditingSession(undefined)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  headerButtonText: {
    fontSize: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  warning: {
    color: '#ef4444',
    fontWeight: '600',
  },

  addButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
})
