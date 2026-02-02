import { View, Text, StyleSheet } from 'react-native'
import { useTimer } from '../../hooks/useTimer'
import { formatTime, getTimerColor } from '../../utils/time'

interface TimerDisplayProps {
  workshopId: string
}

export function TimerDisplay({ workshopId }: TimerDisplayProps) {
  const { remainingMs, status } = useTimer(workshopId)

  const color = getTimerColor(remainingMs, 20 * 60 * 1000)

  return (
    <View style={styles.container}>
      <Text style={[styles.time, { color }]}>
        {formatTime(remainingMs)}
      </Text>
      <Text style={styles.status}>
        {status === 'running' ? 'Läuft' : status === 'paused' ? 'Pausiert' : 'Bereit'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  time: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
})
