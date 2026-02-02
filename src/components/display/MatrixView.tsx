import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { supabase } from '../../services/supabase'

interface MatrixViewProps {
  workshopId: string
  sessionId: string
}

interface MatrixPoint {
  id: string
  x: number
  y: number
}

export function MatrixView({ workshopId, sessionId }: MatrixViewProps) {
  const [points, setPoints] = useState<MatrixPoint[]>([])
  const [labels] = useState({ x: 'Aufwand', y: 'Nutzen' })

  useEffect(() => {
    loadPoints()
    subscribeToPoints()
  }, [sessionId])

  const loadPoints = async () => {
    const { data } = await supabase
      .from('interactions')
      .select('id, data')
      .eq('session_id', sessionId)
      .eq('type', 'vote_2d')

    if (data) {
      setPoints(
        data.map((interaction) => ({
          id: interaction.id,
          x: interaction.data?.x || 0,
          y: interaction.data?.y || 0,
        }))
      )
    }
  }

  const subscribeToPoints = () => {
    const channel = supabase
      .channel(`matrix:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interactions',
          filter: `session_id=eq.${sessionId}`,
        },
        () => loadPoints()
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>2D Matrix Voting</Text>
      <View style={styles.matrixContainer}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{labels.y}</Text>
        </View>
        <View style={styles.plotArea}>
          {points.map((point) => (
            <View
              key={point.id}
              style={[
                styles.point,
                {
                  left: `${point.x}%`,
                  bottom: `${point.y}%`,
                },
              ]}
            />
          ))}
        </View>
      </View>
      <Text style={styles.xAxisLabel}>{labels.x}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 40,
  },
  matrixContainer: {
    flexDirection: 'row',
    width: 800,
    height: 600,
  },
  yAxis: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  axisLabel: {
    fontSize: 28,
    color: '#cbd5e1',
    transform: [{ rotate: '-90deg' }],
  },
  plotArea: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#475569',
  },
  point: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    transform: [{ translateX: -10 }, { translateY: 10 }],
  },
  xAxisLabel: {
    fontSize: 28,
    color: '#cbd5e1',
    marginTop: 20,
  },
})
