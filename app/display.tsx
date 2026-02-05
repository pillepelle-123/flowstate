import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { BeamerDashboard } from '../src/components/display'

export default function DisplayScreen() {
  const { workshopId } = useLocalSearchParams<{ workshopId?: string }>()

  if (!workshopId) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#ef4444', fontSize: 24 }}>Keine Workshop-ID angegeben</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <BeamerDashboard workshopId={workshopId} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
