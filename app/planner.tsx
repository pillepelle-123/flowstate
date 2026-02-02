import React from 'react'
import { View, StyleSheet } from 'react-native'
import { PlanningEditor } from '../src/components/planner'

export default function PlannerScreen() {
  return (
    <View style={styles.container}>
      <PlanningEditor />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
