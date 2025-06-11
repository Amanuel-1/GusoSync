import type { Bus, BusRoute, BusStop } from "@/types/bus"

// Backend API response interfaces
interface BackendBusResponse {
  id: string
  license_plate: string
  bus_type: "STANDARD" | "ARTICULATED" | "MINIBUS"
  capacity: number
  current_location?: {
    latitude: number
    longitude: number
  } | null
  last_location_update?: string | null
  heading?: number | null
  speed?: number | null
  location_accuracy?: number | null
  current_address?: string | null
  assigned_route_id?: string | null
  assigned_driver_id?: string | null
  assigned_driver?: {
    id: string
    first_name: string
    last_name: string
    phone_number?: string
    profile_image?: string
  } | null
  bus_status: "OPERATIONAL" | "MAINTENANCE" | "BREAKDOWN" | "IDLE"
  manufacture_year?: number | null
  bus_model?: string | null
  created_at?: string
  updated_at?: string
}

interface BackendRouteResponse {
  id: string
  name: string
  description?: string | null
  stop_ids: string[]
  total_distance?: number | null
  estimated_duration?: number | null
  is_active: boolean
  route_geometry?: any | null
  route_shape_data?: any | null
  last_shape_update?: string | null
  created_at?: string
  updated_at?: string
}

interface BackendBusStopResponse {
  id: string
  name: string
  location: {
    latitude: number
    longitude: number
  }
  capacity?: number | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  user_role?: string
}

class BusApiService {
  private baseUrl = '/dashboard/api'

  // Fetch all buses from backend
  async getBuses(): Promise<ApiResponse<BackendBusResponse[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/busses`, {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data: data.data || [],
        }
      } else {
        return {
          success: false,
          message: data.error || 'Failed to fetch buses',
        }
      }
    } catch (error) {
      console.error('Error fetching buses:', error)
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      }
    }
  }

  // Fetch all routes from backend
  async getRoutes(): Promise<ApiResponse<BackendRouteResponse[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/routes`, {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data: data.data || [],
        }
      } else {
        return {
          success: false,
          message: data.error || 'Failed to fetch routes',
        }
      }
    } catch (error) {
      console.error('Error fetching routes:', error)
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      }
    }
  }

  // Fetch all bus stops from backend
  async getBusStops(): Promise<ApiResponse<BackendBusStopResponse[]>> {
    try {
      const response = await fetch('/api/bus-stops', {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data: data.data || [],
        }
      } else {
        return {
          success: false,
          message: data.error || 'Failed to fetch bus stops',
        }
      }
    } catch (error) {
      console.error('Error fetching bus stops:', error)
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      }
    }
  }

  // Transform backend bus data to frontend Bus interface
  transformBusData(
    backendBus: BackendBusResponse,
    routes: BackendRouteResponse[],
    busStops: BackendBusStopResponse[]
  ): Bus {
    // Find the assigned route
    const assignedRoute = routes.find(route => route.id === backendBus.assigned_route_id)
    
    // Generate route color based on route ID (fallback if no route found)
    const routeColors = ["#0097fb", "#48c864", "#ff8a00", "#e92c2c", "#7d7d7d"]
    const colorIndex = assignedRoute ? parseInt(assignedRoute.id.slice(-1)) % routeColors.length : 0
    const routeColor = routeColors[colorIndex]

    // Map bus status to frontend status
    const statusMap: Record<string, Bus['status']> = {
      'OPERATIONAL': 'IN_SERVICE',
      'MAINTENANCE': 'MAINTENANCE',
      'BREAKDOWN': 'OUT_OF_SERVICE',
      'IDLE': 'OUT_OF_SERVICE'
    }

    // Find next stop (simplified - just pick first stop from route)
    let nextStop = "Unknown"
    let nextStopETA = "N/A"
    
    if (assignedRoute && assignedRoute.stop_ids.length > 0) {
      const firstStopId = assignedRoute.stop_ids[0]
      const firstStop = busStops.find(stop => stop.id === firstStopId)
      if (firstStop) {
        nextStop = firstStop.name
        nextStopETA = `${Math.floor(Math.random() * 15) + 5} min` // Random ETA for now
      }
    }

    return {
      id: backendBus.id,
      name: `Bus ${backendBus.license_plate}`,
      routeId: backendBus.assigned_route_id || 'unassigned',
      routeName: assignedRoute?.name || 'Unassigned',
      routeColor: routeColor,
      location: backendBus.current_location || { latitude: 9.0105, longitude: 38.7891 }, // Default to Addis Ababa center
      heading: backendBus.heading || 0,
      speed: backendBus.speed || 0,
      status: statusMap[backendBus.bus_status] || 'OUT_OF_SERVICE',
      lastUpdated: backendBus.last_location_update ? new Date(backendBus.last_location_update) : new Date(),
      nextStop,
      nextStopETA,
      passengerCount: Math.floor(Math.random() * backendBus.capacity), // Random passenger count for now
      capacity: backendBus.capacity,
      driver: {
        id: backendBus.assigned_driver?.id || 'unassigned',
        name: backendBus.assigned_driver 
          ? `${backendBus.assigned_driver.first_name} ${backendBus.assigned_driver.last_name}`
          : 'Unassigned',
        phone: backendBus.assigned_driver?.phone_number || 'N/A',
        photo: backendBus.assigned_driver?.profile_image
      },
      vehicleType: backendBus.bus_type === 'STANDARD' ? 'Standard Bus' : 
                   backendBus.bus_type === 'ARTICULATED' ? 'Articulated Bus' : 'Minibus',
      licensePlate: backendBus.license_plate,
    }
  }

  // Transform backend route data to frontend BusRoute interface
  transformRouteData(backendRoute: BackendRouteResponse, buses: BackendBusResponse[]): BusRoute {
    // Count active buses on this route
    const activeBuses = buses.filter(bus =>
      bus.assigned_route_id === backendRoute.id &&
      bus.bus_status === 'OPERATIONAL'
    ).length

    // Generate route color
    const routeColors = ["#0097fb", "#48c864", "#ff8a00", "#e92c2c", "#7d7d7d"]
    const colorIndex = parseInt(backendRoute.id.slice(-1)) % routeColors.length

    // Extract start and destination from route name (simplified)
    const nameParts = backendRoute.name.split(' - ')
    const start = nameParts[0] || backendRoute.name
    const destination = nameParts[nameParts.length - 1] || backendRoute.name
    const passBy = nameParts.slice(1, -1)

    return {
      id: backendRoute.id,
      name: backendRoute.name,
      color: routeColors[colorIndex],
      start,
      passBy,
      destination,
      distance: backendRoute.total_distance || 0,
      stops: backendRoute.stop_ids.length,
      activeBuses,
      expectedLoad: activeBuses > 3 ? "High" : activeBuses > 1 ? "Medium" : "Low",
      regulatorName: "System Assigned", // Default value
      regulatorPhone: "+251912345678", // Default value
    }
  }

  // Transform backend bus stop data to frontend BusStop interface
  transformBusStopData(backendBusStop: BackendBusStopResponse, routes: BackendRouteResponse[]): BusStop {
    // Find routes that include this bus stop
    const routeIds = routes
      .filter(route => route.stop_ids.includes(backendBusStop.id))
      .map(route => route.id)

    return {
      id: backendBusStop.id,
      name: backendBusStop.name,
      location: backendBusStop.location,
      routeIds,
    }
  }

  // Fetch and transform all data
  async getAllData(): Promise<{
    buses: Bus[]
    routes: BusRoute[]
    busStops: BusStop[]
    loading: boolean
    error: string | null
  }> {
    try {
      // Fetch all data in parallel
      const [busesResponse, routesResponse, busStopsResponse] = await Promise.all([
        this.getBuses(),
        this.getRoutes(),
        this.getBusStops()
      ])

      // Check for errors
      if (!busesResponse.success) {
        return {
          buses: [],
          routes: [],
          busStops: [],
          loading: false,
          error: busesResponse.message || 'Failed to fetch buses'
        }
      }

      if (!routesResponse.success) {
        return {
          buses: [],
          routes: [],
          busStops: [],
          loading: false,
          error: routesResponse.message || 'Failed to fetch routes'
        }
      }

      if (!busStopsResponse.success) {
        return {
          buses: [],
          routes: [],
          busStops: [],
          loading: false,
          error: busStopsResponse.message || 'Failed to fetch bus stops'
        }
      }

      const backendBuses = busesResponse.data || []
      const backendRoutes = routesResponse.data || []
      const backendBusStops = busStopsResponse.data || []

      // Transform data
      const buses = backendBuses.map(bus =>
        this.transformBusData(bus, backendRoutes, backendBusStops)
      )
      const routes = backendRoutes.map(route =>
        this.transformRouteData(route, backendBuses)
      )
      const busStops = backendBusStops.map(busStop =>
        this.transformBusStopData(busStop, backendRoutes)
      )

      return {
        buses,
        routes,
        busStops,
        loading: false,
        error: null
      }
    } catch (error) {
      console.error('Error fetching all data:', error)
      return {
        buses: [],
        routes: [],
        busStops: [],
        loading: false,
        error: 'Network error. Please check your connection and try again.'
      }
    }
  }
}

export const busApiService = new BusApiService()
export type { BackendBusResponse, BackendRouteResponse, BackendBusStopResponse }
