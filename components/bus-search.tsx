"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"

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

export default function BusSearch({ onBusSelect, selectedBus }: BusSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [buses, setBuses] = useState<Bus[]>([])
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for buses
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockBuses: Bus[] = [
        {
          id: "A245",
          name: "Bus A245",
          routeId: "R-103",
          routeName: "Bole Road - Merkato",
          status: "IN_SERVICE",
          driver: "Yonas Tadesse",
          capacity: 45,
          passengerCount: 32,
        },
        {
          id: "B112",
          name: "Bus B112",
          routeId: "R-104",
          routeName: "Megenagna - Piazza",
          status: "IN_SERVICE",
          driver: "Abebe Kebede",
          capacity: 45,
          passengerCount: 28,
        },
        {
          id: "C078",
          name: "Bus C078",
          routeId: "R-105",
          routeName: "CMC - Mexico Square",
          status: "DELAYED",
          driver: "Tigist Haile",
          capacity: 45,
          passengerCount: 40,
        },
        {
          id: "D156",
          name: "Bus D156",
          routeId: "R-106",
          routeName: "Ayat - Piazza",
          status: "IN_SERVICE",
          driver: "Solomon Tesfaye",
          capacity: 50,
          passengerCount: 35,
        },
        {
          id: "E201",
          name: "Bus E201",
          routeId: "R-107",
          routeName: "Kality - Megenagna",
          status: "MAINTENANCE",
          driver: "Hanna Girma",
          capacity: 50,
          passengerCount: 0,
        },
        {
          id: "F089",
          name: "Bus F089",
          routeId: "R-108",
          routeName: "Lebu - Meskel Square",
          status: "OUT_OF_SERVICE",
          driver: "Dawit Mengistu",
          capacity: 45,
          passengerCount: 0,
        },
        {
          id: "G123",
          name: "Bus G123",
          routeId: "R-109",
          routeName: "Jemo - Piazza",
          status: "IN_SERVICE",
          driver: "Kidist Alemu",
          capacity: 45,
          passengerCount: 22,
        },
        {
          id: "H234",
          name: "Bus H234",
          routeId: "R-110",
          routeName: "Saris - Megenagna",
          status: "IN_SERVICE",
          driver: "Bereket Tadesse",
          capacity: 50,
          passengerCount: 42,
        },
      ]
      setBuses(mockBuses)
      setFilteredBuses(mockBuses)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter buses based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBuses(buses)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = buses.filter(
        (bus) =>
          bus.id.toLowerCase().includes(query) ||
          bus.name.toLowerCase().includes(query) ||
          bus.routeId.toLowerCase().includes(query) ||
          bus.routeName.toLowerCase().includes(query) ||
          bus.driver.toLowerCase().includes(query),
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
                    {bus.status.replace("_", " ")}
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
