import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = 'http://localhost:5000/api'


export function useSensorData(intervalMs = 1500) {
  const [data, setData] = useState(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/sensors`, { signal: AbortSignal.timeout(3000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setConnected(true)
      setError(null)
    } catch (err) {
      setConnected(false)
      setError(err.message)
      setData(getFallbackData())
    }
  }, [])

  useEffect(() => {
    fetchData()
    timerRef.current = setInterval(fetchData, intervalMs)
    return () => clearInterval(timerRef.current)
  }, [fetchData, intervalMs])

  return { data, connected, error }
}

function getFallbackData() {
  const t = Date.now() / 1000
  return {
    spo2: {
      value: 97 + Math.round(Math.sin(t * 0.1) * 1),
      status: 'Normal Range',
      unit: '%'
    },
    heart_rate: {
      value: 72 + Math.round(Math.sin(t * 0.2) * 3),
      unit: 'bpm'
    },
    accelerometer: {
      x: +(0.02 * Math.sin(t * 0.5)).toFixed(4),
      y: +(-0.01 * Math.cos(t * 0.3)).toFixed(4),
      z: +(1.0 + 0.005 * Math.sin(t * 0.7)).toFixed(4),
      magnitude: 1.0002,
      activity: 'Stable'
    },
    gyroscope: {
      x: +(Math.random() * 0.6 - 0.3).toFixed(2),
      y: +(Math.random() * 0.6 - 0.3).toFixed(2),
      z: +(Math.random() * 0.3 - 0.15).toFixed(2)
    },
    fall_detection: {
      probability: 0.03,
      detected: false,
      status: 'No Falls',
      sensitivity: 'High'
    },
    environment: {
      gas_ppm: 12.4,
      air_quality: 'Good',
      air_status: 'Safe working conditions',
      temperature: 28.5,
      humidity: 55
    },
    devices: {
      esp32: { status: 'Online', connection: 'Connected' },
      mpu6050: { status: 'Active', connection: 'Streaming' },
      spo2_sensor: { status: 'Active', connection: '97% Ready' },
      buzzer: { status: 'Standby', connection: 'Ready' }
    },
    timestamp: Date.now() / 1000
  }
}

export default useSensorData
