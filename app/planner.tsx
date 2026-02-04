import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { PlanningEditor } from '../src/components/planner'

export default function PlannerScreen() {
  const { workshopId } = useLocalSearchParams<{ workshopId?: string }>()

  return (
    <View style={styles.container}>
      <PlanningEditor workshopId={workshopId} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
