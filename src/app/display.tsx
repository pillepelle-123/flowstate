import React from 'react'
import { View, StyleSheet } from 'react-native'
import { BeamerDashboard } from '../components/display'

export default function DisplayScreen() {
  // TODO: Workshop-ID aus URL-Parameter oder QR-Code
  const workshopId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

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
