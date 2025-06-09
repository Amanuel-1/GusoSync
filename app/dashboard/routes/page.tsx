"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Bus,
  Users,
  Navigation,
  RefreshCw,
  Plus,
  Route as RouteIcon,
  Power,
  PowerOff
} from "lucide-react"
import { useRouteManagementAPI, type RouteData, type CreateRouteRequest, type UpdateRouteRequest } from "@/hooks/useRouteManagementAPI"
import { authService } from "@/services/authService"
import { showToast } from "@/lib/toast"
import RouteModal from "@/components/RouteManagement/RouteModal"
import RouteDetailsModal from "@/components/RouteManagement/RouteDetailsModal"
import SmartPagination from "@/components/ui/SmartPagination"

export default function RoutesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showActionsDropdown, setShowActionsDropdown] = useState<string | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null)

  // Modal states
  const [routeModalOpen, setRouteModalOpen] = useState(false)
  const [routeDetailsModalOpen, setRouteDetailsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  // Route management hook
  const {
    routes,
    statistics,
    userRole,
    loading,
    error,
    fetchRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    toggleRouteStatus,
    refreshData,
  } = useRouteManagementAPI()

  // Check if user is admin - only CONTROL_ADMIN can modify routes
  const isAdmin = userRole === 'CONTROL_ADMIN'
  const canModify = isAdmin // Only CONTROL_ADMIN can create, modify, or delete routes

  const itemsPerPage = 10

  // Use routes directly since filtering is now done on the backend
  const filteredData = routes

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

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const searchParams: any = {};
      if (searchQuery) searchParams.search = searchQuery;
      if (statusFilter !== "All") {
        searchParams.is_active = statusFilter === "Active";
      }
      fetchRoutes(searchParams);
      setCurrentPage(1);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter, fetchRoutes])

  // Handler functions
  const handleCreateRoute = () => {
    if (!canModify) {
      showToast.error("Only administrators can create routes")
      return
    }
    setSelectedRoute(null)
    setModalMode('create')
    setRouteModalOpen(true)
  }

  const handleEditRoute = (route: RouteData) => {
    if (!canModify) {
      showToast.error("Only administrators can edit routes")
      return
    }
    setSelectedRoute(route)
    setModalMode('edit')
    setRouteModalOpen(true)
  }

  const handleViewRoute = (route: RouteData) => {
    setSelectedRoute(route)
    setRouteDetailsModalOpen(true)
  }

  const handleDeleteRoute = async (route: RouteData) => {
    if (!canModify) {
      showToast.error("Only administrators can delete routes")
      return
    }

    if (window.confirm(`Are you sure you want to delete route ${route.name}?`)) {
      const result = await deleteRoute(route.id)
      if (result.success) {
        setShowActionsDropdown(null)
      }
    }
  }

  const handleRouteSubmit = async (routeData: CreateRouteRequest | UpdateRouteRequest) => {
    if (modalMode === 'create') {
      return await createRoute(routeData as CreateRouteRequest)
    } else {
      return await updateRoute(selectedRoute!.id, routeData as UpdateRouteRequest)
    }
  }

  const handleToggleStatus = async (route: RouteData) => {
    if (!canModify) {
      showToast.error("Only administrators can change route status")
      return
    }

    const result = await toggleRouteStatus(route.id)
    if (result.success) {
      setShowActionsDropdown(null)
    }
  }

  const handleRefresh = () => {
    refreshData()
    showToast.success("Data refreshed")
  }

  // Helper functions
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800"
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f4f9fc] min-h-0">
      <div className="flex-1 overflow-auto">
        <div className="p-6 pb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-medium text-[#103a5e]">Routes Management</h1>
            <p className="text-[#7d7d7d] mt-1">Manage bus routes and monitor their status</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 border border-[#d9d9d9] rounded-md hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
            {canModify && (
              <button
                onClick={handleCreateRoute}
                className="flex items-center gap-2 bg-[#0097fb] text-white px-4 py-2 rounded-md hover:bg-[#0088e2] transition-colors"
              >
                <Plus size={18} />
                <span>Add Route</span>
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7d7d7d]">Total Routes</p>
                <p className="text-2xl font-semibold text-[#103a5e]">{statistics?.totalRoutes || 0}</p>
              </div>
              <RouteIcon className="text-[#0097fb]" size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7d7d7d]">Active Routes</p>
                <p className="text-2xl font-semibold text-green-600">{statistics?.activeRoutes || 0}</p>
              </div>
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7d7d7d]">Total Distance</p>
                <p className="text-2xl font-semibold text-blue-600">{statistics?.totalDistance?.toFixed(1) || 0} km</p>
              </div>
              <Navigation className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7d7d7d]">Avg Distance</p>
                <p className="text-2xl font-semibold text-[#103a5e]">{statistics?.averageDistance?.toFixed(1) || 0} km</p>
              </div>
              <MapPin className="text-[#0097fb]" size={24} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border flex flex-col min-h-0">
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
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
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
                    <RouteIcon className="mx-auto h-12 w-12 text-[#7d7d7d] mb-4" />
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
                  <div className="overflow-x-auto min-w-0">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Route
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Description
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Status
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Distance
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Stops
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
                                <div className="text-sm text-[#7d7d7d]">ID: {route.id.slice(-8)}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="text-[#7d7d7d]">
                                {route.description || 'No description'}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-1 text-xs rounded-md ${getStatusColor(route.is_active)}`}>
                                {route.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Navigation size={14} className="text-[#7d7d7d]" />
                                <span>{route.total_distance ? `${route.total_distance.toFixed(1)} km` : 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex items-center gap-1">
                                <MapPin size={14} className="text-[#7d7d7d]" />
                                <span>{route.stop_ids?.length || 0} stops</span>
                              </div>
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
                                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[140px]">
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
                                    {canModify && (
                                      <>
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
                                            handleToggleStatus(route)
                                            setShowActionsDropdown(null)
                                          }}
                                          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
                                        >
                                          {route.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                                          {route.is_active ? 'Deactivate' : 'Activate'}
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
                                      </>
                                    )}
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
                  <SmartPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={paginate}
                  />
                </>
              )}
            </>
            )}
          </div>
        </div>
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
