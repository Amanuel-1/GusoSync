"use client"

import { useState } from "react"
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Download, Filter, Search, UserPlus } from "lucide-react"
import Link from "next/link"

type UserRole = "admin" | "allocator" | "driver" | "control"

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  status: "Active" | "Inactive" | "Suspended" | "Pending"
  lastActive: string

  // Admin specific
  department?: string
  accessLevel?: string
  position?: string

  // Route Allocator specific
  assignedRegions?: string[]
  activeAllocations?: number
  totalAllocations?: number

  // Driver specific
  licenseNumber?: string
  licenseExpiry?: string
  currentRoute?: string
  vehicleId?: string
  vehicleType?: string

  // Control Staff specific
  specialization?: string
  shift?: string
  certifications?: string[]
  monitoredRoutes?: number
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserRole>("admin")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("All time")
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [statusFilter, setStatusFilter] = useState("All")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  // Mock data for different user roles
  const adminUsers: UserData[] = [
    {
      id: "A001",
      name: "John Doe",
      email: "john.doe@guzo.com",
      phone: "+251912345678",
      status: "Active",
      lastActive: "Today, 10:15 AM",
      department: "Operations",
      accessLevel: "Level 4",
      position: "Senior Administrator",
    },
    {
      id: "A002",
      name: "Sarah Johnson",
      email: "sarah.j@guzo.com",
      phone: "+251912345679",
      status: "Active",
      lastActive: "Today, 09:30 AM",
      department: "Human Resources",
      accessLevel: "Level 3",
      position: "HR Administrator",
    },
    {
      id: "A003",
      name: "Michael Brown",
      email: "m.brown@guzo.com",
      phone: "+251912345680",
      status: "Inactive",
      lastActive: "Yesterday, 04:45 PM",
      department: "Finance",
      accessLevel: "Level 3",
      position: "Finance Administrator",
    },
    {
      id: "A004",
      name: "Emily Davis",
      email: "emily.d@guzo.com",
      phone: "+251912345681",
      status: "Active",
      lastActive: "Today, 11:20 AM",
      department: "IT",
      accessLevel: "Level 5",
      position: "System Administrator",
    },
    {
      id: "A005",
      name: "David Wilson",
      email: "d.wilson@guzo.com",
      phone: "+251912345682",
      status: "Suspended",
      lastActive: "3 days ago",
      department: "Operations",
      accessLevel: "Level 3",
      position: "Operations Administrator",
    },
    {
      id: "A006",
      name: "Lisa Martinez",
      email: "lisa.m@guzo.com",
      phone: "+251912345683",
      status: "Active",
      lastActive: "Today, 08:50 AM",
      department: "Customer Service",
      accessLevel: "Level 2",
      position: "Support Administrator",
    },
    {
      id: "A007",
      name: "Robert Taylor",
      email: "r.taylor@guzo.com",
      phone: "+251912345684",
      status: "Active",
      lastActive: "Yesterday, 02:15 PM",
      department: "Maintenance",
      accessLevel: "Level 3",
      position: "Maintenance Administrator",
    },
    {
      id: "A008",
      name: "Jennifer Anderson",
      email: "j.anderson@guzo.com",
      phone: "+251912345685",
      status: "Pending",
      lastActive: "Never",
      department: "Operations",
      accessLevel: "Level 2",
      position: "Junior Administrator",
    },
  ]

  const allocatorUsers: UserData[] = [
    {
      id: "RA001",
      name: "Ahmed Hassan",
      email: "a.hassan@guzo.com",
      phone: "+251912345686",
      status: "Active",
      lastActive: "Today, 11:45 AM",
      assignedRegions: ["Bole", "Kirkos"],
      activeAllocations: 12,
      totalAllocations: 156,
    },
    {
      id: "RA002",
      name: "Fatima Mohammed",
      email: "f.mohammed@guzo.com",
      phone: "+251912345687",
      status: "Active",
      lastActive: "Today, 10:30 AM",
      assignedRegions: ["Addis Ketema", "Lideta"],
      activeAllocations: 8,
      totalAllocations: 124,
    },
    {
      id: "RA003",
      name: "Solomon Tesfaye",
      email: "s.tesfaye@guzo.com",
      phone: "+251912345688",
      status: "Inactive",
      lastActive: "3 days ago",
      assignedRegions: ["Yeka", "Akaki Kality"],
      activeAllocations: 0,
      totalAllocations: 98,
    },
    {
      id: "RA004",
      name: "Tigist Haile",
      email: "t.haile@guzo.com",
      phone: "+251912345689",
      status: "Active",
      lastActive: "Today, 09:15 AM",
      assignedRegions: ["Arada", "Gulele"],
      activeAllocations: 15,
      totalAllocations: 203,
    },
    {
      id: "RA005",
      name: "Dawit Mengistu",
      email: "d.mengistu@guzo.com",
      phone: "+251912345690",
      status: "Active",
      lastActive: "Yesterday, 05:20 PM",
      assignedRegions: ["Nifas Silk-Lafto", "Kolfe Keranio"],
      activeAllocations: 10,
      totalAllocations: 178,
    },
    {
      id: "RA006",
      name: "Hanna Girma",
      email: "h.girma@guzo.com",
      phone: "+251912345691",
      status: "Suspended",
      lastActive: "1 week ago",
      assignedRegions: ["Bole", "Kirkos"],
      activeAllocations: 0,
      totalAllocations: 87,
    },
  ]

  const driverUsers: UserData[] = [
    {
      id: "D001",
      name: "Yonas Tadesse",
      email: "y.tadesse@guzo.com",
      phone: "+251912345692",
      status: "Active",
      lastActive: "Today, 12:30 PM",
      licenseNumber: "ETH-DL-123456",
      licenseExpiry: "2025-06-15",
      currentRoute: "R-103",
      vehicleId: "A245",
      vehicleType: "Standard Bus",
    },
    {
      id: "D002",
      name: "Abebe Kebede",
      email: "a.kebede@guzo.com",
      phone: "+251912345693",
      status: "Active",
      lastActive: "Today, 11:45 AM",
      licenseNumber: "ETH-DL-123457",
      licenseExpiry: "2024-08-22",
      currentRoute: "R-104",
      vehicleId: "B112",
      vehicleType: "Standard Bus",
    },
    {
      id: "D003",
      name: "Kidist Alemu",
      email: "k.alemu@guzo.com",
      phone: "+251912345694",
      status: "Inactive",
      lastActive: "2 days ago",
      licenseNumber: "ETH-DL-123458",
      licenseExpiry: "2024-11-30",
      currentRoute: "None",
      vehicleId: "None",
      vehicleType: "Articulated Bus",
    },
    {
      id: "D004",
      name: "Bereket Tadesse",
      email: "b.tadesse@guzo.com",
      phone: "+251912345695",
      status: "Active",
      lastActive: "Today, 10:20 AM",
      licenseNumber: "ETH-DL-123459",
      licenseExpiry: "2025-03-18",
      currentRoute: "R-110",
      vehicleId: "H234",
      vehicleType: "Standard Bus",
    },
    {
      id: "D005",
      name: "Meron Hailu",
      email: "m.hailu@guzo.com",
      phone: "+251912345696",
      status: "Active",
      lastActive: "Today, 09:50 AM",
      licenseNumber: "ETH-DL-123460",
      licenseExpiry: "2025-01-25",
      currentRoute: "R-105",
      vehicleId: "C078",
      vehicleType: "Articulated Bus",
    },
    {
      id: "D006",
      name: "Tewodros Bekele",
      email: "t.bekele@guzo.com",
      phone: "+251912345697",
      status: "Suspended",
      lastActive: "1 week ago",
      licenseNumber: "ETH-DL-123461",
      licenseExpiry: "2024-09-12",
      currentRoute: "None",
      vehicleId: "None",
      vehicleType: "Double-Decker",
    },
    {
      id: "D007",
      name: "Sara Tekle",
      email: "s.tekle@guzo.com",
      phone: "+251912345698",
      status: "Active",
      lastActive: "Today, 08:30 AM",
      licenseNumber: "ETH-DL-123462",
      licenseExpiry: "2025-04-20",
      currentRoute: "R-107",
      vehicleId: "E201",
      vehicleType: "Standard Bus",
    },
    {
      id: "D008",
      name: "Henok Assefa",
      email: "h.assefa@guzo.com",
      phone: "+251912345699",
      status: "Active",
      lastActive: "Yesterday, 06:15 PM",
      licenseNumber: "ETH-DL-123463",
      licenseExpiry: "2024-12-05",
      currentRoute: "R-108",
      vehicleId: "F089",
      vehicleType: "Minibus",
    },
    {
      id: "D009",
      name: "Bethlehem Negash",
      email: "b.negash@guzo.com",
      phone: "+251912345700",
      status: "Pending",
      lastActive: "Never",
      licenseNumber: "ETH-DL-123464",
      licenseExpiry: "2025-02-28",
      currentRoute: "None",
      vehicleId: "None",
      vehicleType: "Standard Bus",
    },
    {
      id: "D010",
      name: "Nahom Gebre",
      email: "n.gebre@guzo.com",
      phone: "+251912345701",
      status: "Active",
      lastActive: "Today, 07:45 AM",
      licenseNumber: "ETH-DL-123465",
      licenseExpiry: "2025-05-10",
      currentRoute: "R-109",
      vehicleId: "G123",
      vehicleType: "Standard Bus",
    },
  ]

  const controlUsers: UserData[] = [
    {
      id: "CS001",
      name: "Meseret Abebe",
      email: "m.abebe@guzo.com",
      phone: "+251912345702",
      status: "Active",
      lastActive: "Today, 12:15 PM",
      specialization: "Route Management",
      shift: "Morning",
      certifications: ["Traffic Management", "GPS and Tracking"],
      monitoredRoutes: 8,
    },
    {
      id: "CS002",
      name: "Daniel Teferi",
      email: "d.teferi@guzo.com",
      phone: "+251912345703",
      status: "Active",
      lastActive: "Today, 11:30 AM",
      specialization: "Traffic Control",
      shift: "Afternoon",
      certifications: ["Traffic Management", "Emergency Response"],
      monitoredRoutes: 6,
    },
    {
      id: "CS003",
      name: "Rahel Mulugeta",
      email: "r.mulugeta@guzo.com",
      phone: "+251912345704",
      status: "Inactive",
      lastActive: "3 days ago",
      specialization: "Emergency Response",
      shift: "Night",
      certifications: ["Emergency Response", "Communication Systems"],
      monitoredRoutes: 0,
    },
    {
      id: "CS004",
      name: "Yared Alemayehu",
      email: "y.alemayehu@guzo.com",
      phone: "+251912345705",
      status: "Active",
      lastActive: "Today, 10:45 AM",
      specialization: "Fleet Monitoring",
      shift: "Morning",
      certifications: ["GPS and Tracking", "Communication Systems"],
      monitoredRoutes: 12,
    },
    {
      id: "CS005",
      name: "Frehiwot Teshome",
      email: "f.teshome@guzo.com",
      phone: "+251912345706",
      status: "Active",
      lastActive: "Today, 09:20 AM",
      specialization: "Passenger Services",
      shift: "Afternoon",
      certifications: ["Communication Systems"],
      monitoredRoutes: 5,
    },
    {
      id: "CS006",
      name: "Getachew Bekele",
      email: "g.bekele@guzo.com",
      phone: "+251912345707",
      status: "Suspended",
      lastActive: "1 week ago",
      specialization: "Route Management",
      shift: "Rotating",
      certifications: ["Traffic Management", "GPS and Tracking"],
      monitoredRoutes: 0,
    },
    {
      id: "CS007",
      name: "Selamawit Yohannes",
      email: "s.yohannes@guzo.com",
      phone: "+251912345708",
      status: "Active",
      lastActive: "Yesterday, 04:30 PM",
      specialization: "Traffic Control",
      shift: "Night",
      certifications: ["Traffic Management", "Emergency Response"],
      monitoredRoutes: 7,
    },
  ]

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "admin":
        return adminUsers
      case "allocator":
        return allocatorUsers
      case "driver":
        return driverUsers
      case "control":
        return controlUsers
      default:
        return adminUsers
    }
  }

  // Filter data based on search query and status
  const filteredData = getCurrentData().filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "All" || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Get current page data
  const itemsPerPage = 8
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#48c864] text-white"
      case "Inactive":
        return "bg-[#7d7d7d] text-white"
      case "Suspended":
        return "bg-[#e92c2c] text-white"
      case "Pending":
        return "bg-[#ff8a00] text-white"
      default:
        return "bg-[#7d7d7d] text-white"
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f4f9fc] h-full">
      <div className="p-6 pb-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium text-[#103a5e]">Users</h1>
          <Link
            href="/register"
            className="flex items-center gap-2 bg-[#0097fb] text-white px-4 py-2 rounded-md hover:bg-[#0088e2] transition-colors"
          >
            <UserPlus size={18} />
            <span>Add New User</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#d9d9d9]">
          <button
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === "admin" ? "bg-[#103a5e] text-white rounded-t-md" : "text-[#7d7d7d] hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("admin")
              setCurrentPage(1)
            }}
          >
            Administrators
          </button>
          <button
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === "allocator" ? "bg-[#103a5e] text-white rounded-t-md" : "text-[#7d7d7d] hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("allocator")
              setCurrentPage(1)
            }}
          >
            Route Allocators
          </button>
          <button
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === "driver" ? "bg-[#103a5e] text-white rounded-t-md" : "text-[#7d7d7d] hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("driver")
              setCurrentPage(1)
            }}
          >
            Drivers
          </button>
          <button
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === "control" ? "bg-[#103a5e] text-white rounded-t-md" : "text-[#7d7d7d] hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab("control")
              setCurrentPage(1)
            }}
          >
            Control Staff
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6 pt-0">
        {/* Filters and Search */}
        <div className="flex justify-between mb-6">
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="border border-[#d9d9d9] rounded-md py-2 pl-10 pr-3 text-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7d7d7d]" size={16} />
            </div>

            <div className="relative">
              <button
                className="flex items-center gap-2 border border-[#d9d9d9] rounded-md py-2 px-4 text-sm bg-white"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <span>Status: {statusFilter}</span>
                <ChevronDown size={16} className={`transition-transform ${showStatusDropdown ? "rotate-180" : ""}`} />
              </button>

              {showStatusDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)}></div>
                  <div className="absolute left-0 mt-1 w-40 bg-white rounded-md shadow-lg z-20">
                    <div className="py-1">
                      {["All", "Active", "Inactive", "Suspended", "Pending"].map((status) => (
                        <button
                          key={status}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            statusFilter === status
                              ? "bg-[#f1f1f1] text-[#103a5e]"
                              : "text-[#7d7d7d] hover:bg-[#f9f9f9]"
                          }`}
                          onClick={() => {
                            setStatusFilter(status)
                            setShowStatusDropdown(false)
                            setCurrentPage(1)
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button className="flex items-center gap-2 border border-[#d9d9d9] rounded-md py-2 px-4 text-sm bg-white">
              <Filter size={16} />
              <span>More Filters</span>
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <button
                className="flex items-center gap-2 border border-[#d9d9d9] rounded-md py-2 px-4 text-sm bg-white"
                onClick={() => setShowDateDropdown(!showDateDropdown)}
              >
                <Calendar size={16} />
                <span>{dateFilter}</span>
                <ChevronDown size={16} className={`transition-transform ${showDateDropdown ? "rotate-180" : ""}`} />
              </button>

              {showDateDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDateDropdown(false)}></div>
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-20">
                    <div className="py-1">
                      {[
                        "Today",
                        "Yesterday",
                        "Last 7 days",
                        "Last 30 days",
                        "This month",
                        "Last month",
                        "All time",
                      ].map((option) => (
                        <button
                          key={option}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            dateFilter === option ? "bg-[#f1f1f1] text-[#103a5e]" : "text-[#7d7d7d] hover:bg-[#f9f9f9]"
                          }`}
                          onClick={() => {
                            setDateFilter(option)
                            setShowDateDropdown(false)
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button className="flex items-center gap-2 text-[#0097fb] border border-[#0097fb] rounded-md py-2 px-4 text-sm bg-white">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-md shadow-sm p-4">
            <div className="text-sm text-[#7d7d7d] mb-1">Total Users</div>
            <div className="text-2xl font-bold text-[#103a5e]">
              {adminUsers.length + allocatorUsers.length + driverUsers.length + controlUsers.length}
            </div>
            <div className="flex items-center mt-2">
              <div className="w-full bg-[#f1f1f1] rounded-full h-1.5">
                <div className="bg-[#0097fb] h-1.5 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm p-4">
            <div className="text-sm text-[#7d7d7d] mb-1">Active Users</div>
            <div className="text-2xl font-bold text-[#48c864]">
              {
                [...adminUsers, ...allocatorUsers, ...driverUsers, ...controlUsers].filter(
                  (user) => user.status === "Active",
                ).length
              }
            </div>
            <div className="flex items-center mt-2">
              <div className="w-full bg-[#f1f1f1] rounded-full h-1.5">
                <div className="bg-[#48c864] h-1.5 rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm p-4">
            <div className="text-sm text-[#7d7d7d] mb-1">Inactive Users</div>
            <div className="text-2xl font-bold text-[#7d7d7d]">
              {
                [...adminUsers, ...allocatorUsers, ...driverUsers, ...controlUsers].filter(
                  (user) => user.status === "Inactive",
                ).length
              }
            </div>
            <div className="flex items-center mt-2">
              <div className="w-full bg-[#f1f1f1] rounded-full h-1.5">
                <div className="bg-[#7d7d7d] h-1.5 rounded-full" style={{ width: "10%" }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm p-4">
            <div className="text-sm text-[#7d7d7d] mb-1">Suspended Users</div>
            <div className="text-2xl font-bold text-[#e92c2c]">
              {
                [...adminUsers, ...allocatorUsers, ...driverUsers, ...controlUsers].filter(
                  (user) => user.status === "Suspended",
                ).length
              }
            </div>
            <div className="flex items-center mt-2">
              <div className="w-full bg-[#f1f1f1] rounded-full h-1.5">
                <div className="bg-[#e92c2c] h-1.5 rounded-full" style={{ width: "5%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[#0097fb] text-white">
                  <th className="py-3 px-4 text-left text-xs font-medium">ID</th>
                  <th className="py-3 px-4 text-left text-xs font-medium">NAME</th>
                  <th className="py-3 px-4 text-left text-xs font-medium">EMAIL</th>
                  <th className="py-3 px-4 text-left text-xs font-medium">PHONE</th>

                  {/* Admin specific columns */}
                  {activeTab === "admin" && (
                    <>
                      <th className="py-3 px-4 text-left text-xs font-medium">DEPARTMENT</th>
                      <th className="py-3 px-4 text-left text-xs font-medium">POSITION</th>
                      <th className="py-3 px-4 text-left text-xs font-medium">ACCESS LEVEL</th>
                    </>
                  )}

                  {/* Route Allocator specific columns */}
                  {activeTab === "allocator" && (
                    <>
                      <th className="py-3 px-4 text-left text-xs font-medium">ASSIGNED REGIONS</th>
                      <th className="py-3 px-4 text-left text-xs font-medium">ACTIVE ALLOCATIONS</th>
                      <th className="py-3 px-4 text-left text-xs font-medium">TOTAL ALLOCATIONS</th>
                    </>
                  )}

                  {/* Driver specific columns */}
                  {activeTab === "driver" && (
                    <>
                      <th className="py-3 px-4 text-left text-xs font-medium">LICENSE</th>
                      <th className="py-3 px-4 text-left text-xs font-medium">CURRENT ROUTE</th>
                      <th className="py-3 px-4 text-left text-xs font-medium">VEHICLE</th>
                    </>
                  )}

                  {/* Control Staff specific columns */}
                  {activeTab === "control" && (
                    <>
                      <th className="py-3 px-4 text-left text-xs font-medium">SPECIALIZATION</th>
                      <th className="py-3 px-4 text-left text-xs font-medium">SHIFT</th>
                      <th className="py-3 px-4 text-left text-xs font-medium">MONITORED ROUTES</th>
                    </>
                  )}

                  <th className="py-3 px-4 text-left text-xs font-medium">STATUS</th>
                  <th className="py-3 px-4 text-left text-xs font-medium">LAST ACTIVE</th>
                  <th className="py-3 px-4 text-left text-xs font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-[#f1f1f1] hover:bg-[#f9f9f9] ${
                        index % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"
                      }`}
                    >
                      <td className="py-3 px-4 text-sm">{user.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-[#0097fb] text-white flex items-center justify-center mr-3">
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{user.email}</td>
                      <td className="py-3 px-4 text-sm">{user.phone}</td>

                      {/* Admin specific data */}
                      {activeTab === "admin" && (
                        <>
                          <td className="py-3 px-4 text-sm">{user.department}</td>
                          <td className="py-3 px-4 text-sm">{user.position}</td>
                          <td className="py-3 px-4 text-sm">{user.accessLevel}</td>
                        </>
                      )}

                      {/* Route Allocator specific data */}
                      {activeTab === "allocator" && (
                        <>
                          <td className="py-3 px-4 text-sm">{user.assignedRegions?.join(", ")}</td>
                          <td className="py-3 px-4 text-sm">{user.activeAllocations}</td>
                          <td className="py-3 px-4 text-sm">{user.totalAllocations}</td>
                        </>
                      )}

                      {/* Driver specific data */}
                      {activeTab === "driver" && (
                        <>
                          <td className="py-3 px-4 text-sm">
                            <div>{user.licenseNumber}</div>
                            <div className="text-xs text-[#7d7d7d]">Expires: {user.licenseExpiry}</div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {user.currentRoute !== "None" ? user.currentRoute : "-"}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div>{user.vehicleId !== "None" ? user.vehicleId : "-"}</div>
                            <div className="text-xs text-[#7d7d7d]">{user.vehicleType}</div>
                          </td>
                        </>
                      )}

                      {/* Control Staff specific data */}
                      {activeTab === "control" && (
                        <>
                          <td className="py-3 px-4 text-sm">{user.specialization}</td>
                          <td className="py-3 px-4 text-sm">{user.shift}</td>
                          <td className="py-3 px-4 text-sm">{user.monitoredRoutes}</td>
                        </>
                      )}

                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-md ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{user.lastActive}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex space-x-2">
                          <button className="text-[#0097fb] hover:underline">View</button>
                          <button className="text-[#0097fb] hover:underline">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={
                        activeTab === "admin" ? 10 : activeTab === "allocator" ? 10 : activeTab === "driver" ? 10 : 10
                      }
                      className="py-8 text-center text-[#7d7d7d]"
                    >
                      No users found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-[#7d7d7d]">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of{" "}
              {filteredData.length} users
            </div>

            <div className="flex items-center">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? "text-gray-400" : "text-[#103a5e] hover:bg-gray-100"}`}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }).map((_, i) => {
                // Show limited page numbers with ellipsis
                if (
                  i === 0 || // First page
                  i === Math.ceil(filteredData.length / itemsPerPage) - 1 || // Last page
                  (i >= currentPage - 2 && i <= currentPage + 1) // Pages around current
                ) {
                  return (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`w-8 h-8 mx-1 rounded-md ${
                        currentPage === i + 1 ? "bg-[#103a5e] text-white" : "text-[#103a5e] hover:bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                } else if (i === currentPage - 3 || i === currentPage + 2) {
                  // Show ellipsis
                  return (
                    <span key={i} className="mx-1">
                      ...
                    </span>
                  )
                }
                return null
              })}

              <button
                onClick={() => paginate(Math.min(Math.ceil(filteredData.length / itemsPerPage), currentPage + 1))}
                disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
                className={`p-2 rounded-md ${
                  currentPage === Math.ceil(filteredData.length / itemsPerPage)
                    ? "text-gray-400"
                    : "text-[#103a5e] hover:bg-gray-100"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
