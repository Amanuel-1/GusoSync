import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

interface BusStop {
  id: string
  location: {
    latitude: number
    longitude: number
  }
  name: string
  routeIds?: string[]
  properties?: {
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

  // Add custom CSS for bus stop popups
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .bus-stop-popup .mapboxgl-popup-content {
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border: 1px solid #e5e7eb;
        padding: 0;
        max-width: 300px;
      }
      .bus-stop-popup .mapboxgl-popup-tip {
        border-top-color: #ffffff;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

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
      popupContent.className = 'bg-white rounded-lg overflow-hidden'

      // Header section with bus stop name
      const headerSection = document.createElement('div')
      headerSection.className = 'bg-gradient-to-r from-[#103a5e] to-[#0097fb] text-white p-3'

      const name = stop.name || stop.properties?.name || stop.properties?.['name:en'] || stop.properties?.['name:am'] || 'Unnamed Bus Stop'
      const nameElement = document.createElement('div')
      nameElement.className = 'font-semibold text-sm leading-tight'
      nameElement.textContent = name
      headerSection.appendChild(nameElement)

      // Add bus stop icon
      const iconElement = document.createElement('div')
      iconElement.className = 'text-xs opacity-90 mt-1'
      iconElement.textContent = '🚌 Bus Stop'
      headerSection.appendChild(iconElement)

      popupContent.appendChild(headerSection)

      // Content section
      const contentSection = document.createElement('div')
      contentSection.className = 'p-3'

      // Add bus stop ID
      const idElement = document.createElement('div')
      idElement.className = 'text-xs text-[#7d7d7d] mb-3 flex items-center'
      idElement.innerHTML = `<span class="font-medium">ID:</span> <span class="ml-1 font-mono">${stop.id}</span>`
      contentSection.appendChild(idElement)

      // Add coordinates with label
      const coordinatesContainer = document.createElement('div')
      coordinatesContainer.className = 'mb-3'

      const coordinatesLabel = document.createElement('div')
      coordinatesLabel.className = 'text-xs text-[#7d7d7d] font-medium mb-1'
      coordinatesLabel.textContent = '📍 Coordinates:'
      coordinatesContainer.appendChild(coordinatesLabel)

      const coordinatesElement = document.createElement('div')
      coordinatesElement.className = 'text-xs text-[#103a5e] font-mono bg-gray-50 px-2 py-1 rounded'
      coordinatesElement.textContent = `${stop.location.latitude.toFixed(6)}, ${stop.location.longitude.toFixed(6)}`
      coordinatesContainer.appendChild(coordinatesElement)
      contentSection.appendChild(coordinatesContainer)

      // Add network information if available
      if (stop.properties?.network) {
        const networkElement = document.createElement('div')
        networkElement.className = 'text-xs text-[#7d7d7d] mb-2'
        networkElement.innerHTML = `<span class="font-medium">Network:</span> ${stop.properties.network}`
        contentSection.appendChild(networkElement)
      }

      // Add operator information if available
      if (stop.properties?.operator) {
        const operatorElement = document.createElement('div')
        operatorElement.className = 'text-xs text-[#7d7d7d] mb-2'
        operatorElement.innerHTML = `<span class="font-medium">Operator:</span> ${stop.properties.operator}`
        contentSection.appendChild(operatorElement)
      }

      // Add routes information if available
      if (stop.routeIds && stop.routeIds.length > 0) {
        const routesContainer = document.createElement('div')
        routesContainer.className = 'mt-3 pt-3 border-t border-gray-200'

        const routesLabel = document.createElement('div')
        routesLabel.className = 'text-xs text-[#7d7d7d] font-medium mb-2'
        routesLabel.textContent = '🚍 Served by routes:'
        routesContainer.appendChild(routesLabel)

        const routesElement = document.createElement('div')
        routesElement.className = 'flex flex-wrap gap-1'
        stop.routeIds.forEach(routeId => {
          const routeBadge = document.createElement('span')
          routeBadge.className = 'text-xs bg-[#103a5e] text-white px-2 py-1 rounded-full'
          routeBadge.textContent = routeId
          routesElement.appendChild(routeBadge)
        })
        routesContainer.appendChild(routesElement)
        contentSection.appendChild(routesContainer)
      }

      popupContent.appendChild(contentSection)

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        className: 'bus-stop-popup'
      })
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