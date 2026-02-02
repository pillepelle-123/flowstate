import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

export default function Index() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FlowState</Text>
      <Text style={styles.subtitle}>Workshop-Betriebssystem</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/moderator')}
      >
        <Text style={styles.buttonText}>Moderator</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { marginTop: 12 }]} 
        onPress={() => router.push('/participant')}
      >
        <Text style={styles.buttonText}>Teilnehmer</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { marginTop: 12, backgroundColor: '#6b7280' }]} 
        onPress={() => router.push('/planner')}
      >
        <Text style={styles.buttonText}>Workshop Planen</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
