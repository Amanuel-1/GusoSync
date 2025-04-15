"use client"

import { useState } from "react"
import BusSearch from "../../components/bus-search"
import RouteSelector from "../../components/route-selector"
import ReallocationSummary from "../../components/reallocation-summary"
import ReallocationHistory from "../../components/reallocation-history"

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

interface Route {
  id: string
  name: string
  stops: number
  activeBuses: number
  expectedLoad: "Low" | "Medium" | "High" | "Very High"
  regulatorName: string
  regulatorPhone: string
}

export default function RRAPage() {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const handleConfirmReallocation = () => {
    // Reset selections and show history
    setSelectedBus(null)
    setSelectedRoute(null)
    setShowHistory(true)
  }

  const handleCancelReallocation = () => {
    setSelectedRoute(null)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f9fc]">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium text-[#103a5e]">Route Reallocation Assistant (RRA)</h1>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-md text-sm ${
                !showHistory
                  ? "bg-[#103a5e] text-white"
                  : "bg-white border border-[#d9d9d9] text-[#7d7d7d] hover:bg-[#f9f9f9]"
              }`}
              onClick={() => setShowHistory(false)}
            >
              New Reallocation
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm ${
                showHistory
                  ? "bg-[#103a5e] text-white"
                  : "bg-white border border-[#d9d9d9] text-[#7d7d7d] hover:bg-[#f9f9f9]"
              }`}
              onClick={() => setShowHistory(true)}
            >
              Reallocation History
            </button>
          </div>
        </div>

        {showHistory ? (
          <ReallocationHistory />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <BusSearch onBusSelect={setSelectedBus} selectedBus={selectedBus} />
            </div>
            <div>
              {selectedBus && !selectedRoute ? (
                <RouteSelector
                  selectedBus={selectedBus}
                  onRouteSelect={setSelectedRoute}
                  selectedRoute={selectedRoute}
                />
              ) : selectedBus && selectedRoute ? (
                <ReallocationSummary
                  selectedBus={selectedBus}
                  selectedRoute={selectedRoute}
                  onConfirm={handleConfirmReallocation}
                  onCancel={handleCancelReallocation}
                />
              ) : (
                <div className="bg-white rounded-md shadow-sm p-4">
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 rounded-full bg-[#f1f1f1] flex items-center justify-center mb-4">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-[#7d7d7d]"
                      >
                        <path
                          d="M3 6h18M3 12h18M3 18h18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19 4l-2 2 2 2M5 14l2 2-2 2M19 20l-2-2 2-2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg font-medium text-[#103a5e] mb-2">Route Reallocation</h2>
                    <p className="text-[#7d7d7d] text-center max-w-md">
                      Select a bus from the list to begin the reallocation process. You'll be able to assign the bus to
                      a new route based on current demand and operational needs.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
