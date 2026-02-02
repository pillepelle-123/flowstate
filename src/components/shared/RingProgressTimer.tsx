import React, { useEffect } from 'react'
import { View, Text } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { MotiView } from 'moti'
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface RingProgressTimerProps {
  remainingMs: number
  totalMs: number
  size?: number
  strokeWidth?: number
}

export function RingProgressTimer({ 
  remainingMs, 
  totalMs, 
  size = 280, 
  strokeWidth = 20 
}: RingProgressTimerProps) {
  const progress = useSharedValue(1)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  const minutes = Math.floor(remainingMs / 60000)
  const seconds = Math.floor((remainingMs % 60000) / 1000)
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  // Farblogik: Grün → Gelb (5min) → Rot (1min)
  const getColor = () => {
    if (remainingMs <= 60000) return '#ef4444' // Rot
    if (remainingMs <= 300000) return '#eab308' // Gelb
    return '#22c55e' // Grün
  }

  // Haptic Feedback bei Schwellenwerten
  useEffect(() => {
    if (remainingMs === 300000 || remainingMs === 60000) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    }
  }, [Math.floor(remainingMs / 1000)])

  // Progress Animation
  useEffect(() => {
    progress.value = withTiming(totalMs > 0 ? remainingMs / totalMs : 0, { duration: 100 })
  }, [remainingMs, totalMs])

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }))

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>
      
      {/* Zeit-Anzeige */}
      <MotiView
        style={{ position: 'absolute' }}
        animate={{ scale: remainingMs <= 60000 ? [1, 1.05, 1] : 1 }}
        transition={{ type: 'timing', duration: 1000, loop: remainingMs <= 60000 }}
      >
        <Text className="text-6xl font-bold" style={{ color: getColor() }}>
          {timeString}
        </Text>
      </MotiView>
    </View>
  )
}
