"use client"

import { useState, useEffect, useCallback } from "react"
import type { Bus, BusRoute, BusStop } from "@/types/bus"
import { busApiService } from "@/services/busApiService"

export function useBusTracking() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [routes, setRoutes] = useState<BusRoute[]>([])
  const [busStops, setBusStops] = useState<BusStop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from API
  const fetchData = useCallback(async () => {
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
      }
    } catch (err) {
      console.error('Error fetching bus tracking data:', err)
      setError('Failed to load bus tracking data')
      setBuses([])
      setRoutes([])
      setBusStops([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Simulate bus movement for buses that have location data
  const simulateBusMovement = useCallback(() => {
    setBuses(prevBuses =>
      prevBuses.map(bus => {
        // Only update buses that are in service and have valid location data
        if (bus.status === "IN_SERVICE" && bus.speed > 0 && bus.location) {
          // Convert speed from km/h to degrees per second (very rough approximation)
          const speedFactor = (bus.speed / (111 * 3600)) * 5 // Multiply by 5 to make movement more visible

          // Calculate new position based on heading
          const headingRad = (bus.heading * Math.PI) / 180
          const newLatitude = bus.location.latitude + Math.cos(headingRad) * speedFactor
          const newLongitude = bus.location.longitude + Math.sin(headingRad) * speedFactor

          // Randomly adjust heading slightly to simulate realistic movement
          const newHeading = (bus.heading + (Math.random() * 10 - 5)) % 360

          // Randomly adjust speed slightly
          const newSpeed = Math.max(0, Math.min(60, bus.speed + (Math.random() * 6 - 3)))

          // Randomly adjust passenger count occasionally
          let newPassengerCount = bus.passengerCount
          if (Math.random() > 0.8) {
            const change = Math.floor(Math.random() * 3) - 1
            newPassengerCount = Math.max(0, Math.min(bus.capacity, bus.passengerCount + change))
          }

          // Update ETA occasionally
          let newETA = bus.nextStopETA
          if (Math.random() > 0.9 && bus.nextStopETA !== "N/A") {
            const etaMatch = bus.nextStopETA.match(/(\d+)/)
            if (etaMatch) {
              const etaMinutes = parseInt(etaMatch[1])
              if (etaMinutes > 1) {
                newETA = `${etaMinutes - 1} min`
              } else {
                newETA = `${Math.floor(Math.random() * 15) + 5} min`
              }
            }
          }

          return {
            ...bus,
            location: { latitude: newLatitude, longitude: newLongitude },
            heading: newHeading,
            speed: newSpeed,
            passengerCount: newPassengerCount,
            lastUpdated: new Date(),
            nextStopETA: newETA,
          }
        }
        return bus
      })
    )
  }, [])

  useEffect(() => {
    // Initial data fetch
    fetchData()

    // Set up interval to refresh data every 2 minutes (120 seconds) to reduce API calls
    const dataRefreshInterval = setInterval(fetchData, 120000)

    // Set up interval to simulate bus movement every 5 seconds (less frequent updates)
    const movementInterval = setInterval(simulateBusMovement, 5000)

    return () => {
      clearInterval(dataRefreshInterval)
      clearInterval(movementInterval)
    }
  }, []) // Remove dependencies to prevent re-running the effect

  return { buses, routes, busStops, loading, error, refetch: fetchData }
}


