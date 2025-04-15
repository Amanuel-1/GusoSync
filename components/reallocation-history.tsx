"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Search, ChevronDown, ChevronUp, Download } from "lucide-react"

interface ReallocationRecord {
  id: string
  busId: string
  busName: string
  fromRouteId: string
  fromRouteName: string
  toRouteId: string
  toRouteName: string
  requestedBy: string
  requestedAt: string
  status: "Completed" | "Pending" | "Cancelled"
  priority: "Low" | "Normal" | "High"
  reason: string
}

export default function ReallocationHistory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [records, setRecords] = useState<ReallocationRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<ReallocationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<string>("requestedAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null)

  // Mock data for reallocation history
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockRecords: ReallocationRecord[] = [
        {
          id: "RR-001",
          busId: "A245",
          busName: "Bus A245",
          fromRouteId: "R-103",
          fromRouteName: "Bole Road - Merkato",
          toRouteId: "R-106",
          toRouteName: "Ayat - Piazza",
          requestedBy: "John Doe",
          requestedAt: "2023-05-15 09:30:22",
          status: "Completed",
          priority: "High",
          reason: "High passenger demand on Ayat - Piazza route due to construction on alternative routes.",
        },
        {
          id: "RR-002",
          busId: "B112",
          busName: "Bus B112",
          fromRouteId: "R-104",
          fromRouteName: "Megenagna - Piazza",
          toRouteId: "R-107",
          toRouteName: "Kality - Megenagna",
          requestedBy: "Jane Smith",
          requestedAt: "2023-05-14 14:15:45",
          status: "Completed",
          priority: "Normal",
          reason: "Balancing bus distribution across routes to improve service frequency.",
        },
        {
          id: "RR-003",
          busId: "C078",
          busName: "Bus C078",
          fromRouteId: "R-105",
          fromRouteName: "CMC - Mexico Square",
          toRouteId: "R-108",
          toRouteName: "Lebu - Meskel Square",
          requestedBy: "Ahmed Hassan",
          requestedAt: "2023-05-14 10:05:18",
          status: "Cancelled",
          priority: "Low",
          reason: "Bus mechanical issue detected before reallocation could be completed.",
        },
        {
          id: "RR-004",
          busId: "D156",
          busName: "Bus D156",
          fromRouteId: "R-106",
          fromRouteName: "Ayat - Piazza",
          toRouteId: "R-109",
          toRouteName: "Jemo - Piazza",
          requestedBy: "Sarah Johnson",
          requestedAt: "2023-05-13 16:42:30",
          status: "Completed",
          priority: "High",
          reason: "Special event at Jemo requiring additional transportation capacity.",
        },
        {
          id: "RR-005",
          busId: "E201",
          busName: "Bus E201",
          fromRouteId: "R-107",
          fromRouteName: "Kality - Megenagna",
          toRouteId: "R-110",
          toRouteName: "Saris - Megenagna",
          requestedBy: "Michael Brown",
          requestedAt: "2023-05-13 08:20:15",
          status: "Pending",
          priority: "Normal",
          reason: "Scheduled maintenance for buses on Saris - Megenagna route.",
        },
      ]
      setRecords(mockRecords)
      setFilteredRecords(sortRecords(mockRecords, sortField, sortDirection))
      setIsLoading(false)
    }, 1500)
  }, [])

  // Filter and sort records
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecords(sortRecords(records, sortField, sortDirection))
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = records.filter(
        (record) =>
          record.busId.toLowerCase().includes(query) ||
          record.busName.toLowerCase().includes(query) ||
          record.fromRouteId.toLowerCase().includes(query) ||
          record.fromRouteName.toLowerCase().includes(query) ||
          record.toRouteId.toLowerCase().includes(query) ||
          record.toRouteName.toLowerCase().includes(query) ||
          record.requestedBy.toLowerCase().includes(query),
      )
      setFilteredRecords(sortRecords(filtered, sortField, sortDirection))
    }
  }, [searchQuery, records, sortField, sortDirection])

  const sortRecords = (recordsToSort: ReallocationRecord[], field: string, direction: "asc" | "desc") => {
    return [...recordsToSort].sort((a, b) => {
      const valueA = a[field as keyof ReallocationRecord]
      const valueB = b[field as keyof ReallocationRecord]

      if (typeof valueA === "string" && typeof valueB === "string") {
        if (direction === "asc") {
          return valueA.localeCompare(valueB)
        } else {
          return valueB.localeCompare(valueA)
        }
      }
      return 0
    })
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronDown size={14} className="opacity-50" />
    }
    return sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-[#48c864] text-white"
      case "Pending":
        return "bg-[#ff8a00] text-white"
      case "Cancelled":
        return "bg-[#e92c2c] text-white"
      default:
        return "bg-[#7d7d7d] text-white"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "text-[#48c864]"
      case "Normal":
        return "text-[#0097fb]"
      case "High":
        return "text-[#e92c2c]"
      default:
        return "text-[#7d7d7d]"
    }
  }

  const toggleRecordExpansion = (id: string) => {
    setExpandedRecord(expandedRecord === id ? null : id)
  }

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-[#103a5e]">Reallocation History</h2>
        <button className="flex items-center gap-1 text-[#0097fb] text-sm">
          <Download size={16} />
          Export
        </button>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by bus ID, name, route, or requester..."
          className="w-full border border-[#d9d9d9] rounded-md py-2 pl-10 pr-3 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7d7d7d]" size={16} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0097fb]"></div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-8 text-[#7d7d7d]">No reallocation records found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#f1f1f1] text-[#103a5e]">
                <th className="px-4 py-2 text-left text-sm font-medium">
                  <button className="flex items-center" onClick={() => handleSort("id")}>
                    ID {getSortIcon("id")}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  <button className="flex items-center" onClick={() => handleSort("busId")}>
                    Bus {getSortIcon("busId")}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  <button className="flex items-center" onClick={() => handleSort("fromRouteId")}>
                    From Route {getSortIcon("fromRouteId")}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  <button className="flex items-center" onClick={() => handleSort("toRouteId")}>
                    To Route {getSortIcon("toRouteId")}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  <button className="flex items-center" onClick={() => handleSort("requestedAt")}>
                    Date {getSortIcon("requestedAt")}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  <button className="flex items-center" onClick={() => handleSort("status")}>
                    Status {getSortIcon("status")}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  <button className="flex items-center" onClick={() => handleSort("priority")}>
                    Priority {getSortIcon("priority")}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <React.Fragment key={record.id}>
                  <tr className="border-b border-[#f1f1f1] hover:bg-[#f9f9f9]">
                    <td className="px-4 py-3 text-sm">{record.id}</td>
                    <td className="px-4 py-3 text-sm">
                      <div>{record.busId}</div>
                      <div className="text-xs text-[#7d7d7d]">{record.busName}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>{record.fromRouteId}</div>
                      <div className="text-xs text-[#7d7d7d]">{record.fromRouteName}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>{record.toRouteId}</div>
                      <div className="text-xs text-[#7d7d7d]">{record.toRouteName}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{record.requestedAt}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-md ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-medium ${getPriorityColor(record.priority)}`}>{record.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        className="text-[#0097fb] hover:underline"
                        onClick={() => toggleRecordExpansion(record.id)}
                      >
                        {expandedRecord === record.id ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>
                  {expandedRecord === record.id && (
                    <tr>
                      <td colSpan={8} className="bg-[#f9f9f9] px-4 py-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Reason for Reallocation:</div>
                            <div className="text-sm text-[#7d7d7d]">{record.reason}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Additional Information:</div>
                            <div className="text-sm">
                              <div>
                                <span className="text-[#7d7d7d]">Requested by: </span>
                                <span>{record.requestedBy}</span>
                              </div>
                              <div>
                                <span className="text-[#7d7d7d]">Request time: </span>
                                <span>{record.requestedAt}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
