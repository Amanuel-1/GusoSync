import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

interface BusStop {
  id: string
  location: {
    latitude: number
    longitude: number
  }
  name?: string
  properties: {
    name?: string
    'name:en'?: string
    'name:am'?: string
    network?: string
    operator?: string
    'public_transport:version'?: string
    [key: string]: any
  }
}

interface BusStopMarksProps {
  map: mapboxgl.Map | null
  stops: BusStop[]
}

export default function BusStopMarks({ map, stops }: BusStopMarksProps) {
  const marksRef = useRef<{ [key: string]: mapboxgl.Marker }>({})

  useEffect(() => {
    if (!map) return

    // Clear existing marks
    Object.values(marksRef.current).forEach(mark => mark.remove())
    marksRef.current = {}

    // Add new bus stop markers
    stops.forEach(stop => {
      const el = document.createElement('div')
      el.className = 'bus-stop-marker'
      el.style.width = '16px'
      el.style.height = '16px'
      el.style.backgroundColor = '#ff8a00'
      el.style.borderRadius = '50%'
      el.style.border = '2px solid white'
      el.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)'
      el.style.cursor = 'pointer'

      const marker = new mapboxgl.Marker(el)
        .setLngLat([stop.location.longitude, stop.location.latitude])
        .addTo(map)

      // Create popup content with enhanced information
      const popupContent = document.createElement('div')
      popupContent.className = 'p-2 min-w-[200px]'
      
      // Add name
      const name = stop.properties.name || stop.properties['name:en'] || stop.properties['name:am']
      if (name) {
        const nameElement = document.createElement('div')
        nameElement.className = 'font-medium text-[#103a5e] mb-1'
        nameElement.textContent = name
        popupContent.appendChild(nameElement)
      }

      // Add network information
      if (stop.properties.network) {
        const networkElement = document.createElement('div')
        networkElement.className = 'text-xs text-[#7d7d7d] mb-1'
        networkElement.textContent = `Network: ${stop.properties.network}`
        popupContent.appendChild(networkElement)
      }

      // Add operator information
      if (stop.properties.operator) {
        const operatorElement = document.createElement('div')
        operatorElement.className = 'text-xs text-[#7d7d7d] mb-1'
        operatorElement.textContent = `Operator: ${stop.properties.operator}`
        popupContent.appendChild(operatorElement)
      }

      // Add coordinates
      const coordinatesElement = document.createElement('div')
      coordinatesElement.className = 'text-xs text-[#7d7d7d] font-mono'
      coordinatesElement.textContent = `${stop.location.latitude.toFixed(6)}, ${stop.location.longitude.toFixed(6)}`
      popupContent.appendChild(coordinatesElement)

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setDOMContent(popupContent)
      marker.setPopup(popup)

      marksRef.current[stop.id] = marker
    })

    return () => {
      Object.values(marksRef.current).forEach(mark => mark.remove())
    }
  }, [map, stops])

  return null
} 