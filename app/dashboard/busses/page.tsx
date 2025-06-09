"use client"

import { useState, useEffect } from "react"
import { Download, Filter, Search, Plus, Edit, Trash2, Bus, Users, MapPin, Clock, Eye, MoreVertical, Power, PowerOff } from "lucide-react"
import { useBusManagementAPI, type BusData, type CreateBusRequest, type UpdateBusRequest } from "@/hooks/useBusManagementAPI"
import { authService } from "@/services/authService"
import { showToast } from "@/lib/toast"
import BusModal from "@/components/BusManagement/BusModal"
import BusDetailsModal from "@/components/BusManagement/BusDetailsModal"
import SmartPagination from "@/components/ui/SmartPagination"

export default function BussesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [routeFilter, setRouteFilter] = useState("All")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showRouteDropdown, setShowRouteDropdown] = useState(false)
  const [showActionsDropdown, setShowActionsDropdown] = useState<string | null>(null)
  
  // Modal states
  const [busModalOpen, setBusModalOpen] = useState(false)
  const [busDetailsModalOpen, setBusDetailsModalOpen] = useState(false)
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const {
    busses,
    loading,
    userRole,
    fetchBusses,
    createBus,
    updateBus,
    deleteBus,
    toggleBusStatus
  } = useBusManagementAPI()

  // Check if user is admin - only CONTROL_ADMIN can modify busses
  const isAdmin = userRole === 'CONTROL_ADMIN'
  const canModify = isAdmin // Only CONTROL_ADMIN can create, modify, or delete busses

  const itemsPerPage = 10

  // Filter busses based on search and filters
  const filteredBusses = busses.filter(bus => {
    const busName = bus.name || bus.license_plate || `Bus ${bus.id.slice(-4)}`
    const matchesSearch =
      busName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.driver_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.route_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.bus_model?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "All" || bus.bus_status === statusFilter
    const matchesRoute = routeFilter === "All" || bus.assigned_route_id === routeFilter

    return matchesSearch && matchesStatus && matchesRoute
  })

  // Pagination
  const totalPages = Math.ceil(filteredBusses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBusses = filteredBusses.slice(startIndex, endIndex)

  // Statistics
  const stats = {
    total: busses.length,
    operational: busses.filter(bus => bus.bus_status === "OPERATIONAL").length,
    idle: busses.filter(bus => bus.bus_status === "IDLE").length,
    maintenance: busses.filter(bus => bus.bus_status === "MAINTENANCE").length,
    breakdown: busses.filter(bus => bus.bus_status === "BREAKDOWN").length,
  }

  // Get unique routes for filter
  const uniqueRoutes = Array.from(new Set(busses.map(bus => bus.assigned_route_id).filter(Boolean)))

  const handleCreateBus = () => {
    if (!canModify) {
      showToast.error("Only administrators can create busses")
      return
    }
    setSelectedBus(null)
    setModalMode('create')
    setBusModalOpen(true)
  }

  const handleEditBus = (bus: BusData) => {
    if (!canModify) {
      showToast.error("Only administrators can edit busses")
      return
    }
    setSelectedBus(bus)
    setModalMode('edit')
    setBusModalOpen(true)
  }

  const handleViewBus = (bus: BusData) => {
    setSelectedBus(bus)
    setBusDetailsModalOpen(true)
  }

  const handleDeleteBus = async (bus: BusData) => {
    if (!canModify) {
      showToast.error("Only administrators can delete busses")
      return
    }

    if (confirm(`Are you sure you want to delete bus ${bus.license_plate}?`)) {
      const result = await deleteBus(bus.id)
      if (result.success) {
        setShowActionsDropdown(null)
      }
    }
  }

  const handleBusSubmit = async (busData: CreateBusRequest | UpdateBusRequest) => {
    if (modalMode === 'create') {
      return await createBus(busData as CreateBusRequest)
    } else {
      return await updateBus(selectedBus!.id, busData as UpdateBusRequest)
    }
  }

  const handleToggleStatus = async (bus: BusData) => {
    if (!canModify) {
      showToast.error("Only administrators can change bus status")
      return
    }
    
    await toggleBusStatus(bus.id)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPERATIONAL": return "text-green-600 bg-green-100"
      case "IDLE": return "text-blue-600 bg-blue-100"
      case "MAINTENANCE": return "text-yellow-600 bg-yellow-100"
      case "BREAKDOWN": return "text-red-600 bg-red-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPERATIONAL": return <Power className="w-4 h-4" />
      case "IDLE": return <PowerOff className="w-4 h-4" />
      case "MAINTENANCE": return <Clock className="w-4 h-4" />
      case "BREAKDOWN": return <Clock className="w-4 h-4" />
      default: return <Bus className="w-4 h-4" />
    }
  }

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, statusFilter, routeFilter])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 p-6 bg-[#f4f9fc] overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#103a5e]">Bus Management</h1>
            <p className="text-[#7d7d7d] mt-1">Monitor your bus fleet</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7d7d7d]">Total Busses</p>
                <p className="text-2xl font-bold text-[#103a5e]">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-[#f0f9ff] rounded-full flex items-center justify-center">
                <Bus className="w-6 h-6 text-[#0097fb]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7d7d7d]">Operational</p>
                <p className="text-2xl font-bold text-green-600">{stats.operational}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Power className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7d7d7d]">Idle</p>
                <p className="text-2xl font-bold text-blue-600">{stats.idle}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <PowerOff className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#7d7d7d]">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7d7d7d] w-4 h-4" />
              <input
                type="text"
                placeholder="Search busses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#d9d9d9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-[#d9d9d9] rounded-md hover:bg-[#f9f9f9] transition-colors"
              >
                <Filter className="w-4 h-4" />
                Status: {statusFilter}
              </button>
              {showStatusDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-[#d9d9d9]">
                    {["All", "OPERATIONAL", "IDLE", "MAINTENANCE", "BREAKDOWN"].map((status) => (
                      <button
                        key={status}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-[#f9f9f9] transition-colors"
                        onClick={() => {
                          setStatusFilter(status)
                          setShowStatusDropdown(false)
                        }}
                      >
                        {status.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Route Filter */}
            <div className="relative">
              <button
                onClick={() => setShowRouteDropdown(!showRouteDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-[#d9d9d9] rounded-md hover:bg-[#f9f9f9] transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Route: {routeFilter}
              </button>
              {showRouteDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowRouteDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-[#d9d9d9]">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[#f9f9f9] transition-colors"
                      onClick={() => {
                        setRouteFilter("All")
                        setShowRouteDropdown(false)
                      }}
                    >
                      All Routes
                    </button>
                    {uniqueRoutes.map((routeId) => (
                      <button
                        key={routeId}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-[#f9f9f9] transition-colors"
                        onClick={() => {
                          setRouteFilter(routeId)
                          setShowRouteDropdown(false)
                        }}
                      >
                        {routeId}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Busses Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#d9d9d9]">
            <h2 className="text-lg font-semibold text-[#103a5e]">Busses ({filteredBusses.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f9f9f9] border-b border-[#d9d9d9]">
                <tr>
                  <th className="text-left p-4 font-medium text-[#103a5e]">Bus</th>
                  <th className="text-left p-4 font-medium text-[#103a5e]">License Plate</th>
                  <th className="text-left p-4 font-medium text-[#103a5e]">Route</th>
                  <th className="text-left p-4 font-medium text-[#103a5e]">Driver</th>
                  <th className="text-left p-4 font-medium text-[#103a5e]">Status</th>
                  <th className="text-left p-4 font-medium text-[#103a5e]">Capacity</th>
                  <th className="text-left p-4 font-medium text-[#103a5e]">Type</th>
                  <th className="text-left p-4 font-medium text-[#103a5e]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBusses.map((bus) => (
                  <tr key={bus.id} className="border-b border-[#f1f1f1] hover:bg-[#f9f9f9] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#f0f9ff] rounded-full flex items-center justify-center">
                          <Bus className="w-5 h-5 text-[#0097fb]" />
                        </div>
                        <div>
                          <div className="font-medium text-[#103a5e]">{bus.name || bus.license_plate || `Bus ${bus.id.slice(-4)}`}</div>
                          <div className="text-sm text-[#7d7d7d]">ID: {bus.id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#103a5e] font-mono">{bus.license_plate}</td>
                    <td className="p-4">
                      <div className="text-[#103a5e]">{bus.route_name || bus.assigned_route_id || 'Unassigned'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-[#103a5e]">{bus.driver_name || 'Unassigned'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bus.bus_status)}`}>
                        {getStatusIcon(bus.bus_status)}
                        {bus.bus_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-[#103a5e]">
                        <Users className="w-4 h-4" />
                        {bus.capacity}
                      </div>
                    </td>
                    <td className="p-4 text-[#103a5e]">{bus.bus_type}</td>
                    <td className="p-4">
                      <div className="relative">
                        <button
                          onClick={() => setShowActionsDropdown(showActionsDropdown === bus.id ? null : bus.id)}
                          className="p-2 hover:bg-[#f1f1f1] rounded-md transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showActionsDropdown === bus.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowActionsDropdown(null)}></div>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-[#d9d9d9]">
                              <button
                                onClick={() => {
                                  handleViewBus(bus)
                                  setShowActionsDropdown(null)
                                }}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-[#f9f9f9] transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              {canModify && (
                                <>
                                  <button
                                    onClick={() => {
                                      handleEditBus(bus)
                                      setShowActionsDropdown(null)
                                    }}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-[#f9f9f9] transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleToggleStatus(bus)
                                      setShowActionsDropdown(null)
                                    }}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-[#f9f9f9] transition-colors"
                                  >
                                    {bus.bus_status === "OPERATIONAL" ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                    {bus.bus_status === "OPERATIONAL" ? "Set to Idle" : "Set to Operational"}
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <SmartPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredBusses.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modals */}
      <BusModal
        isOpen={busModalOpen}
        onClose={() => setBusModalOpen(false)}
        onSubmit={handleBusSubmit}
        bus={selectedBus}
        mode={modalMode}
      />

      <BusDetailsModal
        isOpen={busDetailsModalOpen}
        onClose={() => setBusDetailsModalOpen(false)}
        bus={selectedBus}
      />
    </div>
  )
}
