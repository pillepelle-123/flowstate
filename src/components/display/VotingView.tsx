import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { supabase } from '../../services/supabase'

interface VotingViewProps {
  workshopId: string
  sessionId: string
}

interface VoteData {
  option: string
  count: number
}

export function VotingView({ workshopId, sessionId }: VotingViewProps) {
  const [votes, setVotes] = useState<VoteData[]>([])

  useEffect(() => {
    loadVotes()
    subscribeToVotes()
  }, [sessionId])

  const loadVotes = async () => {
    const { data } = await supabase
      .from('interactions')
      .select('data')
      .eq('session_id', sessionId)
      .eq('type', 'vote_2d')

    if (data) {
      const voteCounts: Record<string, number> = {}
      data.forEach((interaction) => {
        const option = interaction.data?.option || 'Unbekannt'
        voteCounts[option] = (voteCounts[option] || 0) + 1
      })

      setVotes(
        Object.entries(voteCounts).map(([option, count]) => ({ option, count }))
      )
    }
  }

  const subscribeToVotes = () => {
    const channel = supabase
      .channel(`votes:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interactions',
          filter: `session_id=eq.${sessionId}`,
        },
        () => loadVotes()
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }

  const maxVotes = Math.max(...votes.map((v) => v.count), 1)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Voting</Text>
      <View style={styles.chartContainer}>
        {votes.map((vote, index) => (
          <View key={index} style={styles.barContainer}>
            <Text style={styles.label}>{vote.option}</Text>
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  { width: `${(vote.count / maxVotes) * 100}%` },
                ]}
              />
              <Text style={styles.count}>{vote.count}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 60,
    textAlign: 'center',
  },
  chartContainer: {
    gap: 24,
  },
  barContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 32,
    color: '#cbd5e1',
    marginBottom: 12,
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bar: {
    height: 60,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    minWidth: 60,
  },
  count: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
})
