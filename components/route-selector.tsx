"use client"

import { useState, useEffect } from "react"
import { Search, X, Info } from "lucide-react"
import { BusRoute } from "@/types/bus"
import { useRouteManagementAPI, type RouteData } from "@/hooks/useRouteManagementAPI"

interface Bus {
  id: string
  name: string
  routeId: string
  routeName: string
  status: string
}

interface RouteSelectorProps {
  selectedBus: Bus | null
  onRouteSelect: (route: BusRoute | null) => void
  selectedRoute: BusRoute | null
}

// Helper function to convert backend route data to frontend format
function convertBackendRouteToFrontend(backendRoute: RouteData): BusRoute {
  return {
    id: backendRoute.id,
    name: backendRoute.name,
    color: "#0097fb", // Default color since backend doesn't provide this
    start: "N/A", // Backend doesn't provide start point
    passBy: [], // Backend doesn't provide pass-by points
    destination: "N/A", // Backend doesn't provide destination
    distance: backendRoute.total_distance || 0,
    stops: backendRoute.stop_ids?.length || 0,
    activeBuses: 0, // This would need to be calculated separately
    expectedLoad: "Medium" as "Low" | "Medium" | "High" | "Very High", // Default load
    regulatorName: "System", // Default regulator
    regulatorPhone: "N/A", // Default phone
    is_active: backendRoute.is_active,
    created_at: backendRoute.created_at,
    updated_at: backendRoute.updated_at,
  }
}

export default function RouteSelector({ selectedBus, onRouteSelect, selectedRoute }: RouteSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRoutes, setFilteredRoutes] = useState<BusRoute[]>([])
  const [showInfo, setShowInfo] = useState<string | null>(null)
  const { routes: backendRoutes, loading } = useRouteManagementAPI()
  const [routes, setRoutes] = useState<BusRoute[]>([])

  // Convert backend routes to frontend format
  useEffect(() => {
    if (backendRoutes && backendRoutes.length > 0) {
      const convertedRoutes = backendRoutes
        .filter(route => route.is_active) // Only show active routes
        .map(convertBackendRouteToFrontend)
      setRoutes(convertedRoutes)
    } else {
      setRoutes([])
    }
  }, [backendRoutes])

  // Initialize filtered routes when routes data is loaded
  useEffect(() => {
    setFilteredRoutes(routes)
  }, [routes])

  // Filter routes based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRoutes(routes)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = routes.filter(
        (route) =>
          route.id.toLowerCase().includes(query) ||
          route.name.toLowerCase().includes(query) ||
          route.regulatorName.toLowerCase().includes(query),
      )
      setFilteredRoutes(filtered)
    }
  }, [searchQuery, routes])

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const getLoadColor = (load: string) => {
    switch (load) {
      case "Low":
        return "bg-[#48c864] text-white"
      case "Medium":
        return "bg-[#0097fb] text-white"
      case "High":
        return "bg-[#ff8a00] text-white"
      case "Very High":
        return "bg-[#e92c2c] text-white"
      default:
        return "bg-[#7d7d7d] text-white"
    }
  }

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <h2 className="text-lg font-medium text-[#103a5e] mb-4">Select New Route</h2>

      {!selectedBus ? (
        <div className="text-center py-8 text-[#7d7d7d]">Please select a bus first</div>
      ) : (
        <>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search by route ID, name, or regulator..."
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
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0097fb]"></div>
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div className="text-center py-8 text-[#7d7d7d]">No routes found matching your search criteria</div>
            ) : (
              <div className="space-y-2">
                {filteredRoutes
                  .filter((route) => route.id !== selectedBus.routeId) // Filter out current route
                  .map((route) => (
                    <div
                      key={route.id}
                      className={`border rounded-md p-3 cursor-pointer transition-colors ${
                        selectedRoute?.id === route.id
                          ? "border-[#0097fb] bg-[#f0f9ff]"
                          : "border-[#d9d9d9] hover:border-[#0097fb] hover:bg-[#f9f9f9]"
                      }`}
                      onClick={() => onRouteSelect(selectedRoute?.id === route.id ? null : route)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-[#103a5e]">{route.name}</div>
                          <div className="text-sm text-[#7d7d7d]">ID: {route.id}</div>
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-md ${getLoadColor(route.expectedLoad)}`}>
                          {route.expectedLoad} Load
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-[#7d7d7d]">Stops: </span>
                          <span className="font-medium">{route.stops}</span>
                        </div>
                        <div>
                          <span className="text-[#7d7d7d]">Active Buses: </span>
                          <span className="font-medium">{route.activeBuses}</span>
                        </div>
                        <div className="relative">
                          <span className="text-[#7d7d7d]">Regulator: </span>
                          <span className="font-medium">{route.regulatorName}</span>
                          <button
                            className="ml-1 text-[#0097fb]"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowInfo(showInfo === route.id ? null : route.id)
                            }}
                          >
                            <Info size={14} />
                          </button>
                          {showInfo === route.id && (
                            <div className="absolute z-10 left-0 mt-1 bg-white rounded-md shadow-md p-2 text-xs w-48">
                              <div className="font-medium">{route.regulatorName}</div>
                              <div className="text-[#7d7d7d]">Phone: {route.regulatorPhone}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
