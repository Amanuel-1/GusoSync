"use client"

import { useRef, useEffect, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { Bus } from "@/types/bus"
import { useBusTracking } from "@/hooks/use-bus-tracking"
import { MapPin, ZoomIn, ZoomOut } from "lucide-react"

// Initialize Mapbox with the access token
if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
}

interface BusTrackingMapProps {
  buses: Bus[]
  selectedBus: Bus | null
  onSelectBus: (bus: Bus) => void
  loading: boolean
}

interface Route {
  route_id: number
  route_short_name: string
  route_long_name: string
}

export default function BusTrackingMap({ buses, selectedBus, onSelectBus, loading }: BusTrackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [mapLoaded, setMapLoaded] = useState(false)
  const { busStops } = useBusTracking()
  const [showStops, setShowStops] = useState(true)
  const stopMarkers = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [routes, setRoutes] = useState<Route[]>([])

  // Load routes from JSON file
  useEffect(() => {
    fetch('/busRoutes.json')
      .then(response => response.json())
      .then(data => {
        const routeList = data.features.map((feature: any) => ({
          route_id: feature.properties.route_id,
          route_short_name: feature.properties.route_short_name,
          route_long_name: feature.properties.route_long_name
        }))
        setRoutes(routeList)
      })
      .catch(error => console.error('Error loading routes:', error))
  }, [])

  const createBusMarker = (bus: Bus) => {
    const el = document.createElement("div")
    el.className = "bus-marker"
    el.style.width = "64px"
    el.style.height = "32px"
    el.style.position = "relative"

    const img = document.createElement("img")
    img.src = "/busTopView.png"
    img.style.width = "100%"
    img.style.height = "100%"
    img.style.objectFit = "contain"
    img.style.transform = `rotate(${bus.heading}deg)`
    img.style.transition = "transform 0.3s ease"
    el.appendChild(img)

    const number = document.createElement("div")
    number.className = "absolute -top-2 -right-2 bg-[#0097fb] text-white text-sm rounded-full w-6 h-6 flex items-center justify-center"
    number.textContent = bus.id.slice(-3)
    el.appendChild(number)

    return el
  }

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

  // Update bus markers
  useEffect(() => {
    if (!mapLoaded || !map.current) return

    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove())
    markers.current = {}

    // Add new markers
    buses.forEach(bus => {
      if (map.current) {
        const marker = new mapboxgl.Marker(createBusMarker(bus))
          .setLngLat([bus.location.longitude, bus.location.latitude])
          .addTo(map.current)

        markers.current[bus.id] = marker
      }
    })
  }, [buses, mapLoaded])

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
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-md shadow-md p-3">
        <h3 className="text-sm font-medium text-[#103a5e] mb-2">Live Bus Tracking</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="text-[#7d7d7d]">Total Buses:</div>
          <div className="font-medium">{buses.length}</div>
          <div className="text-[#7d7d7d]">Active Buses:</div>
          <div className="font-medium">{buses.filter((b) => b.status === "IN_SERVICE").length}</div>
          <div className="text-[#7d7d7d]">Delayed:</div>
          <div className="font-medium">{buses.filter((b) => b.status === "DELAYED").length}</div>
          <div className="text-[#7d7d7d]">Last Update:</div>
          <div className="font-medium">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Map legend */}
      <div className="absolute bottom-8 left-4 bg-white bg-opacity-90 rounded-md shadow-md p-3">
        <h3 className="text-xs font-medium text-[#103a5e] mb-2">Routes</h3>
        <div className="space-y-1 max-h-[120px] overflow-y-auto pr-2">
          {routes.map((route) => (
            <div key={route.route_id} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#0097fb' }}></div>
              <span className="text-xs">{route.route_long_name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add custom styles */}
      <style jsx global>{`
        .bus-marker.selected {
          width: 36px !important;
          height: 36px !important;
          z-index: 10;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.8), 0 0 0 6px rgba(0, 151, 251, 0.5) !important;
        }
        .mapboxgl-popup-content {
          border-radius: 8px;
          padding: 0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}
