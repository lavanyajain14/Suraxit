import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = 'http://localhost:3000/api'


export function useSensorData(intervalMs = 1500) {
  const [data, setData] = useState(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const [hardwareOnline, setHardwareOnline] = useState(false)
  const timerRef = useRef(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/sensors`, { signal: AbortSignal.timeout(3000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setConnected(true)
      setError(null)

      // If server says "waiting" (no hardware data), keep data null
      if (json.data_source === 'waiting') {
        setHardwareOnline(false)
        setData(null)
      } else {
        setHardwareOnline(true)
        setData(json)
      }
    } catch (err) {
      setConnected(false)
      setHardwareOnline(false)
      setError(err.message)
      setData(null)
    }
  }, [])

  useEffect(() => {
    fetchData()
    timerRef.current = setInterval(fetchData, intervalMs)
    return () => clearInterval(timerRef.current)
  }, [fetchData, intervalMs])

  return { data, connected, error, hardwareOnline }
}
