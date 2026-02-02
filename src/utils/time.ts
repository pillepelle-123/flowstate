export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function getTimerColor(remainingMs: number, totalMs: number): string {
  const percentage = (remainingMs / totalMs) * 100
  
  if (percentage <= 5) return '#ef4444' // Rot (1min bei 20min)
  if (percentage <= 25) return '#f59e0b' // Gelb (5min bei 20min)
  return '#10b981' // Grün
}

export function shouldVibrate(remainingMs: number): boolean {
  const seconds = Math.floor(remainingMs / 1000)
  return seconds === 300 || seconds === 60 // 5min oder 1min
}
