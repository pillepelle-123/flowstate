import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MotiView } from 'moti'
import Svg, { Circle, Path } from 'react-native-svg'

interface BreakScreenProps {
  remainingMs: number
  totalMs: number
}

export function BreakScreen({ remainingMs, totalMs }: BreakScreenProps) {
  const minutes = Math.floor(remainingMs / 60000)
  const seconds = Math.floor((remainingMs % 60000) / 1000)
  const progress = 1 - remainingMs / totalMs

  return (
    <View style={styles.container}>
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'timing', duration: 600 }}
        style={styles.content}
      >
        <Text style={styles.title}>Pause</Text>
        
        <View style={styles.coffeeContainer}>
          <MotiView
            animate={{
              translateY: [0, -10, 0],
            }}
            transition={{
              type: 'timing',
              duration: 2000,
              loop: true,
            }}
          >
            <Svg width={200} height={200} viewBox="0 0 200 200">
              {/* Kaffeetasse */}
              <Path
                d="M40 80 L40 140 Q40 160 60 160 L140 160 Q160 160 160 140 L160 80 Z"
                fill="#8b4513"
                opacity={0.9}
              />
              {/* Henkel */}
              <Path
                d="M160 100 Q180 100 180 120 Q180 140 160 140"
                stroke="#8b4513"
                strokeWidth={8}
                fill="none"
              />
              {/* Kaffee-Füllung */}
              <Path
                d={`M45 ${80 + (1 - progress) * 75} L45 135 Q45 155 60 155 L140 155 Q155 155 155 135 L155 ${80 + (1 - progress) * 75} Z`}
                fill="#3e2723"
              />
              {/* Dampf */}
              <MotiView
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  type: 'timing',
                  duration: 1500,
                  loop: true,
                }}
              >
                <Path
                  d="M70 60 Q75 40 80 60"
                  stroke="#cbd5e1"
                  strokeWidth={3}
                  fill="none"
                  opacity={0.6}
                />
                <Path
                  d="M100 50 Q105 30 110 50"
                  stroke="#cbd5e1"
                  strokeWidth={3}
                  fill="none"
                  opacity={0.6}
                />
                <Path
                  d="M130 60 Q135 40 140 60"
                  stroke="#cbd5e1"
                  strokeWidth={3}
                  fill="none"
                  opacity={0.6}
                />
              </MotiView>
            </Svg>
          </MotiView>
        </View>

        <Text style={styles.timer}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Text>
        
        <Text style={styles.subtitle}>Zeit zum Durchatmen</Text>
      </MotiView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 40,
  },
  coffeeContainer: {
    marginVertical: 40,
  },
  timer: {
    fontSize: 96,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 36,
    color: '#94a3b8',
    marginTop: 20,
  },
})
