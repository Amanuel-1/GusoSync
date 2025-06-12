"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Bus, BusRoute, BusStop } from "@/types/bus"
import { busApiService } from "@/services/busApiService"
import { RealTimeSocketService } from "@/utils/socket"

interface BusLocationUpdate {
  type: "bus_location_update"
  bus_id: string
  location: {
    latitude: number
    longitude: number
  }
  heading?: number
  speed?: number
  timestamp: string
}

interface AllBusLocations {
  type: "all_bus_locations"
  buses: Array<{
    bus_id: string
    license_plate: string
    location: {
      latitude: number
      longitude: number
    }
    heading?: number
    speed?: number
    route_id?: string
    last_update: string
    status: string
  }>
  timestamp: string
}

interface ProximityAlert {
  type: "proximity_alert"
  bus_id: string
  bus_stop_id: string
  bus_stop_name: string
  bus_distance_to_stop_meters: number
  passenger_distance_to_stop_meters: number
  estimated_arrival_minutes: number
  bus_info: {
    license_plate: string
    route_id: string
  }
  timestamp: string
}

export function useRealTimeBusTracking() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [routes, setRoutes] = useState<BusRoute[]>([])
  const [busStops, setBusStops] = useState<BusStop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [proximityAlerts, setProximityAlerts] = useState<ProximityAlert[]>([])

  const socketRef = useRef<RealTimeSocketService | null>(null)
  const initialDataLoaded = useRef(false)
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch initial data from API
  const fetchInitialData = useCallback(async (forceRefresh = false) => {
    if (initialDataLoaded.current && !forceRefresh) return

    setLoading(true)
    setError(null)

    try {
      const result = await busApiService.getAllData()

      if (result.error) {
        setError(result.error)
        setBuses([])
        setRoutes([])
        setBusStops([])
      } else {
        setBuses(result.buses)
        setRoutes(result.routes)
        setBusStops(result.busStops)
        initialDataLoaded.current = true

        // Subscribe to proximity alerts for all bus stops
        if (socketRef.current?.isConnected()) {
          const busStopIds = result.busStops.map(stop => stop.id)
          socketRef.current.subscribeToProximityAlerts(busStopIds)
        }
      }
    } catch (err) {
      console.error('Error fetching initial bus tracking data:', err)
      setError('Failed to load bus tracking data')
      setBuses([])
      setRoutes([])
      setBusStops([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Fallback polling when WebSocket is not available
  const startFallbackPolling = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current)
    }

    console.log('🔄 Starting fallback polling for bus data')
    fallbackIntervalRef.current = setInterval(() => {
      fetchInitialData(true) // Force refresh for polling
    }, 30000) // Poll every 30 seconds
  }, [fetchInitialData])

  const stopFallbackPolling = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current)
      fallbackIntervalRef.current = null
    }
  }, [])

  // Initialize WebSocket connection after authentication check
  useEffect(() => {
    // Check if user is authenticated before connecting
    const checkAuthAndConnect = async () => {
      // Wait a bit for auth to be established
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Try to get auth token from API
      let authToken: string | null = null

      try {
        const response = await fetch('/api/auth/websocket-token', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          authToken = data.token
        }
      } catch (error) {
        console.warn('Failed to get auth token:', error)
      }

      if (!authToken) {
        console.log('🔑 No auth token found, using fallback polling for bus data')
        // Don't set error state, just use fallback
        startFallbackPolling()
        return
      }

      const socket = RealTimeSocketService.getInstance()
      socketRef.current = socket

      // Set up event listeners
      const handleConnect = () => {
        console.log('🚌 Real-time bus tracking connected')
        setConnected(true)
        setError(null)

        // Stop fallback polling since we have real-time connection
        stopFallbackPolling()

        // Subscribe to all bus location updates
        socket.subscribeToAllBuses()
      }

      const handleDisconnect = (data: any) => {
        console.log('🚌 Real-time bus tracking disconnected:', data)
        setConnected(false)
        if (data.code !== 1000) {
          setError('Connection lost. Attempting to reconnect...')
          // Start fallback polling when disconnected
          startFallbackPolling()
        }
      }

      const handleError = (error: any) => {
        console.warn('🚌 WebSocket connection issue:', error)

        // Always start fallback polling when WebSocket fails
        console.log('🔄 Starting fallback polling due to WebSocket error')
        startFallbackPolling()

        // Don't show error to user for WebSocket connection issues
        // The fallback polling will ensure data is still available
        if (error && error.message && !error.message.includes('WebSocket')) {
          setError('Connection error occurred')
        }
      }

      const handleBusLocationUpdate = (message: BusLocationUpdate) => {
        console.log('📍 Bus location update:', message)
        setBuses(prevBuses =>
          prevBuses.map(bus => {
            if (bus.id === message.bus_id) {
              return {
                ...bus,
                location: message.location,
                heading: message.heading ?? bus.heading,
                speed: message.speed ?? bus.speed,
                lastUpdated: new Date(message.timestamp)
              }
            }
            return bus
          })
        )
      }

      const handleAllBusLocations = (message: AllBusLocations) => {
        console.log('🚌 All bus locations received:', message.buses.length, 'buses')

        // Update existing buses with real-time location data
        setBuses(prevBuses =>
          prevBuses.map(bus => {
            const realtimeBus = message.buses.find(rb => rb.bus_id === bus.id)
            if (realtimeBus) {
              return {
                ...bus,
                location: realtimeBus.location,
                heading: realtimeBus.heading ?? bus.heading,
                speed: realtimeBus.speed ?? bus.speed,
                lastUpdated: new Date(realtimeBus.last_update)
              }
            }
            return bus
          })
        )
      }

      const handleProximityAlert = (message: ProximityAlert) => {
        console.log('🔔 Proximity alert:', message)
        setProximityAlerts(prev => [...prev, message])

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(`Bus ${message.bus_info.license_plate} Approaching`, {
            body: `Arriving at ${message.bus_stop_name} in ~${message.estimated_arrival_minutes} minutes`,
            icon: '/favicon.ico'
          })
        }
      }

      // Register event listeners
      socket.on('connect', handleConnect)
      socket.on('disconnect', handleDisconnect)
      socket.on('error', handleError)
      socket.on('bus_location_update', handleBusLocationUpdate)
      socket.on('all_bus_locations', handleAllBusLocations)
      socket.on('proximity_alert', handleProximityAlert)

      // Try to connect to WebSocket (will only connect if auth token is available)
      try {
        await socket.connect(authToken)
      } catch (error) {
        console.warn('Failed to connect to WebSocket:', error)
        setError('Unable to establish real-time connection')
        startFallbackPolling()
      }

      // Cleanup function
      return () => {
        socket.off('connect', handleConnect)
        socket.off('disconnect', handleDisconnect)
        socket.off('error', handleError)
        socket.off('bus_location_update', handleBusLocationUpdate)
        socket.off('all_bus_locations', handleAllBusLocations)
        socket.off('proximity_alert', handleProximityAlert)
      }
    }

    const cleanup = checkAuthAndConnect()

    // Return cleanup function
    return () => {
      cleanup.then(cleanupFn => {
        if (cleanupFn) cleanupFn()
      })
    }
  }, [])



  // Load initial data when component mounts
  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  // Cleanup fallback polling on unmount
  useEffect(() => {
    return () => {
      stopFallbackPolling()
    }
  }, [stopFallbackPolling])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Calculate ETA for a bus to reach a specific stop
  const calculateETA = useCallback((busId: string, stopId: string) => {
    if (socketRef.current?.isConnected()) {
      socketRef.current.calculateETA(busId, stopId)
    }
  }, [])

  // Clear proximity alerts
  const clearProximityAlerts = useCallback(() => {
    setProximityAlerts([])
  }, [])

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
  }, [])

  return { 
    buses, 
    routes, 
    busStops, 
    loading, 
    error, 
    connected,
    proximityAlerts,
    refetch: fetchInitialData,
    calculateETA,
    clearProximityAlerts,
    disconnect
  }
}
