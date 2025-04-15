"use client"

import { useEffect, useRef, useState } from "react"
import type { BusLocation } from "../services/busTrackingService"
import { useSocket } from "../utils/socket"
import { formatNumber } from "@/lib/utils"

interface BusMapProps {
  selectedBusId?: string
  onBusSelected?: (busId: string) => void
  className?: string
}

export default function BusMap({ selectedBusId, onBusSelected, className = "" }: BusMapProps) {
  const [buses, setBuses] = useState<BusLocation[]>([])
  const [mapInitialized, setMapInitialized] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})

  // Connect to socket for real-time updates
  const isConnected = useSocket("tracking.bus_updates", (data: BusLocation[]) => {
    setBuses(data)
  })

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInitialized) return

    // This is a placeholder for actual map initialization
    // In a real implementation, you would use a library like Leaflet or Google Maps
    const initMap = () => {
      console.log("Map initialized")
      setMapInitialized(true)

      // Simulate map instance
      mapInstanceRef.current = {
        setView: (lat: number, lng: number, zoom: number) => {
          console.log(`Map view set to ${lat}, ${lng}, zoom ${zoom}`)
        },
        addMarker: (lat: number, lng: number, options: any) => {
          console.log(`Marker added at ${lat}, ${lng}`)
          return {
            setLatLng: (lat: number, lng: number) => {
              console.log(`Marker moved to ${lat}, ${lng}`)
            },
            setIcon: (icon: any) => {
              console.log(`Marker icon updated`)
            },
            remove: () => {
              console.log(`Marker removed`)
            },
          }
        },
      }
    }

    initMap()
  }, [mapInitialized])

  // Update markers when buses change
  useEffect(() => {
    if (!mapInitialized || !mapInstanceRef.current) return

    // Update existing markers and add new ones
    buses.forEach((bus) => {
      if (markersRef.current[bus.busId]) {
        // Update existing marker
        markersRef.current[bus.busId].setLatLng(bus.latitude, bus.longitude)
      } else {
        // Add new marker
        markersRef.current[bus.busId] = mapInstanceRef.current.addMarker(bus.latitude, bus.longitude, {
          busId: bus.busId,
          status: bus.status,
          isSelected: bus.busId === selectedBusId,
        })
      }
    })

    // Remove markers for buses that no longer exist
    Object.keys(markersRef.current).forEach((busId) => {
      if (!buses.find((bus) => bus.busId === busId)) {
        markersRef.current[busId].remove()
        delete markersRef.current[busId]
      }
    })

    // Center map on selected bus
    if (selectedBusId) {
      const selectedBus = buses.find((bus) => bus.busId === selectedBusId)
      if (selectedBus) {
        mapInstanceRef.current.setView(selectedBus.latitude, selectedBus.longitude, 15)
      }
    }
  }, [buses, selectedBusId, mapInitialized])

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapRef} className="w-full h-full bg-gray-200">
        {/* This would be replaced by an actual map in production */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">Interactive Map</div>
            <div className="text-sm text-gray-600 mb-4">
              {isConnected ? "Connected to real-time updates" : "Connecting to server..."}
            </div>
            <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
              {buses.map((bus) => (
                <div
                  key={bus.busId}
                  className={`p-3 rounded-md cursor-pointer ${
                    bus.busId === selectedBusId ? "bg-[#0097fb] text-white" : "bg-white hover:bg-gray-100"
                  }`}
                  onClick={() => onBusSelected && onBusSelected(bus.busId)}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Bus #{bus.busId}</div>
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        bus.status === "IN_SERVICE"
                          ? "bg-[#48c864] text-white"
                          : bus.status === "DELAYED"
                            ? "bg-[#ff8a00] text-white"
                            : bus.status === "MAINTENANCE"
                              ? "bg-[#e92c2c] text-white"
                              : "bg-[#7d7d7d] text-white"
                      }`}
                    >
                      {bus.status.replace("_", " ")}
                    </div>
                  </div>
                  <div className="text-xs mt-1">
                    Route: {bus.routeId} • Speed: {formatNumber(bus.speed,3)} km/h
                  </div>
                  <div className="text-xs">
                    Passengers: {bus.passengerCount}/{bus.capacity} • Next Stop: {bus.nextStopEta}
                  </div>
                  <div className="text-xs">
                    Location: {bus.latitude.toFixed(4)}, {bus.longitude.toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Connection status indicator */}
      <div
        className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs ${
          isConnected ? "bg-[#48c864] text-white" : "bg-[#e92c2c] text-white"
        }`}
      >
        {isConnected ? "Connected" : "Connecting..."}
      </div>
    </div>
  )
}
