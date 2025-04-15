"use client"

import { useState, useRef } from "react"
import { Download, Search, ZoomIn, ZoomOut } from "lucide-react"

interface LocationData {
  id: string
  latitude: number
  longitude: number
  count: number
  name: string
}

interface LocationHeatmapProps {
  data: LocationData[]
  title: string
}

export default function LocationHeatmap({ data, title }: LocationHeatmapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)

  // Filter locations based on search
  const filteredLocations = data.filter((location) => location.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5))
  }

  const handleLocationClick = (location: LocationData) => {
    setSelectedLocation(location === selectedLocation ? null : location)
  }

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-[#103a5e]">{title}</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search locations..."
              className="border border-[#d9d9d9] rounded-md py-1 pl-8 pr-3 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#7d7d7d]" size={14} />
          </div>
          <button className="flex items-center gap-1 text-[#0097fb] text-sm">
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      <div className="relative h-[400px] bg-[#f4f9fc] rounded-md overflow-hidden" ref={mapRef}>
        {/* Simulated map with dots */}
        <div
          className="absolute inset-0 transition-transform duration-300"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center",
          }}
        >
          {/* Map background - in a real app, this would be a real map */}
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1000')] bg-cover opacity-50"></div>

          {/* Location markers */}
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className={`absolute cursor-pointer transition-all duration-300 ${
                selectedLocation === location ? "z-10" : ""
              }`}
              style={{
                left: `${((location.longitude + 180) / 360) * 100}%`,
                top: `${((90 - location.latitude) / 180) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => handleLocationClick(location)}
            >
              <div
                className={`rounded-full ${selectedLocation === location ? "ring-2 ring-white" : ""}`}
                style={{
                  width: `${Math.max(20, Math.min(50, location.count / 2))}px`,
                  height: `${Math.max(20, Math.min(50, location.count / 2))}px`,
                  backgroundColor: `rgba(255, 138, 0, ${Math.min(0.9, location.count / 100)})`,
                }}
              ></div>
              {selectedLocation === location && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white p-2 rounded-md shadow-md text-xs whitespace-nowrap">
                  <div className="font-medium">{location.name}</div>
                  <div className="text-[#7d7d7d]">{location.count} events</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col bg-white rounded-md shadow-md">
          <button
            className="p-2 hover:bg-gray-100 border-b border-gray-200"
            onClick={handleZoomIn}
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100" onClick={handleZoomOut} aria-label="Zoom out">
            <ZoomOut size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
