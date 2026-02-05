import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MotiView } from 'moti'
import { RingProgressTimer } from '../shared/RingProgressTimer'
import { Database } from '../../types/database'

type Session = Database['public']['Tables']['sessions']['Row']

interface FocusModeLayoutProps {
  workshopTitle: string
  currentSession: Session | null
  remainingMs: number
  totalMs: number
  nextStep?: string
}

export function FocusModeLayout({
  workshopTitle,
  currentSession,
  remainingMs,
  totalMs,
  nextStep,
}: FocusModeLayoutProps) {
  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.header}
      >
        <Text style={styles.workshopTitle}>{workshopTitle}</Text>
      </MotiView>

      <View style={styles.mainContent}>
        {currentSession && (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
            style={styles.sessionInfo}
          >
            <Text style={styles.sessionLabel}>Aktuelle Phase:</Text>
            <Text style={styles.sessionTitle}>{currentSession.title}</Text>
            {currentSession.description && (
              <Text style={styles.sessionDescription}>{currentSession.description}</Text>
            )}
          </MotiView>
        )}

        <View style={styles.timerContainer}>
          <RingProgressTimer
            remainingMs={remainingMs}
            totalMs={totalMs}
            size={400}
            strokeWidth={32}
          />
        </View>
      </View>

      {nextStep && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 400 }}
          style={styles.nextStepContainer}
        >
          <Text style={styles.nextStepLabel}>Nächster Schritt:</Text>
          <Text style={styles.nextStepText}>→ {nextStep}</Text>
        </MotiView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 40,
  },
  header: {
    position: 'absolute',
    top: 40,
    right: 40,
  },
  workshopTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'right',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 60,
  },
  sessionInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '50%',
  },
  sessionLabel: {
    fontSize: 24,
    color: '#94a3b8',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  sessionDescription: {
    fontSize: 28,
    color: '#cbd5e1',
    lineHeight: 40,
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepContainer: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 12,
    maxWidth: 400,
  },
  nextStepLabel: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 8,
  },
  nextStepText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
})
