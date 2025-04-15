"use client"

import { useState, useEffect } from "react"
import type { Bus, BusRoute, BusStop } from "@/types/bus"

// Initial bus routes
const routes: BusRoute[] = [
  { id: "R-103", name: "Bole Road - Merkato", color: "#0097fb" },
  { id: "R-104", name: "Megenagna - Piazza", color: "#48c864" },
  { id: "R-105", name: "CMC - Mexico Square", color: "#ff8a00" },
  { id: "R-106", name: "Ayat - Piazza", color: "#e92c2c" },
  { id: "R-107", name: "Kality - Megenagna", color: "#7d7d7d" },
]

// Bus stops along routes
const busStops: BusStop[] = [
  { id: "S-001", name: "Bole Road", location: { latitude: 9.0105, longitude: 38.7891 }, routeIds: ["R-103"] },
  {
    id: "S-002",
    name: "Meskel Square",
    location: { latitude: 9.0099, longitude: 38.7612 },
    routeIds: ["R-103", "R-106"],
  },
  {
    id: "S-003",
    name: "Mexico Square",
    location: { latitude: 9.0067, longitude: 38.7468 },
    routeIds: ["R-103", "R-105"],
  },
  { id: "S-004", name: "Merkato", location: { latitude: 9.0356, longitude: 38.7468 }, routeIds: ["R-103"] },
  { id: "S-005", name: "Megenagna", location: { latitude: 9.0299, longitude: 38.8011 }, routeIds: ["R-104", "R-107"] },
  { id: "S-006", name: "Piazza", location: { latitude: 9.0141, longitude: 38.7513 }, routeIds: ["R-104", "R-106"] },
  { id: "S-007", name: "CMC", location: { latitude: 9.0505, longitude: 38.7636 }, routeIds: ["R-105"] },
  { id: "S-008", name: "Ayat", location: { latitude: 9.0203, longitude: 38.8554 }, routeIds: ["R-106"] },
  { id: "S-009", name: "Kality", location: { latitude: 8.9494, longitude: 38.7899 }, routeIds: ["R-107"] },
]

// Initial bus data
const initialBuses: Bus[] = [
  {
    id: "A245",
    name: "Bus A245",
    routeId: "R-103",
    routeName: "Bole Road - Merkato",
    routeColor: "#0097fb",
    location: { latitude: 9.0102, longitude: 38.7655 },
    heading: 45,
    speed: 28,
    status: "IN_SERVICE",
    lastUpdated: new Date(),
    nextStop: "Meskel Square",
    nextStopETA: "5 min",
    passengerCount: 32,
    capacity: 45,
    driver: {
      id: "D001",
      name: "Yonas Tadesse",
      phone: "+251912345692",
    },
    vehicleType: "Standard Bus",
    licensePlate: "AA-12345",
  },
  {
    id: "B112",
    name: "Bus B112",
    routeId: "R-104",
    routeName: "Megenagna - Piazza",
    routeColor: "#48c864",
    location: { latitude: 9.0192, longitude: 38.7545 },
    heading: 90,
    speed: 15,
    status: "IN_SERVICE",
    lastUpdated: new Date(),
    nextStop: "Piazza",
    nextStopETA: "8 min",
    passengerCount: 28,
    capacity: 45,
    driver: {
      id: "D002",
      name: "Abebe Kebede",
      phone: "+251912345693",
    },
    vehicleType: "Standard Bus",
    licensePlate: "AA-23456",
  },
  {
    id: "C078",
    name: "Bus C078",
    routeId: "R-105",
    routeName: "CMC - Mexico Square",
    routeColor: "#ff8a00",
    location: { latitude: 9.0292, longitude: 38.7545 },
    heading: 180,
    speed: 0,
    status: "DELAYED",
    lastUpdated: new Date(),
    nextStop: "Mexico Square",
    nextStopETA: "15 min",
    passengerCount: 40,
    capacity: 45,
    driver: {
      id: "D003",
      name: "Kidist Alemu",
      phone: "+251912345694",
    },
    vehicleType: "Articulated Bus",
    licensePlate: "AA-34567",
  },
  {
    id: "D156",
    name: "Bus D156",
    routeId: "R-106",
    routeName: "Ayat - Piazza",
    routeColor: "#e92c2c",
    location: { latitude: 9.0203, longitude: 38.8354 },
    heading: 270,
    speed: 32,
    status: "IN_SERVICE",
    lastUpdated: new Date(),
    nextStop: "Megenagna",
    nextStopETA: "12 min",
    passengerCount: 35,
    capacity: 50,
    driver: {
      id: "D004",
      name: "Bereket Tadesse",
      phone: "+251912345695",
    },
    vehicleType: "Standard Bus",
    licensePlate: "AA-45678",
  },
  {
    id: "E201",
    name: "Bus E201",
    routeId: "R-107",
    routeName: "Kality - Megenagna",
    routeColor: "#7d7d7d",
    location: { latitude: 8.9694, longitude: 38.7899 },
    heading: 0,
    speed: 25,
    status: "IN_SERVICE",
    lastUpdated: new Date(),
    nextStop: "Megenagna",
    nextStopETA: "18 min",
    passengerCount: 42,
    capacity: 50,
    driver: {
      id: "D005",
      name: "Meron Hailu",
      phone: "+251912345696",
    },
    vehicleType: "Standard Bus",
    licensePlate: "AA-56789",
  },
]

// Function to get a random number between min and max
const getRandomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

// Function to update bus location based on heading and speed
const updateBusLocation = (bus: Bus): Bus => {
  // Convert speed from km/h to degrees per second (very rough approximation)
  // 1 degree of latitude/longitude is approximately 111 km at the equator
  const speedFactor = (bus.speed / (111 * 3600)) * 5 // Multiply by 5 to make movement more visible

  // Calculate new position based on heading
  const headingRad = (bus.heading * Math.PI) / 180
  const newLatitude = bus.location.latitude + Math.cos(headingRad) * speedFactor
  const newLongitude = bus.location.longitude + Math.sin(headingRad) * speedFactor

  // Randomly adjust heading slightly to simulate realistic movement
  const newHeading = (bus.heading + getRandomNumber(-5, 5)) % 360

  // Randomly adjust speed slightly
  const newSpeed = Math.max(0, Math.min(60, bus.speed + getRandomNumber(-3, 3)))

  // Randomly adjust passenger count occasionally
  let newPassengerCount = bus.passengerCount
  if (Math.random() > 0.8) {
    const change = Math.floor(getRandomNumber(-2, 3))
    newPassengerCount = Math.max(0, Math.min(bus.capacity, bus.passengerCount + change))
  }

  // Update ETA occasionally
  let newETA = bus.nextStopETA
  if (Math.random() > 0.9) {
    const etaMinutes = Number.parseInt(bus.nextStopETA.split(" ")[0])
    if (etaMinutes > 1) {
      newETA = `${etaMinutes - 1} min`
    } else {
      // Find next stop
      const routeStops = busStops.filter((stop) => stop.routeIds.includes(bus.routeId))
      const currentStopIndex = routeStops.findIndex((stop) => stop.name === bus.nextStop)
      const nextStopIndex = (currentStopIndex + 1) % routeStops.length
      const newNextStop = routeStops[nextStopIndex].name
      newETA = `${Math.floor(getRandomNumber(5, 15))} min`

      return {
        ...bus,
        location: { latitude: newLatitude, longitude: newLongitude },
        heading: newHeading,
        speed: newSpeed,
        passengerCount: newPassengerCount,
        lastUpdated: new Date(),
        nextStop: newNextStop,
        nextStopETA: newETA,
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

export function useBusTracking() {
  const [buses, setBuses] = useState<Bus[]>(initialBuses)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate initial loading
    const loadingTimer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    // Update bus positions every 2 seconds
    const updateInterval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          // Only update buses that are in service and moving
          if (bus.status === "IN_SERVICE" && bus.speed > 0) {
            return updateBusLocation(bus)
          }
          return bus
        }),
      )
    }, 2000)

    return () => {
      clearTimeout(loadingTimer)
      clearInterval(updateInterval)
    }
  }, [])

  return { buses, loading, error, routes, busStops }
}
