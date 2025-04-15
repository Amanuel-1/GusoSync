import { SocketService } from "../utils/socket"

export interface BusLocation {
  busId: string
  latitude: number
  longitude: number
  speed: number
  heading: number
  timestamp: number
  routeId: string
  nextStopId: string
  nextStopEta: string
  status: "IN_SERVICE" | "OUT_OF_SERVICE" | "DELAYED" | "MAINTENANCE"
  passengerCount: number
  capacity: number
}

export interface BusStop {
  stopId: string
  name: string
  latitude: number
  longitude: number
  regulatorName: string
  expectedLoad: "Low" | "Medium" | "High" | "Very High"
}

export interface Route {
  routeId: string
  name: string
  stops: BusStop[]
}

// Simulated bus data
const simulatedBuses: BusLocation[] = [
  {
    busId: "A245",
    latitude: 9.0092,
    longitude: 38.7645,
    speed: 28,
    heading: 45,
    timestamp: Date.now(),
    routeId: "R-103",
    nextStopId: "S-456",
    nextStopEta: "12:15 PM",
    status: "IN_SERVICE",
    passengerCount: 32,
    capacity: 45,
  },
  {
    busId: "B112",
    latitude: 9.0192,
    longitude: 38.7545,
    speed: 15,
    heading: 90,
    timestamp: Date.now(),
    routeId: "R-104",
    nextStopId: "S-789",
    nextStopEta: "12:10 PM",
    status: "IN_SERVICE",
    passengerCount: 28,
    capacity: 45,
  },
  {
    busId: "C078",
    latitude: 8.9992,
    longitude: 38.7745,
    speed: 0,
    heading: 180,
    timestamp: Date.now(),
    routeId: "R-105",
    nextStopId: "S-123",
    nextStopEta: "12:25 PM",
    status: "DELAYED",
    passengerCount: 40,
    capacity: 45,
  },
]

// Simulated route data
export const simulatedRoutes: Route[] = [
  {
    routeId: "R-103",
    name: "Bole Road - Merkato",
    stops: [
      {
        stopId: "S-123",
        name: "Bole Road - Edna Mall",
        latitude: 9.0102,
        longitude: 38.7655,
        regulatorName: "Abebe Kebede",
        expectedLoad: "Medium",
      },
      {
        stopId: "S-234",
        name: "Meskel Square",
        latitude: 9.0112,
        longitude: 38.7625,
        regulatorName: "Tigist Haile",
        expectedLoad: "High",
      },
      {
        stopId: "S-456",
        name: "Mexico Square",
        latitude: 9.0092,
        longitude: 38.7595,
        regulatorName: "Solomon Tesfaye",
        expectedLoad: "High",
      },
      {
        stopId: "S-567",
        name: "Piazza",
        latitude: 9.0072,
        longitude: 38.7565,
        regulatorName: "Hanna Girma",
        expectedLoad: "Medium",
      },
      {
        stopId: "S-678",
        name: "Merkato",
        latitude: 9.0052,
        longitude: 38.7535,
        regulatorName: "Dawit Mengistu",
        expectedLoad: "Very High",
      },
    ],
  },
]

// Simulate bus movement
function updateBusLocations() {
  return simulatedBuses.map((bus) => {
    // Simulate movement based on heading
    const latChange = (Math.sin((bus.heading * Math.PI) / 180) * 0.0002 * bus.speed) / 10
    const lngChange = (Math.cos((bus.heading * Math.PI) / 180) * 0.0002 * bus.speed) / 10

    // Update location
    const updatedBus = {
      ...bus,
      latitude: bus.latitude + latChange,
      longitude: bus.longitude + lngChange,
      timestamp: Date.now(),
    }

    // Randomly change speed slightly
    if (Math.random() > 0.7) {
      updatedBus.speed = Math.max(0, Math.min(60, updatedBus.speed + (Math.random() * 6 - 3)))
    }

    // Randomly change passenger count
    if (Math.random() > 0.8) {
      const change = Math.floor(Math.random() * 3) - 1
      updatedBus.passengerCount = Math.max(0, Math.min(updatedBus.capacity, updatedBus.passengerCount + change))
    }

    return updatedBus
  })
}

// Start the simulation
let updateInterval: NodeJS.Timeout | null = null

export function startBusTracking() {
  const socket = SocketService.getInstance()

  // Emit initial bus locations
  socket.emit("tracking.bus_updates", simulatedBuses)

  // Set up interval to update bus locations
  if (!updateInterval) {
    updateInterval = setInterval(() => {
      const updatedBuses = updateBusLocations()
      socket.emit("tracking.bus_updates", updatedBuses)
    }, 3000) // Update every 3 seconds
  }

  // Handle bus update requests
  socket.on("tracking.bus_updates.request", (data: { routeId: string }) => {
    const filteredBuses = simulatedBuses.filter((bus) => bus.routeId === data.routeId)
    socket.emit("tracking.bus_updates", filteredBuses)
  })

  return () => {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
  }
}

export function getBusById(busId: string): BusLocation | undefined {
  return simulatedBuses.find((bus) => bus.busId === busId)
}

export function getRouteById(routeId: string): Route | undefined {
  return simulatedRoutes.find((route) => route.routeId === routeId)
}
