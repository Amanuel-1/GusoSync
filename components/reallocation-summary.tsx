"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, X } from "lucide-react"

interface Bus {
  id: string
  name: string
  routeId: string
  routeName: string
  status: string
  driver: string
  capacity: number
  passengerCount: number
}

interface Route {
  id: string
  name: string
  stops: number
  activeBuses: number
  expectedLoad: "Low" | "Medium" | "High" | "Very High"
  regulatorName: string
  regulatorPhone: string
}

interface ReallocationSummaryProps {
  selectedBus: Bus | null
  selectedRoute: Route | null
  onConfirm: () => void
  onCancel: () => void
}

export default function ReallocationSummary({
  selectedBus,
  selectedRoute,
  onConfirm,
  onCancel,
}: ReallocationSummaryProps) {
  const [reason, setReason] = useState("")
  const [priority, setPriority] = useState("normal")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = () => {
    if (!reason) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        onConfirm()
      }, 3000)
    }, 1500)
  }

  if (!selectedBus || !selectedRoute) {
    return null
  }

  if (showSuccess) {
    return (
      <div className="bg-white rounded-md shadow-sm p-4">
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="text-[#48c864] mb-4" size={48} />
          <h2 className="text-lg font-medium text-[#103a5e] mb-2">Reallocation Successful</h2>
          <p className="text-[#7d7d7d] text-center mb-4">
            Bus {selectedBus.id} has been successfully reallocated to route {selectedRoute.id}
          </p>
          <div className="text-sm text-[#7d7d7d]">Redirecting to reallocation history...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-[#103a5e]">Reallocation Summary</h2>
        <button onClick={onCancel} className="text-[#7d7d7d] hover:text-[#103a5e]">
          <X size={20} />
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center mb-2">
          <AlertTriangle className="text-[#ff8a00] mr-2" size={20} />
          <span className="text-sm font-medium">Please review the reallocation details before confirming</span>
        </div>
        <div className="text-xs text-[#7d7d7d]">
          This action will immediately reassign the bus to the new route and notify all relevant personnel.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-[#d9d9d9] rounded-md p-3">
          <h3 className="font-medium text-[#103a5e] mb-2">Bus Details</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[#7d7d7d]">Bus ID:</span>
              <span className="font-medium">{selectedBus.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7d7d7d]">Bus Name:</span>
              <span className="font-medium">{selectedBus.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7d7d7d]">Current Route:</span>
              <span className="font-medium">{selectedBus.routeId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7d7d7d]">Driver:</span>
              <span className="font-medium">{selectedBus.driver}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7d7d7d]">Status:</span>
              <span className="font-medium">{selectedBus.status.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7d7d7d]">Passengers:</span>
              <span className="font-medium">
                {selectedBus.passengerCount}/{selectedBus.capacity}
              </span>
            </div>
          </div>
        </div>

        <div className="border border-[#d9d9d9] rounded-md p-3">
          <h3 className="font-medium text-[#103a5e] mb-2">New Route Details</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[#7d7d7d]">Route ID:</span>
              <span className="font-medium">{selectedRoute.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7d7d7d]">Route Name:</span>
              <span className="font-medium">{selectedRoute.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7d7d7d]">Stops:</span>
              <span className="font-medium">{selectedRoute.stops}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7d7d7d]">Active Buses:</span>
              <span className="font-medium">{selectedRoute.activeBuses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7d7d7d]">Expected Load:</span>
              <span className="font-medium">{selectedRoute.expectedLoad}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7d7d7d]">Regulator:</span>
              <span className="font-medium">{selectedRoute.regulatorName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-[#103a5e] mb-1">Reallocation Reason</label>
        <textarea
          className="w-full border border-[#d9d9d9] rounded-md p-2 text-sm"
          rows={3}
          placeholder="Enter reason for reallocation..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        ></textarea>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[#103a5e] mb-1">Priority</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="priority"
              value="low"
              checked={priority === "low"}
              onChange={() => setPriority("low")}
              className="mr-2"
            />
            <span className="text-sm">Low</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="priority"
              value="normal"
              checked={priority === "normal"}
              onChange={() => setPriority("normal")}
              className="mr-2"
            />
            <span className="text-sm">Normal</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="priority"
              value="high"
              checked={priority === "high"}
              onChange={() => setPriority("high")}
              className="mr-2"
            />
            <span className="text-sm">High</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-[#d9d9d9] rounded-md text-sm text-[#7d7d7d] hover:bg-[#f9f9f9]"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!reason || isSubmitting}
          className={`px-4 py-2 rounded-md text-sm text-white ${
            !reason || isSubmitting ? "bg-[#7d7d7d]" : "bg-[#0097fb] hover:bg-[#0088e2]"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            "Confirm Reallocation"
          )}
        </button>
      </div>
    </div>
  )
}
