import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { supabase } from '../../services/supabase'

interface StickyNotesViewProps {
  workshopId: string
  sessionId: string
}

interface StickyNote {
  id: string
  text: string
  color: string
}

export function StickyNotesView({ workshopId, sessionId }: StickyNotesViewProps) {
  const [notes, setNotes] = useState<StickyNote[]>([])

  useEffect(() => {
    loadNotes()
    const cleanup = subscribeToNotes()
    return cleanup
  }, [sessionId])

  const loadNotes = async () => {
    const { data } = await supabase
      .from('interactions')
      .select('id, data')
      .eq('session_id', sessionId)
      .eq('type', 'sticky_note')
      .order('created_at', { ascending: true })

    if (data) {
      setNotes(
        data.map((interaction) => ({
          id: interaction.id,
          text: (interaction.data as any)?.text || '',
          color: (interaction.data as any)?.color || '#fef08a',
        }))
      )
    }
  }

  const subscribeToNotes = () => {
    const channel = supabase
      .channel(`sticky_notes_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interactions',
        },
        (payload: any) => {
          console.log('Display received interaction:', payload.new)
          if (payload.new.session_id === sessionId && payload.new.type === 'sticky_note') {
            const newNote = {
              id: payload.new.id,
              text: payload.new.data?.text || '',
              color: payload.new.data?.color || '#fef08a',
            }
            console.log('Adding note to display:', newNote)
            setNotes((prev) => [...prev, newNote])
          }
        }
      )
      .subscribe((status) => {
        console.log('Display subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sticky Notes</Text>
      <ScrollView contentContainerStyle={styles.wall}>
        {notes.length === 0 && (
          <Text style={styles.emptyText}>Noch keine Sticky Notes vorhanden</Text>
        )}
        {notes.map((note) => (
          <View
            key={note.id}
            style={[styles.note, { backgroundColor: note.color }]}
          >
            <Text style={styles.noteText}>{note.text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 40,
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 40,
    textAlign: 'center',
  },
  wall: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  note: {
    width: 250,
    minHeight: 250,
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  noteText: {
    fontSize: 20,
    color: '#1f2937',
    lineHeight: 28,
  },
  emptyText: {
    fontSize: 24,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 100,
  },
})
