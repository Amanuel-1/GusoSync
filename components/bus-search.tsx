"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { useBusManagementAPI, type BusData } from "@/hooks/useBusManagementAPI"

interface Bus {
  id: string
  name: string
  routeId: string
  routeName: string
  status: "IN_SERVICE" | "OUT_OF_SERVICE" | "DELAYED" | "MAINTENANCE"
  driver: string
  capacity: number
  passengerCount: number
}

interface BusSearchProps {
  onBusSelect: (bus: Bus | null) => void
  selectedBus: Bus | null
}

// Helper function to convert backend bus data to frontend format
function convertBackendBusToFrontend(backendBus: BusData): Bus {
  // Ensure status is valid, default to OUT_OF_SERVICE if not provided
  let status: "IN_SERVICE" | "OUT_OF_SERVICE" | "DELAYED" | "MAINTENANCE" = "OUT_OF_SERVICE"
  if (backendBus.status) {
    const validStatuses = ["IN_SERVICE", "OUT_OF_SERVICE", "DELAYED", "MAINTENANCE"]
    if (validStatuses.includes(backendBus.status)) {
      status = backendBus.status as "IN_SERVICE" | "OUT_OF_SERVICE" | "DELAYED" | "MAINTENANCE"
    }
  }

  return {
    id: backendBus.id || "Unknown",
    name: `Bus ${backendBus.id || "Unknown"}`,
    routeId: backendBus.route_id || "N/A",
    routeName: backendBus.route_name || "No Route Assigned",
    status: status,
    driver: backendBus.driver_name || "No Driver Assigned",
    capacity: backendBus.capacity || 45,
    passengerCount: backendBus.current_passenger_count || 0,
  }
}

export default function BusSearch({ onBusSelect, selectedBus }: BusSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [buses, setBuses] = useState<Bus[]>([])
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([])
  const { busses: backendBuses, loading: isLoading, error, refreshData } = useBusManagementAPI()

  // Convert backend buses to frontend format and update state
  useEffect(() => {
    if (backendBuses && backendBuses.length > 0) {
      const convertedBuses = backendBuses.map(convertBackendBusToFrontend)
      setBuses(convertedBuses)
    } else {
      setBuses([])
    }
  }, [backendBuses])

  // Handle error state
  useEffect(() => {
    if (error) {
      console.error("Error fetching buses:", error)
      setBuses([])
    }
  }, [error])

  // Filter buses based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBuses(buses)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = buses.filter(
        (bus) =>
          (bus.id && bus.id.toLowerCase().includes(query)) ||
          (bus.name && bus.name.toLowerCase().includes(query)) ||
          (bus.routeId && bus.routeId.toLowerCase().includes(query)) ||
          (bus.routeName && bus.routeName.toLowerCase().includes(query)) ||
          (bus.driver && bus.driver.toLowerCase().includes(query)),
      )
      setFilteredBuses(filtered)
    }
  }, [searchQuery, buses])

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_SERVICE":
        return "bg-[#48c864] text-white"
      case "DELAYED":
        return "bg-[#ff8a00] text-white"
      case "MAINTENANCE":
        return "bg-[#e92c2c] text-white"
      case "OUT_OF_SERVICE":
        return "bg-[#7d7d7d] text-white"
      default:
        return "bg-[#7d7d7d] text-white"
    }
  }

  const formatStatusText = (status: string) => {
    if (!status) return "UNKNOWN"
    return status.replace(/_/g, " ")
  }

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <h2 className="text-lg font-medium text-[#103a5e] mb-4">Search Buses</h2>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by bus ID, name, route, or driver..."
          className="w-full border border-[#d9d9d9] rounded-md py-2 pl-10 pr-10 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7d7d7d]" size={16} />
        {searchQuery && (
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7d7d7d] hover:text-[#103a5e]"
            onClick={handleClearSearch}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="overflow-y-auto max-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0097fb]"></div>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="text-center py-8 text-[#7d7d7d]">No buses found matching your search criteria</div>
        ) : (
          <div className="space-y-2">
            {filteredBuses.map((bus) => (
              <div
                key={bus.id}
                className={`border rounded-md p-3 cursor-pointer transition-colors ${
                  selectedBus?.id === bus.id
                    ? "border-[#0097fb] bg-[#f0f9ff]"
                    : "border-[#d9d9d9] hover:border-[#0097fb] hover:bg-[#f9f9f9]"
                }`}
                onClick={() => onBusSelect(selectedBus?.id === bus.id ? null : bus)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-[#103a5e]">{bus.name}</div>
                    <div className="text-sm text-[#7d7d7d]">ID: {bus.id}</div>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-md ${getStatusColor(bus.status)}`}>
                    {formatStatusText(bus.status)}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[#7d7d7d]">Current Route: </span>
                    <span className="font-medium">{bus.routeId}</span>
                  </div>
                  <div>
                    <span className="text-[#7d7d7d]">Driver: </span>
                    <span className="font-medium">{bus.driver}</span>
                  </div>
                  <div>
                    <span className="text-[#7d7d7d]">Route Name: </span>
                    <span className="font-medium">{bus.routeName}</span>
                  </div>
                  <div>
                    <span className="text-[#7d7d7d]">Passengers: </span>
                    <span className="font-medium">
                      {bus.passengerCount}/{bus.capacity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
