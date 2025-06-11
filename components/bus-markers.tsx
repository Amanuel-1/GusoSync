import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

// Backend bus data interface - matching the API response exactly
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

interface BusMarkersProps {
  map: mapboxgl.Map | null
  buses: BackendBus[]
  selectedBus: BackendBus | null
  onSelectBus: (bus: BackendBus) => void
}

export default function BusMarkers({ map, buses, selectedBus, onSelectBus }: BusMarkersProps) {
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})

  useEffect(() => {
    if (!map) return

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    // Add new bus markers - using EXACT same pattern as bus stops
    buses.forEach(bus => {
      // Skip buses without location data
      if (!bus.current_location) return

      const el = document.createElement('div')
      el.className = 'bus-marker'
      el.style.width = '28px'
      el.style.height = '28px'
      el.style.cursor = 'pointer'

      // Create bus image
      const img = document.createElement('img')
      img.src = '/busTopView.png'
      img.style.width = '100%'
      img.style.height = '100%'
      img.style.objectFit = 'contain'

      // Apply rotation if heading is available
      if (bus.heading !== null) {
        img.style.transform = `rotate(${bus.heading}deg)`
      }

      el.appendChild(img)

      // Highlight selected bus
      if (selectedBus && selectedBus.id === bus.id) {
        el.style.filter = 'drop-shadow(0 0 8px #ff8a00)'
        el.style.transform = 'scale(1.2)'
      }

      // Create marker using EXACT same approach as bus stops
      const marker = new mapboxgl.Marker(el)
        .setLngLat([bus.current_location.longitude, bus.current_location.latitude])
        .addTo(map)

      // Add click handler for bus selection
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onSelectBus(bus)
      })

      // Create popup content with enhanced information - same pattern as bus stops
      const popupContent = document.createElement('div')
      popupContent.className = 'p-2 min-w-[200px]'

      // Add license plate (name equivalent)
      const nameElement = document.createElement('div')
      nameElement.className = 'font-medium text-[#103a5e] mb-1'
      nameElement.textContent = `Bus ${bus.license_plate}`
      popupContent.appendChild(nameElement)

      // Add bus type
      const typeElement = document.createElement('div')
      typeElement.className = 'text-xs text-[#7d7d7d] mb-1'
      typeElement.textContent = `Type: ${bus.bus_type}`
      popupContent.appendChild(typeElement)

      // Add status
      const statusElement = document.createElement('div')
      statusElement.className = 'text-xs text-[#7d7d7d] mb-1'
      statusElement.textContent = `Status: ${bus.bus_status}`
      popupContent.appendChild(statusElement)

      // Add speed if available
      if (bus.speed !== null) {
        const speedElement = document.createElement('div')
        speedElement.className = 'text-xs text-[#7d7d7d] mb-1'
        speedElement.textContent = `Speed: ${bus.speed?.toFixed(1)} km/h`
        popupContent.appendChild(speedElement)
      }

      // Add coordinates - same as bus stops
      const coordinatesElement = document.createElement('div')
      coordinatesElement.className = 'text-xs text-[#7d7d7d] font-mono'
      coordinatesElement.textContent = `${bus.current_location.latitude.toFixed(6)}, ${bus.current_location.longitude.toFixed(6)}`
      popupContent.appendChild(coordinatesElement)

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setDOMContent(popupContent)
      marker.setPopup(popup)

      markersRef.current[bus.id] = marker
    })

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove())
    }
  }, [map, buses, selectedBus, onSelectBus])

  return null
}
