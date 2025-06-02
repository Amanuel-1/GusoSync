"use client"

import { useEffect, useState, useCallback } from "react"
import { useSocket } from "../utils/socket"
import { ReallocationRequest } from "../services/busAllocationAgent"
import { RefreshCcw } from "lucide-react"

export default function IncomingReallocationRequests() {
  const [requests, setRequests] = useState<ReallocationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch active requests from backend
  const fetchActiveRequests = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/reallocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_active_requests" }),
      })
      const data = await res.json()
      if (data.success) {
        console.log("📊 Fetched active requests:", data.requests);
        // Only show requests that are pending or processing
        const filteredRequests = data.requests.filter((req: ReallocationRequest) => req.status === 'pending' || req.status === 'processing');
        setRequests(filteredRequests);
        console.log("📊 Filtered active requests:", filteredRequests);
      } else {
        console.error("Failed to fetch active requests:", data.error)
        setRequests([])
      }
    } catch (error) {
      console.error("Error fetching active requests:", error)
      setRequests([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActiveRequests()
    const interval = setInterval(fetchActiveRequests, 5000); // Refresh active requests every 5 seconds
    return () => clearInterval(interval);
  }, [fetchActiveRequests])

  // Removed socket listener for new_reallocation_request to avoid potential key issues
  // Relying on periodic fetch to get the authoritative list from the agent


  return (
    <div className="bg-white rounded-md shadow-sm p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-[#103a5e]">Agent's Active Requests</h3>
         <button onClick={fetchActiveRequests} disabled={isLoading} className="text-[#0097fb] hover:text-[#0088e2] disabled:opacity-50">
            <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
      </div>
      {isLoading ? (
         <div className="text-[#7d7d7d]">Loading active requests...</div>
      ) : requests.length === 0 ? (
        <div className="text-[#7d7d7d]">No active requests</div>
      ) : (
        <ul className="space-y-2">
          {requests.map((req) => (
            <li key={req.id} className="border border-[#d9d9d9] rounded-md p-2">
              <div>
                <span className="font-medium">{req.fermataName}</span> ({req.fermataId}) — 
                <span className="ml-2">Buses: {req.numBusesAllocated}</span>
                <span className="ml-2">Wait: {req.averageWaitTimeMinutes} min</span>
                <span className="ml-2">Queue: {req.estimatedNumPeopleInQueue}</span>
                <span className="ml-2">Priority: {req.priority}</span>
              </div>
              <div className="text-xs text-[#7d7d7d]">Status: {req.status} | Received: {new Date(req.timestamp || Date.now()).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
