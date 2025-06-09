"use client"

import { useState, useEffect } from "react"
import { Download, Filter, Search, UserPlus, Edit, Trash2, Key, ToggleLeft, ToggleRight, Users, UserCheck, UserX, Clock, Eye } from "lucide-react"
import { useUserManagement } from "@/hooks/useUserManagement"
import { useApprovalManagement } from "@/hooks/useApprovalManagement"
import { authService } from "@/services/authService"
import UserModal from "@/components/UserManagement/UserModal"
import PasswordResetModal from "@/components/UserManagement/PasswordResetModal"
import ApprovalModal from "@/components/UserManagement/ApprovalModal"
import UserDetailsModal from "@/components/UserManagement/UserDetailsModal"
import { type User } from "@/services/userService"
import { showToast } from "@/lib/toast"
import SmartPagination from "@/components/ui/SmartPagination"

type UserRole = "driver" | "queueRegulator" | "controlStaff"

export default function PersonnelPage() {
  const [activeTab, setActiveTab] = useState<UserRole>("driver")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  
  // Modal states
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [passwordResetModalOpen, setPasswordResetModalOpen] = useState(false)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  
  // User management hook
  const {
    drivers,
    queueRegulators,
    controlStaff,
    driversLoading,
    queueRegulatorsLoading,
    controlStaffLoading,
    driversError,
    queueRegulatorsError,
    controlStaffError,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    toggleStatus,
    refreshData,
  } = useUserManagement()

  // Approval management hook
  const {
    statistics: approvalStatistics,
  } = useApprovalManagement()
  
  // Check user permissions
  const [canManageControlStaff, setCanManageControlStaff] = useState(false)
  const [canManagePersonnel, setCanManagePersonnel] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  
  useEffect(() => {
    setCanManageControlStaff(authService.canManageControlStaff())
    setCanManagePersonnel(authService.canManagePersonnel())
    setIsAdmin(authService.hasRole('CONTROL_ADMIN'))
  }, [])

  const itemsPerPage = 10

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "driver":
        return { data: drivers, loading: driversLoading, error: driversError }
      case "queueRegulator":
        return { data: queueRegulators, loading: queueRegulatorsLoading, error: queueRegulatorsError }
      case "controlStaff":
        return { data: controlStaff, loading: controlStaffLoading, error: controlStaffError }
      default:
        return { data: [], loading: false, error: null }
    }
  }

  const { data: currentData, loading: currentLoading, error: currentError } = getCurrentData()

  // Filter data based on search and status
  const filteredData = currentData.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = 
      statusFilter === "All" ||
      (statusFilter === "Active" && user.is_active) ||
      (statusFilter === "Inactive" && !user.is_active)
    
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

  // Reset pagination when changing tabs or filters
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery, statusFilter])

  // Action handlers
  const handleCreateUser = () => {
    setModalMode('create')
    setSelectedUser(null)
    setUserModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setModalMode('edit')
    setSelectedUser(user)
    setUserModalOpen(true)
  }

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      const result = await deleteUser(user.id)
      if (result.success) {
        showToast.success('Personnel Deleted', 'Personnel deleted successfully')
      } else {
        showToast.error('Delete Failed', result.message || 'Failed to delete personnel')
      }
    }
  }

  const handleResetPassword = (user: User) => {
    setSelectedUser(user)
    setPasswordResetModalOpen(true)
  }

  const handleToggleStatus = async (user: User) => {
    const result = await toggleStatus(user.id)
    if (result.success) {
      showToast.success(
        'Status Updated',
        `Personnel ${user.is_active ? 'deactivated' : 'activated'} successfully`
      )
    } else {
      showToast.error('Status Update Failed', result.message || 'Failed to update personnel status')
    }
  }

  const handlePasswordReset = async (userId: string) => {
    const result = await resetPassword(userId)
    if (result.success) {
      showToast.success('Password Reset', 'Password reset successfully')
      setPasswordResetModalOpen(false)
    } else {
      showToast.error('Password Reset Failed', result.message || 'Failed to reset password')
    }
    return result
  }

  const handleUserSubmit = async (userData: any) => {
    let result
    if (modalMode === 'create') {
      // Map role based on active tab if not already set
      if (!userData.role) {
        const roleMap = {
          driver: 'BUS_DRIVER',
          queueRegulator: 'QUEUE_REGULATOR',
          controlStaff: 'CONTROL_STAFF',
        }
        userData.role = roleMap[activeTab]
      }
      result = await createUser(userData)
    } else if (selectedUser) {
      result = await updateUser(selectedUser.id, userData)
    }

    if (result?.success) {
      showToast.success(
        `Personnel ${modalMode === 'create' ? 'Created' : 'Updated'}`,
        `Personnel ${modalMode === 'create' ? 'created' : 'updated'} successfully`
      )
      setUserModalOpen(false)
    } else {
      showToast.error(
        `${modalMode === 'create' ? 'Create' : 'Update'} Failed`,
        result?.message || `Failed to ${modalMode} personnel`
      )
    }

    return result || { success: false }
  }

  const handleManageApprovals = () => {
    setApprovalModalOpen(true)
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setUserDetailsModalOpen(true)
  }

  // Helper functions
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'BUS_DRIVER':
        return 'Bus Driver'
      case 'QUEUE_REGULATOR':
        return 'Queue Regulator'
      case 'CONTROL_STAFF':
        return 'Control Staff'
      default:
        return role
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800"
  }

  const getTabDisplayName = (tab: UserRole) => {
    switch (tab) {
      case "driver":
        return "Bus Drivers"
      case "queueRegulator":
        return "Queue Regulators"
      case "controlStaff":
        return "Control Staff"
      default:
        return tab
    }
  }

  // Calculate statistics
  const totalPersonnel = drivers.length + queueRegulators.length + controlStaff.length
  const activePersonnel = [...drivers, ...queueRegulators, ...controlStaff].filter(user => user.is_active).length
  const inactivePersonnel = totalPersonnel - activePersonnel

  if (!canManagePersonnel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f4f9fc] h-full">
        <div className="text-center">
          <h2 className="text-xl font-medium text-[#103a5e] mb-2">Access Denied</h2>
          <p className="text-[#7d7d7d]">You don't have permission to manage personnel.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f4f9fc] overflow-auto">
      <div className="p-6 pb-0 min-h-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium text-[#103a5e]">Personnel Management</h1>
          <div className="flex gap-3">
            {isAdmin && (
              <button
                onClick={handleManageApprovals}
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                <Clock size={18} />
                <span>Manage Approvals</span>
              </button>
            )}
            <button
              onClick={handleCreateUser}
              className="flex items-center gap-2 bg-[#0097fb] text-white px-4 py-2 rounded-md hover:bg-[#0088e2] transition-colors"
            >
              <UserPlus size={18} />
              <span>Add Personnel</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7d7d7d]">Total Personnel</p>
                <p className="text-2xl font-semibold text-[#103a5e]">{totalPersonnel}</p>
              </div>
              <Users className="text-[#0097fb]" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7d7d7d]">Active Personnel</p>
                <p className="text-2xl font-semibold text-green-600">{activePersonnel}</p>
              </div>
              <UserCheck className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7d7d7d]">Inactive Personnel</p>
                <p className="text-2xl font-semibold text-red-600">{inactivePersonnel}</p>
              </div>
              <UserX className="text-red-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7d7d7d]">Bus Drivers</p>
                <p className="text-2xl font-semibold text-[#103a5e]">{drivers.length}</p>
              </div>
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-600">D</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role-based Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7d7d7d]">Queue Regulators</p>
                <p className="text-2xl font-semibold text-[#103a5e]">{queueRegulators.length}</p>
              </div>
              <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                <span className="text-xs font-semibold text-green-600">Q</span>
              </div>
            </div>
          </div>

          {canManageControlStaff && (
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#7d7d7d]">Control Staff</p>
                  <p className="text-2xl font-semibold text-[#103a5e]">{controlStaff.length}</p>
                </div>
                <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                  <span className="text-xs font-semibold text-purple-600">C</span>
                </div>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#7d7d7d]">Pending Approvals</p>
                  <p className="text-2xl font-semibold text-orange-600">
                    {approvalStatistics?.totalPending || 0}
                  </p>
                </div>
                <Clock className="text-orange-500" size={24} />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border flex flex-col min-h-0">
          <div className="border-b flex-shrink-0">
            <div className="flex">
              <button
                className={`py-3 px-6 text-sm font-medium ${
                  activeTab === "driver" ? "bg-[#103a5e] text-white rounded-t-md" : "text-[#7d7d7d] hover:bg-gray-100"
                }`}
                onClick={() => {
                  setActiveTab("driver")
                  setCurrentPage(1)
                }}
              >
                Bus Drivers ({drivers.length})
              </button>
              <button
                className={`py-3 px-6 text-sm font-medium ${
                  activeTab === "queueRegulator" ? "bg-[#103a5e] text-white rounded-t-md" : "text-[#7d7d7d] hover:bg-gray-100"
                }`}
                onClick={() => {
                  setActiveTab("queueRegulator")
                  setCurrentPage(1)
                }}
              >
                Queue Regulators ({queueRegulators.length})
              </button>
              {canManageControlStaff && (
                <button
                  className={`py-3 px-6 text-sm font-medium ${
                    activeTab === "controlStaff" ? "bg-[#103a5e] text-white rounded-t-md" : "text-[#7d7d7d] hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setActiveTab("controlStaff")
                    setCurrentPage(1)
                  }}
                >
                  Control Staff ({controlStaff.length})
                </button>
              )}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7d7d7d]" size={16} />
                  <input
                    type="text"
                    placeholder="Search personnel..."
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
          <div className="flex-1 overflow-auto min-h-0">
            {currentLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0097fb] mx-auto mb-4"></div>
                  <p className="text-[#7d7d7d]">Loading {getTabDisplayName(activeTab).toLowerCase()}...</p>
                </div>
              </div>
            ) : currentError ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-red-600 mb-2">Error loading {getTabDisplayName(activeTab).toLowerCase()}</p>
                  <p className="text-[#7d7d7d] text-sm">{currentError}</p>
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
                    <Users className="mx-auto h-12 w-12 text-[#7d7d7d] mb-4" />
                    <p className="text-[#7d7d7d] mb-2">No {getTabDisplayName(activeTab).toLowerCase()} found</p>
                    <p className="text-sm text-[#7d7d7d]">
                      {searchQuery || statusFilter !== "All"
                        ? "Try adjusting your search or filters"
                        : `No ${getTabDisplayName(activeTab).toLowerCase()} have been added yet`}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Table */}
                  <div className="overflow-auto flex-1 min-h-0">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Personnel
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Email
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Role
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Status
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-[#7d7d7d] uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {user.profile_image ? (
                                  <img
                                    src={user.profile_image}
                                    alt={`${user.first_name} ${user.last_name}`}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                      // Fallback to initials if image fails to load
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const fallback = target.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`w-8 h-8 bg-[#0097fb] rounded-full flex items-center justify-center text-white text-sm font-medium ${user.profile_image ? 'hidden' : ''}`}
                                >
                                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                </div>
                                <button
                                  onClick={() => handleViewDetails(user)}
                                  className="text-sm font-medium text-[#0097fb] hover:text-[#0088e2] hover:underline transition-colors"
                                >
                                  {user.first_name} {user.last_name}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">{user.email}</td>
                            <td className="py-3 px-4 text-sm">{user.phone_number || '-'}</td>
                            <td className="py-3 px-4 text-sm">{getRoleDisplayName(user.role)}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-1 text-xs rounded-md ${getStatusColor(user.is_active)}`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewDetails(user)}
                                  className="text-green-500 hover:text-green-600 p-1"
                                  title="View details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="text-[#0097fb] hover:text-[#0088e2] p-1"
                                  title="Edit personnel"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleResetPassword(user)}
                                  className="text-orange-500 hover:text-orange-600 p-1"
                                  title="Reset password"
                                >
                                  <Key size={16} />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(user)}
                                  className={`p-1 ${user.is_active ? 'text-red-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'}`}
                                  title={user.is_active ? 'Deactivate personnel' : 'Activate personnel'}
                                >
                                  {user.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="text-red-500 hover:text-red-600 p-1"
                                  title="Delete personnel"
                                >
                                  <Trash2 size={16} />
                                </button>
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

      {/* Modals */}
      <UserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSubmit={handleUserSubmit}
        user={selectedUser}
        mode={modalMode}
        allowedRoles={canManageControlStaff ? ['BUS_DRIVER', 'QUEUE_REGULATOR', 'CONTROL_STAFF'] : ['BUS_DRIVER', 'QUEUE_REGULATOR']}
        defaultRole={
          activeTab === 'driver' ? 'BUS_DRIVER' :
          activeTab === 'queueRegulator' ? 'QUEUE_REGULATOR' :
          'CONTROL_STAFF'
        }
      />

      <PasswordResetModal
        isOpen={passwordResetModalOpen}
        onClose={() => setPasswordResetModalOpen(false)}
        onConfirm={handlePasswordReset}
        user={selectedUser}
      />

      <ApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
      />

      <UserDetailsModal
        isOpen={userDetailsModalOpen}
        onClose={() => setUserDetailsModalOpen(false)}
        user={selectedUser}
      />
    </div>
  )
}
