"use client"

import { useState, useEffect } from "react"
import BusTrackingMap from "@/components/bus-tracking-map"
import BusListSidebar from "@/components/bus-list-sidebar"
import BusDetailPanel from "@/components/bus-detail-panel"
import { useBusTracking } from "@/hooks/use-bus-tracking"
import type { Bus } from "@/types/bus"

export default function Dashboard() {
  const { buses, loading, error } = useBusTracking()
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [filterActive, setFilterActive] = useState(false)
  const [filterRouteId, setFilterRouteId] = useState<string | null>(null)

  // Filter buses based on active filters
  const filteredBuses = buses.filter((bus) => {
    if (filterActive && bus.status !== "IN_SERVICE") {
      return false
    }
    if (filterRouteId && bus.routeId !== filterRouteId) {
      return false
    }
    return true
  })

  // Select first bus if none selected and buses are available
  useEffect(() => {
    if (!selectedBus && filteredBuses.length > 0) {
      setSelectedBus(filteredBuses[0])
    }
  }, [filteredBuses, selectedBus])

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left sidebar with bus list */}
      <BusListSidebar
        buses={filteredBuses}
        selectedBus={selectedBus}
        onSelectBus={setSelectedBus}
        filterActive={filterActive}
        onToggleFilterActive={setFilterActive}
        filterRouteId={filterRouteId}
        onChangeFilterRoute={setFilterRouteId}
        loading={loading}
      />

      {/* Main map area */}
      <div className="flex-1 relative">
        <BusTrackingMap
          buses={filteredBuses}
          selectedBus={selectedBus}
          onSelectBus={setSelectedBus}
          loading={loading}
        />
      </div>

      {/* Right panel with bus details (conditionally rendered) */}
      {selectedBus && <BusDetailPanel bus={selectedBus} onClose={() => setSelectedBus(null)} />}
    </div>
  )
}
