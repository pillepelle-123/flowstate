import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Surface, useTheme } from 'react-native-paper'
import { Database } from '../../types/database'

type Session = Database['public']['Tables']['sessions']['Row']

interface TimelineViewProps {
  sessions: Session[]
  totalDuration: number
}

export function TimelineView({ sessions, totalDuration }: TimelineViewProps) {
  const theme = useTheme()
  let cumulativeTime = 0

  return (
    <ScrollView style={styles.container}>
      <View style={styles.timeline}>
        {sessions.map((session, index) => {
          const startTime = cumulativeTime
          cumulativeTime += session.planned_duration
          const widthPercent = (session.planned_duration / totalDuration) * 100

          return (
            <View key={session.id} style={styles.sessionBlock}>
              <Surface
                style={[
                  styles.bar,
                  { width: `${widthPercent}%`, backgroundColor: theme.colors.primary }
                ]}
                elevation={1}
              >
                <Text variant="bodyMedium" style={styles.barText}>{session.title}</Text>
                <Text variant="bodySmall" style={styles.barDuration}>{session.planned_duration}m</Text>
              </Surface>
              <Text variant="bodySmall" style={styles.timeLabel}>
                {Math.floor(startTime / 60)}:{String(startTime % 60).padStart(2, '0')}
              </Text>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  timeline: {
    gap: 8,
  },
  sessionBlock: {
    marginBottom: 12,
  },
  bar: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  barText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  barDuration: {
    color: '#ffffff',
    marginTop: 4,
  },
  timeLabel: {
    marginTop: 4,
    opacity: 0.7,
  },
})
