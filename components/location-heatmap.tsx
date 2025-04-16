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
  const [zoom, setZoom] = useState(12)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)

  // Filter locations based on search
  const filteredLocations = data.filter((location) => location.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 1, 18))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 1, 1))
  }

  const handleLocationClick = (location: LocationData) => {
    setSelectedLocation(location === selectedLocation ? null : location)
  }

  // Calculate the center of the map based on the locations
  const centerLat = data.reduce((sum, loc) => sum + loc.latitude, 0) / data.length
  const centerLng = data.reduce((sum, loc) => sum + loc.longitude, 0) / data.length

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
        {/* OpenStreetMap transport layer */}
        <div className="absolute inset-0">
          <img
            src={`https://tile.openstreetmap.org/${zoom}/${Math.floor((centerLng + 180) / 360 * Math.pow(2, zoom))}/${Math.floor((1 - Math.log(Math.tan(centerLat * Math.PI / 180) + 1 / Math.cos(centerLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}.png`}
            alt="Map"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Location markers */}
        {filteredLocations.map((location) => (
          <div
            key={location.id}
            className={`absolute cursor-pointer transition-all duration-300 ${
              selectedLocation === location ? "z-10" : ""
            }`}
            style={{
              left: `${((location.longitude - centerLng + 180) / 360) * 100}%`,
              top: `${((90 - location.latitude + centerLat) / 180) * 100}%`,
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

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            className="bg-white p-2 rounded-md shadow-md hover:bg-[#f9f9f9]"
            onClick={handleZoomIn}
          >
            <ZoomIn size={16} />
          </button>
          <button
            className="bg-white p-2 rounded-md shadow-md hover:bg-[#f9f9f9]"
            onClick={handleZoomOut}
          >
            <ZoomOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
