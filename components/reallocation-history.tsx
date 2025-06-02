"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Search, ChevronDown, ChevronUp, Download } from "lucide-react"
import { useSocket } from "../utils/socket"
import { ReallocationDecision } from "../services/busAllocationAgent"

export default function ReallocationHistory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [records, setRecords] = useState<ReallocationDecision[]>([])
  const [filteredRecords, setFilteredRecords] = useState<ReallocationDecision[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<string>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null)

  // Fetch history from backend
  const fetchHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/reallocation?type=decisions", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log("📊 Fetched history data:", data); // Added logging
      if (data.success) {
        setRecords(data.decisions);
        setFilteredRecords(sortRecords(data.decisions, sortField, sortDirection));
        console.log("📊 History records updated:", data.decisions.length); // Added logging
      } else {
        console.error("Failed to fetch history:", data.error);
        setRecords([]);
        setFilteredRecords([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setRecords([]);
      setFilteredRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [sortField, sortDirection]);

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Listen for allocation history updates via socket
  useSocket("allocation_history_update", fetchHistory)

  // Filter and sort records
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecords(sortRecords(records, sortField, sortDirection))
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = records.filter(
        (record) =>
          record.busId?.toLowerCase().includes(query) ||
          record.fromRouteId?.toLowerCase().includes(query) ||
          record.toRouteId?.toLowerCase().includes(query) ||
          record.agentDecision?.reasoning?.toLowerCase().includes(query) ||
          record.id.toLowerCase().includes(query)
      )
      setFilteredRecords(sortRecords(filtered, sortField, sortDirection))
    }
  }, [searchQuery, records, sortField, sortDirection])

  function sortRecords(recordsToSort: ReallocationDecision[], field: string, direction: "asc" | "desc") {
    return [...recordsToSort].sort((a, b) => {
      const valueA = a[field as keyof ReallocationDecision]
      const valueB = b[field as keyof ReallocationDecision]
      if (typeof valueA === "string" && typeof valueB === "string") {
        if (direction === "asc") {
          return valueA.localeCompare(valueB)
        } else {
          return valueB.localeCompare(valueA) // Corrected comparison here
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
          placeholder="Search by bus ID, route, or reasoning..."
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
                  <button className="flex items-center" onClick={() => handleSort("timestamp")}>
                    Date {getSortIcon("timestamp")}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  <button className="flex items-center" onClick={() => handleSort("status")}>
                    Status {getSortIcon("status")}
                  </button>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">Reasoning</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <React.Fragment key={record.id}>
                  <tr className="border-b border-[#f1f1f1] hover:bg-[#f9f9f9]">
                    <td className="px-4 py-3 text-sm">{record.id}</td>
                    <td className="px-4 py-3 text-sm">{record.busId || "-"}</td>
                    <td className="px-4 py-3 text-sm">{record.fromRouteId || "-"}</td>
                    <td className="px-4 py-3 text-sm">{record.toRouteId || "-"}</td>
                    <td className="px-4 py-3 text-sm">{new Date(record.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{record.status}</td>
                    <td className="px-4 py-3 text-sm">{record.agentDecision?.reasoning || "-"}</td>
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
                        <div className="text-sm">
                          <div>
                            <span className="text-[#7d7d7d]">Reasoning: </span>
                            <span>{record.agentDecision?.reasoning}</span>
                          </div>
                          <div>
                            <span className="text-[#7d7d7d]">Decision: </span>
                            <span>{record.agentDecision?.success ? "Auto Approved" : "Manual Review"}</span>
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
