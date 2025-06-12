"use client"

import { useRef, useEffect, useState, useMemo } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { Bus } from "@/types/bus"
import { useBusTracking } from "@/hooks/use-bus-tracking"
import { MapPin, ZoomIn, ZoomOut } from "lucide-react"
import BusStopMarks from './circular-marks'
import BusMarkers from './bus-markers'

interface CircularMark {
  id: string
  location: {
    latitude: number
    longitude: number
  }
  color: string
  radius: number
}



// Initialize Mapbox with the access token
if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
}

// Backend bus data interface
interface BackendBus {
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
  assigned_driver?: any | null
  bus_status: "OPERATIONAL" | "MAINTENANCE" | "BREAKDOWN" | "IDLE"
  manufacture_year?: number | null
  bus_model?: string | null
  created_at?: string
  updated_at?: string
}

interface BusTrackingMapProps {
  buses: Bus[]
  selectedBus: Bus | null
  onSelectBus: (bus: Bus) => void
  loading: boolean
  // Optional props to avoid duplicate data fetching
  routes?: any[]
  busStops?: any[]
  // Real-time connection status
  connected?: boolean
}

export default function BusTrackingMap({ buses, selectedBus, onSelectBus, loading, routes: propRoutes, busStops: propBusStops, connected = false }: BusTrackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Use props if available, otherwise fetch data (but this should be avoided by always passing props)
  const { busStops: hookBusStops, routes: hookRoutes } = useBusTracking()

  // Use props if available, otherwise use hook data
  const busStops = propBusStops || hookBusStops
  const routes = propRoutes || hookRoutes

  const [showStops, setShowStops] = useState(true)
  const [selectedBackendBus, setSelectedBackendBus] = useState<BackendBus | null>(null)

  // Memoize bus stops transformation to prevent unnecessary re-renders
  const busStopsData = useMemo(() =>
    busStops.map(stop => ({
      id: stop.id,
      name: stop.name || 'Unnamed Stop', // Provide default name to satisfy type requirement
      location: stop.location,
      properties: stop.properties || {} // Use existing properties or empty object
    })), [busStops]
  )

  // Memoize bus data transformation to prevent unnecessary re-renders
  const backendBuses: BackendBus[] = useMemo(() =>
    buses.map(bus => ({
      id: bus.id,
      license_plate: bus.name.replace('Bus ', ''), // Extract license plate from name
      bus_type: "STANDARD" as const,
      capacity: bus.capacity || 50,
      current_location: bus.location,
      last_location_update: bus.lastUpdated.toISOString(),
      heading: bus.heading,
      speed: bus.speed,
      location_accuracy: null,
      current_address: null,
      assigned_route_id: bus.routeId !== 'unassigned' ? bus.routeId : null,
      assigned_driver_id: bus.driver?.id !== 'unassigned' ? bus.driver?.id : null,
      assigned_driver: bus.driver?.id !== 'unassigned' ? bus.driver : null,
      bus_status: bus.status === 'IN_SERVICE' ? 'OPERATIONAL' as const :
                  bus.status === 'OUT_OF_SERVICE' ? 'IDLE' as const :
                  'OPERATIONAL' as const,
      manufacture_year: null,
      bus_model: null,
      created_at: undefined,
      updated_at: undefined
    })), [buses]
  )



  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    try {
      // Clean up existing map if it exists
      if (map.current && map.current.loaded()) {
        map.current.remove()
        map.current = null
      }

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [38.7633, 9.025],
        zoom: 12,
        pitch: 30,
        attributionControl: false
      })

      map.current = mapInstance

      // Add controls
      mapInstance.addControl(new mapboxgl.NavigationControl(), "bottom-right")
      mapInstance.addControl(new mapboxgl.AttributionControl(), "bottom-left")

      mapInstance.on('load', () => {
        console.log('Map loaded successfully')
        setMapLoaded(true)
      })

      mapInstance.on('error', (e) => {
        console.error('Mapbox error:', e)
      })

      return () => {
        if (mapInstance && mapInstance.loaded()) {
          try {
            mapInstance.remove()
          } catch (error) {
            console.error('Error removing map:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }, [])



  // Sync selected bus with backend bus selection
  useEffect(() => {
    if (selectedBus) {
      const correspondingBackendBus = backendBuses.find(bus => bus.id === selectedBus.id)
      if (correspondingBackendBus && correspondingBackendBus !== selectedBackendBus) {
        setSelectedBackendBus(correspondingBackendBus)
      }
    }
  }, [selectedBus, backendBuses, selectedBackendBus])

  // Center map on selected bus
  useEffect(() => {
    if (!mapLoaded || !map.current || !selectedBus) return

    map.current.flyTo({
      center: [selectedBus.location.longitude, selectedBus.location.latitude],
      zoom: 14,
      duration: 1000,
    })
  }, [selectedBus, mapLoaded])

  const handleZoomIn = () => {
    map.current?.zoomIn()
  }

  const handleZoomOut = () => {
    map.current?.zoomOut()
  }

  const toggleBusStops = () => {
    setShowStops(!showStops)
  }

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0097fb]"></div>
            <p className="mt-4 text-[#103a5e] font-medium">Loading map...</p>
          </div>
        </div>
      )}

      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full"
        style={{ minHeight: '500px' }}
      />

      {mapLoaded && showStops && <BusStopMarks map={map.current} stops={busStopsData} />}
      {mapLoaded && <BusMarkers
        map={map.current}
        buses={backendBuses}
        selectedBus={selectedBackendBus}
        onSelectBus={(backendBus) => {
          setSelectedBackendBus(backendBus)
          // Find the corresponding frontend bus and trigger the original onSelectBus
          const frontendBus = buses.find(bus => bus.id === backendBus.id)
          if (frontendBus && onSelectBus) {
            onSelectBus(frontendBus)
          }
        }}
      />}

      {/* Map controls */}
      <div className="absolute bottom-8 right-8 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="bg-white rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-gray-100"
          title="Zoom in"
        >
          <ZoomIn size={20} className="text-[#103a5e]" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-gray-100"
          title="Zoom out"
        >
          <ZoomOut size={20} className="text-[#103a5e]" />
        </button>
        <button
          onClick={toggleBusStops}
          className={`rounded-full w-10 h-10 shadow-md flex items-center justify-center ${showStops ? "bg-[#103a5e] text-white" : "bg-white text-[#103a5e]"} hover:opacity-90`}
          title="Toggle bus stops"
        >
          <MapPin size={20} />
        </button>
      </div>

      {/* Map overlay with stats */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg shadow-lg p-4 min-w-[200px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#103a5e]">
            Bus Tracking
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-xs font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
              {connected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Connection Status Details */}
        <div className={`mb-3 p-2 rounded-md text-xs ${
          connected
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-orange-50 text-orange-800 border border-orange-200'
        }`}>
          {connected
            ? '🔄 Real-time updates active'
            : '📡 Using fallback polling (30s intervals)'
          }
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="text-[#7d7d7d]">Total Buses:</div>
          <div className="font-medium">{backendBuses.length}</div>
          <div className="text-[#7d7d7d]">Operational:</div>
          <div className="font-medium text-green-600">{backendBuses.filter((b) => b.bus_status === "OPERATIONAL").length}</div>
          <div className="text-[#7d7d7d]">Maintenance:</div>
          <div className="font-medium text-orange-600">{backendBuses.filter((b) => b.bus_status === "MAINTENANCE").length}</div>
          <div className="text-[#7d7d7d]">Last Update:</div>
          <div className="font-medium">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Map legend */}
      <div className="absolute bottom-8 left-4 bg-white bg-opacity-90 rounded-md shadow-md p-3">
        <h3 className="text-xs font-medium text-[#103a5e] mb-2">Routes</h3>
        <div className="space-y-1 max-h-[120px] overflow-y-auto pr-2">
          {routes.map((route) => (
            <div key={route.id} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: route.color }}></div>
              <span className="text-xs">{route.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add custom styles */}
      <style jsx global>{`
        .mapboxgl-popup-content {
          border-radius: 8px;
          padding: 0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}
