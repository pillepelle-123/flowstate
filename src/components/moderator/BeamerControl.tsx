import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { supabase } from '../../services/supabase'

type DisplayMode = 'timer' | 'voting' | 'sticky_notes' | 'matrix'

interface BeamerControlProps {
  workshopId: string
}

export function BeamerControl({ workshopId }: BeamerControlProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('timer')
  const [loading, setLoading] = useState(false)

  const updateDisplayMode = async (mode: DisplayMode) => {
    setLoading(true)
    try {
      const channel = supabase.channel(`workshop:${workshopId}`)
      
      await channel.send({
        type: 'broadcast',
        event: 'display_mode_change',
        payload: { mode, timestamp: Date.now() },
      })

      setDisplayMode(mode)
    } catch (error) {
      console.error('Display mode update failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const pushMaterialLink = async () => {
    try {
      const channel = supabase.channel(`workshop:${workshopId}`)
      
      await channel.send({
        type: 'broadcast',
        event: 'material_push',
        payload: { timestamp: Date.now() },
      })

      alert('Material-Link an Teilnehmer gesendet')
    } catch (error) {
      alert('Fehler beim Senden')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Beamer-Steuerung</Text>
      
      <View style={styles.modeContainer}>
        <Text style={styles.label}>Beamer zeigt:</Text>
        <View style={styles.modeButtons}>
          <TouchableOpacity
            style={[styles.modeButton, displayMode === 'timer' && styles.modeButtonActive]}
            onPress={() => updateDisplayMode('timer')}
            disabled={loading}
          >
            <Text style={[styles.modeText, displayMode === 'timer' && styles.modeTextActive]}>
              ⏱️ Timer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, displayMode === 'voting' && styles.modeButtonActive]}
            onPress={() => updateDisplayMode('voting')}
            disabled={loading}
          >
            <Text style={[styles.modeText, displayMode === 'voting' && styles.modeTextActive]}>
              📊 Voting
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, displayMode === 'sticky_notes' && styles.modeButtonActive]}
            onPress={() => updateDisplayMode('sticky_notes')}
            disabled={loading}
          >
            <Text style={[styles.modeText, displayMode === 'sticky_notes' && styles.modeTextActive]}>
              📝 Sticky Notes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, displayMode === 'matrix' && styles.modeButtonActive]}
            onPress={() => updateDisplayMode('matrix')}
            disabled={loading}
          >
            <Text style={[styles.modeText, displayMode === 'matrix' && styles.modeTextActive]}>
              📈 Matrix
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.pushButton} onPress={pushMaterialLink}>
        <Text style={styles.pushButtonText}>📎 Material an Teilnehmer pushen</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  modeContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  modeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  modeButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeTextActive: {
    color: '#3b82f6',
  },
  pushButton: {
    backgroundColor: '#8b5cf6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pushButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
})
