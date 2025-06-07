"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Download, Filter, Search, Plus, Edit, Trash2, MapPin, Clock, Route, Eye, MoreVertical } from "lucide-react"
import { useRouteManagement } from "@/hooks/useRouteManagement"
import RouteModal from "@/components/RouteManagement/RouteModal"
import RouteDetailsModal from "@/components/RouteManagement/RouteDetailsModal"
import { type BusRoute } from "@/services/routeService"

export default function RoutesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showActionsDropdown, setShowActionsDropdown] = useState<string | null>(null)
  
  // Modal states
  const [routeModalOpen, setRouteModalOpen] = useState(false)
  const [routeDetailsModalOpen, setRouteDetailsModalOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  
  // Route management hook
  const {
    routes,
    loading,
    error,
    createRoute,
    updateRoute,
    deleteRoute,
    refreshData,
  } = useRouteManagement()

  const itemsPerPage = 10

  // Filter data based on search and status
  const filteredData = routes.filter(route => {
    const matchesSearch =
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.start.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && (route.is_active !== false)) ||
      (statusFilter === "Inactive" && (route.is_active === false))

    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredData.slice(startIndex, endIndex)

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  // Reset pagination when changing filters
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  // Action handlers
  const handleCreateRoute = () => {
    setModalMode('create')
    setSelectedRoute(null)
    setRouteModalOpen(true)
  }

  const handleEditRoute = (route: BusRoute) => {
    setModalMode('edit')
    setSelectedRoute(route)
    setRouteModalOpen(true)
  }

  const handleViewRoute = (route: BusRoute) => {
    setSelectedRoute(route)
    setRouteDetailsModalOpen(true)
  }

  const handleDeleteRoute = async (route: BusRoute) => {
    if (window.confirm(`Are you sure you want to delete the route "${route.name}"?`)) {
      const result = await deleteRoute(route.id)
      if (result.success) {
        alert('Route deleted successfully')
      } else {
        alert(result.message || 'Failed to delete route')
      }
    }
  }

  const handleRouteSubmit = async (routeData: any) => {
    let result
    if (modalMode === 'create') {
      result = await createRoute(routeData)
    } else if (selectedRoute) {
      result = await updateRoute(selectedRoute.id, routeData)
    }

    if (result?.success) {
      alert(`Route ${modalMode === 'create' ? 'created' : 'updated'} successfully`)
      setRouteModalOpen(false)
    } else {
      alert(result?.message || `Failed to ${modalMode} route`)
    }

    return result || { success: false }
  }

  // Helper functions
  const formatDistance = (distance: number) => {
    return `${distance.toFixed(2)} km`
  }

  const formatDuration = (duration: number) => {
    const minutes = Math.round(duration)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${remainingMinutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate statistics
  const totalRoutes = routes.length
  const activeRoutes = routes.filter(route => route.is_active !== false).length
  const inactiveRoutes = totalRoutes - activeRoutes
  const averageDistance = routes.length > 0
    ? routes.reduce((sum, route) => sum + route.distance, 0) / routes.length
    : 0

  return (
    <div className="flex-1 flex flex-col bg-[#f4f9fc] h-full">
      <div className="p-6 pb-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium text-[#103a5e]">Route Management</h1>
          <div className="flex gap-3">
            <button
              onClick={handleCreateRoute}
              className="flex items-center gap-2 bg-[#0097fb] text-white px-4 py-2 rounded-md hover:bg-[#0088e2] transition-colors"
            >
              <Plus size={18} />
              <span>Add Route</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7d7d7d]">Total Routes</p>
                <p className="text-2xl font-semibold text-[#103a5e]">{totalRoutes}</p>
              </div>
              <Route className="text-[#0097fb]" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7d7d7d]">Active Routes</p>
                <p className="text-2xl font-semibold text-green-600">{activeRoutes}</p>
              </div>
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7d7d7d]">Inactive Routes</p>
                <p className="text-2xl font-semibold text-red-600">{inactiveRoutes}</p>
              </div>
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7d7d7d]">Avg Distance</p>
                <p className="text-2xl font-semibold text-[#103a5e]">{formatDistance(averageDistance)}</p>
              </div>
              <MapPin className="text-[#0097fb]" size={24} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Filters and Search */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7d7d7d]" size={16} />
                  <input
                    type="text"
                    placeholder="Search routes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-[#d9d9d9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#d9d9d9] rounded-md hover:bg-gray-50"
                  >
                    <Filter size={16} />
                    <span>Status: {statusFilter}</span>
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-[#d9d9d9] rounded-md shadow-lg z-10">
                      {["All", "Active", "Inactive"].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status)
                            setShowStatusDropdown(false)
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2 border border-[#d9d9d9] rounded-md hover:bg-gray-50">
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0097fb] mx-auto mb-4"></div>
                <p className="text-[#7d7d7d]">Loading routes...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-2">Error loading routes</p>
                <p className="text-[#7d7d7d] text-sm">{error}</p>
                <button
                  onClick={refreshData}
                  className="mt-4 px-4 py-2 bg-[#0097fb] text-white rounded-md hover:bg-[#0088e2] transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              {filteredData.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Route className="mx-auto h-12 w-12 text-[#7d7d7d] mb-4" />
                    <p className="text-[#7d7d7d] mb-2">No routes found</p>
                    <p className="text-sm text-[#7d7d7d]">
                      {searchQuery || statusFilter !== "All"
                        ? "Try adjusting your search or filters"
                        : "No routes have been added yet"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Route
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Stops
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Distance
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Status
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Created
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((route) => (
                          <tr key={route.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="text-sm font-medium text-[#103a5e]">{route.name}</div>
                                <div className="text-sm text-[#7d7d7d]">{route.start} → {route.destination}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex items-center gap-1">
                                <MapPin size={14} className="text-[#7d7d7d]" />
                                <span>{route.stops} stops</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">{formatDistance(route.distance)}</td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock size={14} className="text-[#7d7d7d]" />
                                <span>~{Math.round(route.distance * 4)}m</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-1 text-xs rounded-md ${
                                route.is_active !== false
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {route.is_active !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-[#7d7d7d]">
                              {route.created_at ? formatDate(route.created_at) : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="relative">
                                <button
                                  onClick={() => setShowActionsDropdown(showActionsDropdown === route.id ? null : route.id)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <MoreVertical size={16} />
                                </button>
                                {showActionsDropdown === route.id && (
                                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                                    <button
                                      onClick={() => {
                                        handleViewRoute(route)
                                        setShowActionsDropdown(null)
                                      }}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
                                    >
                                      <Eye size={14} />
                                      View Details
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleEditRoute(route)
                                        setShowActionsDropdown(null)
                                      }}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
                                    >
                                      <Edit size={14} />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeleteRoute(route)
                                        setShowActionsDropdown(null)
                                      }}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-red-600"
                                    >
                                      <Trash2 size={14} />
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <div className="text-sm text-[#7d7d7d]">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} results
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2 border border-[#d9d9d9] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => paginate(page)}
                            className={`px-3 py-2 border rounded-md ${
                              currentPage === page
                                ? "bg-[#0097fb] text-white border-[#0097fb]"
                                : "border-[#d9d9d9] text-[#7d7d7d] hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-2 border border-[#d9d9d9] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <RouteModal
        isOpen={routeModalOpen}
        onClose={() => setRouteModalOpen(false)}
        onSubmit={handleRouteSubmit}
        route={selectedRoute}
        mode={modalMode}
      />

      <RouteDetailsModal
        isOpen={routeDetailsModalOpen}
        onClose={() => setRouteDetailsModalOpen(false)}
        route={selectedRoute}
      />
    </div>
  )
}
