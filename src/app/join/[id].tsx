import { useLocalSearchParams, router } from 'expo-router'
import { useEffect } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'

export default function JoinRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()

  useEffect(() => {
    if (id) {
      // Weiterleitung zur Teilnehmer-Seite mit Workshop-ID
      router.replace(`/participant?workshopId=${id}`)
    }
  }, [id])

  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="mt-4 text-gray-600">Workshop wird geladen...</Text>
    </View>
  )
}
