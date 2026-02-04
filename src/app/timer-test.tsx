import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native'
import { useState } from 'react'
import { TimerDisplay } from '../components/shared/TimerDisplay'
import { TimerControlService } from '../services/timerControl'
import { WorkshopService } from '../services/workshop'

export default function TimerTest() {
  const [workshopId, setWorkshopId] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [testWorkshopId, setTestWorkshopId] = useState<string | null>(null)

  const createTestWorkshop = async () => {
    try {
      const workshop = await WorkshopService.createWorkshop({
        title: 'Test Workshop',
        total_duration: 60,
        buffer_strategy: 'distributed',
      })

      const session = await WorkshopService.createSession({
        workshop_id: workshop.id,
        title: 'Test Session',
        type: 'input',
        planned_duration: 20,
        order_index: 0,
      })

      setWorkshopId(workshop.id)
      setSessionId(session.id)
      setTestWorkshopId(workshop.id)
      Alert.alert('Erfolg', 'Test-Workshop erstellt!')
    } catch (error: any) {
      Alert.alert('Fehler', error.message)
    }
  }

  const startTimer = async () => {
    if (!workshopId || !sessionId) {
      Alert.alert('Fehler', 'Bitte erst Workshop erstellen')
      return
    }
    try {
      console.log('Starting timer...', { workshopId, sessionId })
      await TimerControlService.startSession(workshopId, sessionId, 20)
      console.log('Timer started successfully')
      
      // Force reload state
      const state = await WorkshopService.getWorkshopState(workshopId)
      console.log('State after start:', state)
      
      Alert.alert('Timer gestartet', '20 Minuten')
    } catch (error: any) {
      console.error('Timer start error:', error)
      Alert.alert('Fehler', error.message)
    }
  }

  const pauseTimer = async () => {
    if (!workshopId) return
    try {
      await TimerControlService.pauseSession(workshopId)
      Alert.alert('Timer pausiert')
    } catch (error: any) {
      Alert.alert('Fehler', error.message)
    }
  }

  const extendTimer = async () => {
    if (!workshopId) return
    try {
      await TimerControlService.extendSession(workshopId, 5)
      Alert.alert('Timer verlängert', '+5 Minuten')
    } catch (error: any) {
      Alert.alert('Fehler', error.message)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timer Engine Test</Text>

      <TouchableOpacity style={styles.button} onPress={createTestWorkshop}>
        <Text style={styles.buttonText}>1. Test-Workshop erstellen</Text>
      </TouchableOpacity>

      {workshopId && (
        <View style={styles.info}>
          <Text style={styles.infoText}>Workshop ID: {workshopId.slice(0, 8)}...</Text>
          <Text style={styles.infoText}>Session ID: {sessionId.slice(0, 8)}...</Text>
        </View>
      )}

      {testWorkshopId && (
        <>
          <View style={styles.timerContainer}>
            <TimerDisplay workshopId={testWorkshopId} />
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={[styles.button, styles.startButton]} onPress={startTimer}>
              <Text style={styles.buttonText}>▶ Start (20min)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.pauseButton]} onPress={pauseTimer}>
              <Text style={styles.buttonText}>⏸ Pause</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.extendButton]} onPress={extendTimer}>
              <Text style={styles.buttonText}>+5 Min</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Test-Anleitung:</Text>
        <Text style={styles.instruction}>1. "Test-Workshop erstellen" klicken</Text>
        <Text style={styles.instruction}>2. "Start" klicken → Timer läuft 20min</Text>
        <Text style={styles.instruction}>3. "Pause" zum Pausieren</Text>
        <Text style={styles.instruction}>4. "+5 Min" zum Verlängern</Text>
        <Text style={styles.instruction}>5. Öffne in 2. Browser-Tab → Sync-Test</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
  },
  extendButton: {
    backgroundColor: '#8b5cf6',
  },
  info: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  controls: {
    marginBottom: 20,
  },
  instructions: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
})
