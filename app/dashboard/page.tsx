"use client"

import { useState, useEffect } from "react"
import BusTrackingMap from "@/components/bus-tracking-map"
import BusListSidebar from "@/components/bus-list-sidebar"
import BusDetailPanel from "@/components/bus-detail-panel"
import { useBusTracking } from "@/hooks/use-bus-tracking"
import type { Bus } from "@/types/bus"
import ChatBox from "@/components/chat-box"

export default function Dashboard() {
  const { buses, routes, busStops, loading, error } = useBusTracking()
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [chatActiveForBusId, setChatActiveForBusId] = useState<string | null>(null); // State to track which bus chat is active for
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

  // Function to handle contact driver button click
  const handleContactDriverClick = () => {
    if (selectedBus) {
      console.log("Contact Driver clicked for bus:", selectedBus.id);
      setChatActiveForBusId(selectedBus.id);
    } else {
      console.log("Contact Driver clicked, but no bus selected.");
    }
  };

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
          routes={routes}
          busStops={busStops}
        />
      </div>

      {/* Right panels (conditionally rendered) */}
      {selectedBus && (
        <div className="flex h-full">
          <BusDetailPanel
            bus={selectedBus}
            onClose={() => {
              setSelectedBus(null);
              setChatActiveForBusId(null); // Close chat when detail panel closes
            }}
            onContactDriverClick={handleContactDriverClick} // Pass the handler
          />
          {/* Add the ChatBox component */}
          <ChatBox
            open={!!chatActiveForBusId} // Control dialog open state
            onOpenChange={(open) => {
              if (!open) {
                setChatActiveForBusId(null); // Close chat when dialog closes
              }
            }}
            driverId={chatActiveForBusId} // Pass the active chat bus/driver ID
          />
        </div>
      )}
    </div>
  )
}
