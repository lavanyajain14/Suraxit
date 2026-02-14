import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = 'http://localhost:3000/api'

/**
 * Polls the mesh network status endpoint.
 * Returns node states, blackout mode, and emergency history.
 */
export function useMeshStatus(intervalMs = 2000) {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/mesh/status`, {
        signal: AbortSignal.timeout(3000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setStatus(json)
    } catch {
      // Keep last known status on failure
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    timerRef.current = setInterval(fetchStatus, intervalMs)
    return () => clearInterval(timerRef.current)
  }, [fetchStatus, intervalMs])

  // ── Actions ──

  const simulateBlackout = useCallback(async (duration = 30) => {
    try {
      const res = await fetch(`${API_BASE}/simulate/blackout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration }),
      })
      const json = await res.json()
      // Immediately refresh status
      fetchStatus()
      return json
    } catch (err) {
      console.error('Blackout simulation failed:', err)
      return null
    }
  }, [fetchStatus])

  const simulateFall = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/simulate/fall`, {
        method: 'POST',
      })
      const json = await res.json()
      return json
    } catch (err) {
      console.error('Fall simulation failed:', err)
      return null
    }
  }, [])

  return {
    status,
    loading,
    simulateBlackout,
    simulateFall,

    // Convenience getters
    meshActive: status?.mesh_active ?? false,
    blackoutMode: status?.blackout_mode ?? false,
    blackoutRemaining: status?.blackout_remaining ?? 0,
    nodes: status?.nodes ?? [],
    emergencies: status?.recent_emergencies ?? [],
    totalEmergencies: status?.total_emergencies ?? 0,
    sensorNodeOnline: status?.sensor_node?.online ?? false,
    dataSource: status?.sensor_node?.data_source ?? 'simulated',
  }
}

export default useMeshStatus
