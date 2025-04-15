"use client"

import { formatNumber, formatSpeed } from "@/lib/utils"
import type { Bus } from "@/types/bus"
import { ChevronRight, Clock, MapPin, Phone, X } from "lucide-react"

interface BusDetailPanelProps {
  bus: Bus
  onClose: () => void
}

export default function BusDetailPanel({ bus, onClose }: BusDetailPanelProps) {
  // Format the last updated time
  const formatLastUpdated = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)

    if (diffSec < 60) {
      return `${diffSec} seconds ago`
    } else if (diffSec < 3600) {
      return `${Math.floor(diffSec / 60)} minutes ago`
    } else {
      return date.toLocaleTimeString()
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_SERVICE":
        return "bg-[#48c864] text-white"
      case "OUT_OF_SERVICE":
        return "bg-[#7d7d7d] text-white"
      case "DELAYED":
        return "bg-[#ff8a00] text-white"
      case "MAINTENANCE":
        return "bg-[#e92c2c] text-white"
      default:
        return "bg-[#7d7d7d] text-white"
    }
  }

  // Calculate occupancy percentage
  const occupancyPercentage = Math.round((bus.passengerCount / bus.capacity) * 100)

  // Get occupancy color
  const getOccupancyColor = (percentage: number) => {
    if (percentage < 50) return "bg-[#48c864]"
    if (percentage < 80) return "bg-[#ff8a00]"
    return "bg-[#e92c2c]"
  }

  return (
    <div className="w-[350px] border-l border-[#d9d9d9] bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#d9d9d9] flex justify-between items-center">
        <h2 className="text-lg font-medium text-[#103a5e]">Bus Details</h2>
        <button onClick={onClose} className="text-[#7d7d7d] hover:text-[#103a5e]">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Bus info */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-2xl font-bold text-[#103a5e]">{bus.name}</div>
              <div className="text-sm text-[#7d7d7d]">ID: {bus.id}</div>
            </div>
            <div className={`px-3 py-1 text-sm rounded-md ${getStatusColor(bus.status)}`}>
              {bus.status.replace("_", " ")}
            </div>
          </div>

          <div className="text-sm text-[#7d7d7d] mb-4">Last updated: {formatLastUpdated(bus.lastUpdated)}</div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#f9f9f9] p-3 rounded-md">
              <div className="text-xs text-[#7d7d7d] mb-1">Speed</div>
              <div className="text-lg font-medium">{formatNumber(bus.speed,3)} km/h</div>
            </div>
            <div className="bg-[#f9f9f9] p-3 rounded-md">
              <div className="text-xs text-[#7d7d7d] mb-1">Heading</div>
                <div className="text-lg font-medium">{formatNumber(bus.heading,3)}°</div>
              </div>
          </div>
        </div>

        {/* Route info */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#103a5e] mb-2">Route Information</h3>
          <div className="bg-[#f9f9f9] p-3 rounded-md mb-3">
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: bus.routeColor }}></div>
              <div className="font-medium">{bus.routeId}</div>
            </div>
            <div className="text-sm">{bus.routeName}</div>
          </div>

          <div className="flex items-start mb-3">
            <MapPin size={18} className="text-[#0097fb] mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium">Next Stop: {bus.nextStop}</div>
              <div className="text-xs text-[#7d7d7d] flex items-center">
                <Clock size={12} className="mr-1" />
                ETA: {bus.nextStopETA}
              </div>
            </div>
          </div>

          <div className="flex items-center mb-2">
            <div className="text-sm">Current Location:</div>
            <div className="ml-auto text-sm font-mono">
              {bus.location.latitude.toFixed(4)}, {bus.location.longitude.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Passenger info */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#103a5e] mb-2">Passenger Information</h3>
          <div className="bg-[#f9f9f9] p-3 rounded-md">
            <div className="flex justify-between mb-1">
              <div className="text-sm">Occupancy</div>
              <div className="text-sm font-medium">
                {bus.passengerCount}/{bus.capacity} ({occupancyPercentage}%)
              </div>
            </div>
            <div className="w-full bg-[#e5e5e5] rounded-full h-2">
              <div
                className={`${getOccupancyColor(occupancyPercentage)} h-2 rounded-full`}
                style={{ width: `${occupancyPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Driver info */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#103a5e] mb-2">Driver Information</h3>
          <div className="bg-[#f9f9f9] p-3 rounded-md">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-[#103a5e] text-white flex items-center justify-center mr-3">
                {bus.driver.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{bus.driver.name}</div>
                <div className="text-xs text-[#7d7d7d]">Driver ID: {bus.driver.id}</div>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <Phone size={16} className="text-[#7d7d7d] mr-2" />
              {bus.driver.phone}
            </div>
          </div>
        </div>

        {/* Vehicle info */}
        <div>
          <h3 className="text-sm font-medium text-[#103a5e] mb-2">Vehicle Information</h3>
          <div className="bg-[#f9f9f9] p-3 rounded-md">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-[#7d7d7d]">Type</div>
                <div className="font-medium">{bus.vehicleType}</div>
              </div>
              <div>
                <div className="text-[#7d7d7d]">License Plate</div>
                <div className="font-medium">{bus.licensePlate}</div>
              </div>
              <div>
                <div className="text-[#7d7d7d]">Capacity</div>
                <div className="font-medium">{bus.capacity} passengers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#d9d9d9]">
        <div className="grid grid-cols-2 gap-2">
          <button className="bg-[#0097fb] text-white py-2 rounded-md hover:bg-[#0088e2] transition-colors flex items-center justify-center">
            <Phone size={16} className="mr-2" />
            Contact Driver
          </button>
          <button className="border border-[#d9d9d9] text-[#103a5e] py-2 rounded-md hover:bg-[#f9f9f9] transition-colors flex items-center justify-center">
            View History
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}
