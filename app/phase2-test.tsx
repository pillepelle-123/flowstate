import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { TimeSync } from '../src/services/timeSync'
import { BroadcastService } from '../src/services/broadcast'
import { supabase } from '../src/services/supabase'

export default function Phase2TestScreen() {
  const [serverTime, setServerTime] = useState<string>('')
  const [offset, setOffset] = useState<number>(0)
  const [lastSync, setLastSync] = useState<string>('')
  const [broadcastLog, setBroadcastLog] = useState<string[]>([])
  const [edgeFunctionResult, setEdgeFunctionResult] = useState<string>('')

  const workshopId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  const sessionId = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

  useEffect(() => {
    // Subscribe to broadcasts
    const unsubscribe = BroadcastService.subscribeToTimerCommands(workshopId, (payload) => {
      const log = `[${new Date().toLocaleTimeString()}] ${payload.command}: ${JSON.stringify(payload)}`
      setBroadcastLog((prev) => [log, ...prev].slice(0, 10))
    })

    return () => unsubscribe()
  }, [])

  const testTimeSync = async () => {
    try {
      const offset = await TimeSync.syncServerTime()
      setOffset(offset)
      setServerTime(new Date(TimeSync.getServerTime()).toISOString())
      setLastSync(new Date().toLocaleTimeString())
    } catch (error) {
      alert('Time Sync Error: ' + error.message)
    }
  }

  const testBroadcast = async (command: string) => {
    try {
      await BroadcastService.broadcastTimerCommand(workshopId, command as any, {
        sessionId: command === 'start' ? sessionId : undefined,
      })
      alert(`Broadcast sent: ${command}`)
    } catch (error) {
      alert('Broadcast Error: ' + error.message)
    }
  }

  const testEdgeFunction = async (action: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('timer-control', {
        body: {
          action,
          workshopId,
          sessionId: action === 'start' ? sessionId : undefined,
          extensionMinutes: action === 'extend' ? 5 : undefined,
        },
      })

      if (error) throw error
      setEdgeFunctionResult(JSON.stringify(data, null, 2))
      alert('Edge Function Success!')
    } catch (error) {
      setEdgeFunctionResult('Error: ' + error.message)
      alert('Edge Function Error: ' + error.message)
    }
  }

  const testGetServerTime = async () => {
    try {
      const { data, error } = await supabase.rpc('get_server_time')
      if (error) throw error
      alert('Server Time: ' + new Date(data).toISOString())
    } catch (error) {
      alert('RPC Error: ' + error.message)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Phase 2 Feature Tests</Text>

      {/* Time Sync Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Server-Zeit-Synchronisation</Text>
        <TouchableOpacity style={styles.button} onPress={testTimeSync}>
          <Text style={styles.buttonText}>Sync Server Time</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testGetServerTime}>
          <Text style={styles.buttonText}>Test RPC get_server_time()</Text>
        </TouchableOpacity>
        {serverTime && (
          <View style={styles.result}>
            <Text style={styles.resultText}>Server Time: {serverTime}</Text>
            <Text style={styles.resultText}>Offset: {offset}ms</Text>
            <Text style={styles.resultText}>Last Sync: {lastSync}</Text>
          </View>
        )}
      </View>

      {/* Broadcast Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Broadcast-Service</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.smallButton]} onPress={() => testBroadcast('start')}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.smallButton]} onPress={() => testBroadcast('pause')}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.smallButton]} onPress={() => testBroadcast('resume')}>
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.logTitle}>Broadcast Log:</Text>
        <View style={styles.log}>
          {broadcastLog.map((log, i) => (
            <Text key={i} style={styles.logText}>{log}</Text>
          ))}
        </View>
      </View>

      {/* Edge Function Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Edge Function: Timer-Controller</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.smallButton]} onPress={() => testEdgeFunction('start')}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.smallButton]} onPress={() => testEdgeFunction('pause')}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.smallButton]} onPress={() => testEdgeFunction('extend')}>
            <Text style={styles.buttonText}>Extend</Text>
          </TouchableOpacity>
        </View>
        {edgeFunctionResult && (
          <View style={styles.result}>
            <Text style={styles.resultText}>{edgeFunctionResult}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>Workshop ID: {workshopId}</Text>
        <Text style={styles.infoText}>Session ID: {sessionId}</Text>
        <Text style={styles.infoText}>Öffne 2 Browser-Tabs für Broadcast-Test</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  smallButton: {
    flex: 1,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  result: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  resultText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 8,
  },
  log: {
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 8,
    maxHeight: 200,
  },
  logText: {
    fontSize: 11,
    color: '#10b981',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  info: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1e40af',
    marginBottom: 4,
  },
})
