import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Database } from '../../types/database'

type Session = Database['public']['Tables']['sessions']['Row']

interface TimelineViewProps {
  sessions: Session[]
  totalDuration: number
}

export function TimelineView({ sessions, totalDuration }: TimelineViewProps) {
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
              <View style={[styles.bar, { width: `${widthPercent}%` }]}>
                <Text style={styles.barText}>{session.title}</Text>
                <Text style={styles.barDuration}>{session.planned_duration}m</Text>
              </View>
              <Text style={styles.timeLabel}>
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
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  barText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  barDuration: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
})
