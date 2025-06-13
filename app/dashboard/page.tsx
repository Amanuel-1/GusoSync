"use client"

import { useState, useEffect } from "react"
import BusTrackingMap from "@/components/bus-tracking-map"
import BusListSidebar from "@/components/bus-list-sidebar"
import BusDetailPanel from "@/components/bus-detail-panel"
import { useRealTimeBusTracking } from "@/hooks/use-realtime-bus-tracking"
import type { Bus } from "@/types/bus"
import ChatBox from "@/components/chat-box"
import { Bell, TestTube } from "lucide-react"
import { NotificationTestPanel } from "@/components/notifications/NotificationTestPanel"
import { NotificationDebugPanel } from "@/components/notifications/NotificationDebugPanel"

export default function Dashboard() {
  const {
    buses,
    routes,
    busStops,
    loading,
    error,
    connected,
    proximityAlerts,
    clearProximityAlerts
  } = useRealTimeBusTracking()

  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [chatActiveForBusId, setChatActiveForBusId] = useState<string | null>(null)
  const [filterActive, setFilterActive] = useState(false)
  const [filterRouteId, setFilterRouteId] = useState<string | null>(null)
  const [showProximityAlerts, setShowProximityAlerts] = useState(false)
  const [showNotificationTest, setShowNotificationTest] = useState(false)

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
      {/* Proximity alerts and test panel indicators */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
        {/* Notification test panel toggle */}
        <button
          onClick={() => setShowNotificationTest(!showNotificationTest)}
          className="flex items-center space-x-1 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium hover:bg-purple-200 transition-colors"
          title="Test Notifications"
        >
          <TestTube size={12} />
          <span>Test</span>
        </button>

        {proximityAlerts.length > 0 && (
          <button
            onClick={() => setShowProximityAlerts(!showProximityAlerts)}
            className="flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium hover:bg-blue-200 transition-colors"
          >
            <Bell size={12} />
            <span>{proximityAlerts.length}</span>
          </button>
        )}
      </div>

      {/* Notification test panel */}
      {showNotificationTest && (
        <div className="absolute top-16 right-4 z-50 w-[800px] max-h-[600px] overflow-y-auto">
          <NotificationDebugPanel />
        </div>
      )}

      {/* Proximity alerts panel */}
      {showProximityAlerts && proximityAlerts.length > 0 && (
        <div className="absolute top-16 right-4 z-50 w-80 bg-white rounded-lg shadow-lg border p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Proximity Alerts</h3>
            <button
              onClick={clearProximityAlerts}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {proximityAlerts.map((alert, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">
                    Bus {alert.bus_info.license_plate}
                  </span>
                  <span className="text-xs text-blue-600">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-blue-800 mt-1">
                  Approaching {alert.bus_stop_name}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  ETA: ~{alert.estimated_arrival_minutes} minutes
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

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
        connected={connected}
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
          connected={connected}
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
            selectedBus={selectedBus} // Pass the selected bus information
          />
        </div>
      )}

    </div>
  )
}
