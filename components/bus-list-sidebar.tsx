"use client"

import { useState } from "react"
import type { Bus } from "@/types/bus"
import { ChevronDown, Filter, Search, X } from "lucide-react"
import { useBusTracking } from "@/hooks/use-bus-tracking"
import { formatNumber } from "@/lib/utils"

interface BusListSidebarProps {
  buses: Bus[]
  selectedBus: Bus | null
  onSelectBus: (bus: Bus) => void
  filterActive: boolean
  onToggleFilterActive: (active: boolean) => void
  filterRouteId: string | null
  onChangeFilterRoute: (routeId: string | null) => void
  loading: boolean
  connected?: boolean
}

export default function BusListSidebar({
  buses,
  selectedBus,
  onSelectBus,
  filterActive,
  onToggleFilterActive,
  filterRouteId,
  onChangeFilterRoute,
  loading,
  connected = false,
}: BusListSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showRouteFilter, setShowRouteFilter] = useState(false)
  const { routes } = useBusTracking()

  // Filter buses based on search query
  const filteredBuses = buses.filter(
    (bus) =>
      bus.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.routeName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  return (
    <div className="w-[320px] border-r border-[#d9d9d9] bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#d9d9d9]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-[#103a5e]">Bus Tracking</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-xs font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
              {connected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search buses..."
            className="w-full border border-[#d9d9d9] rounded-md py-2 pl-10 pr-10 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7d7d7d]" size={16} />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7d7d7d] hover:text-[#103a5e]"
              onClick={() => setSearchQuery("")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-[#103a5e]">Filters</div>
            <button className="text-xs text-[#0097fb] hover:underline">Reset</button>
          </div>

          {/* Active filter */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filterActive}
              onChange={() => onToggleFilterActive(!filterActive)}
              className="rounded text-[#0097fb] focus:ring-[#0097fb]"
            />
            <span className="text-sm">Show only active buses</span>
          </label>

          {/* Route filter */}
          <div className="relative">
            <button
              className="flex items-center justify-between w-full border border-[#d9d9d9] rounded-md py-2 px-3 text-sm"
              onClick={() => setShowRouteFilter(!showRouteFilter)}
            >
              <span>
                {filterRouteId ? routes.find((r) => r.id === filterRouteId)?.name || "All routes" : "All routes"}
              </span>
              <ChevronDown size={16} className={`transition-transform ${showRouteFilter ? "rotate-180" : ""}`} />
            </button>

            {showRouteFilter && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowRouteFilter(false)}></div>
                <div className="absolute left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                  <div className="py-1">
                    <button
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        !filterRouteId ? "bg-[#f1f1f1] text-[#103a5e]" : "text-[#7d7d7d] hover:bg-[#f9f9f9]"
                      }`}
                      onClick={() => {
                        onChangeFilterRoute(null)
                        setShowRouteFilter(false)
                      }}
                    >
                      All routes
                    </button>
                    {routes.map((route) => (
                      <button
                        key={route.id}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          filterRouteId === route.id
                            ? "bg-[#f1f1f1] text-[#103a5e]"
                            : "text-[#7d7d7d] hover:bg-[#f9f9f9]"
                        }`}
                        onClick={() => {
                          onChangeFilterRoute(route.id)
                          setShowRouteFilter(false)
                        }}
                      >
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: route.color }}></div>
                          {route.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bus list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0097fb]"></div>
            <p className="mt-4 text-sm text-[#7d7d7d]">Loading buses...</p>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <Filter size={24} className="text-[#7d7d7d] mb-2" />
            <p className="text-[#7d7d7d] text-center">No buses match your filters</p>
            <button
              className="mt-2 text-[#0097fb] text-sm hover:underline"
              onClick={() => {
                setSearchQuery("")
                onToggleFilterActive(false)
                onChangeFilterRoute(null)
              }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f1f1]">
            {filteredBuses.map((bus) => (
              <div
                key={bus.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedBus?.id === bus.id ? "bg-[#f0f9ff] border-l-4 border-[#0097fb]" : "hover:bg-[#f9f9f9]"
                }`}
                onClick={() => onSelectBus(bus)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center">
                      <div className="font-medium text-[#103a5e]">{bus.name}</div>
                      {connected && (
                        <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live tracking"></div>
                      )}
                    </div>
                    <div className="text-xs text-[#7d7d7d]">
                      ID: {bus.id} • Updated: {bus.lastUpdated.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-md ${getStatusColor(bus.status)}`}>
                    {bus.status.replace("_", " ")}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[#7d7d7d]">Route</div>
                    <div className="font-medium flex items-center">
                      <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: bus.routeColor }}></div>
                      {bus.routeId}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#7d7d7d]">Speed</div>
                    <div className="font-medium">{formatNumber(bus.speed,3)} km/h</div>
                  </div>
                  <div>
                    <div className="text-[#7d7d7d]">Next Stop</div>
                    <div className="font-medium">{bus.nextStop}</div>
                  </div>
                  <div>
                    <div className="text-[#7d7d7d]">ETA</div>
                    <div className="font-medium">{bus.nextStopETA}</div>
                  </div>
                  <div>
                    <div className="text-[#7d7d7d]">Passengers</div>
                    <div className="font-medium">
                      {bus.passengerCount}/{bus.capacity}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#7d7d7d]">Driver</div>
                    <div className="font-medium">{bus.driver.name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="p-4 border-t border-[#d9d9d9] bg-[#f9f9f9]">
        {/* Connection Status Banner */}
        <div className={`mb-3 p-2 rounded-md text-xs text-center ${
          connected
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-orange-50 text-orange-800 border border-orange-200'
        }`}>
          {connected
            ? '🔄 Real-time tracking active'
            : '📡 Polling mode (updates every 30s)'
          }
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-[#7d7d7d]">Total</div>
            <div className="font-medium text-[#103a5e]">{buses.length}</div>
          </div>
          <div>
            <div className="text-xs text-[#7d7d7d]">Active</div>
            <div className="font-medium text-[#48c864]">{buses.filter((b) => b.status === "IN_SERVICE").length}</div>
          </div>
          <div>
            <div className="text-xs text-[#7d7d7d]">Delayed</div>
            <div className="font-medium text-[#ff8a00]">{buses.filter((b) => b.status === "DELAYED").length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
