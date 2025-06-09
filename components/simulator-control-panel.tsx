"use client"

import { useEffect, useState, useCallback } from "react"
import { Play, Square, RefreshCcw, Zap } from "lucide-react"
import { showToast } from "@/lib/toast"

interface SimulatorStatus {
  isRunning: boolean;
  requestFrequencyMs: number;
  expiryTimeMinutes: number;
}

export default function SimulatorControlPanel() {
  const [status, setStatus] = useState<SimulatorStatus | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [bulkCount, setBulkCount] = useState(20)
  const [frequency, setFrequency] = useState(30000) // 30 seconds
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false)

  const fetchSimulatorStatus = useCallback(async () => {
    setIsLoadingStatus(true)
    try {
      const res = await fetch("/api/simulator")
      const data = await res.json()
      if (data.success) {
        setStatus(data.status)
        setFrequency(data.status.requestFrequencyMs)
      } else {
        console.error("Failed to fetch simulator status:", data.error)
        setStatus(null)
      }
    } catch (error) {
      console.error("Error fetching simulator status:", error)
      setStatus(null)
    } finally {
      setIsLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    fetchSimulatorStatus()
    const interval = setInterval(fetchSimulatorStatus, 10000) // Refresh status every 10 seconds
    return () => clearInterval(interval)
  }, [fetchSimulatorStatus])

  const handleStartSimulator = async () => {
    setIsStarting(true)
    try {
      const res = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      })
      const data = await res.json()
      if (data.success) {
        showToast.success("Simulator Started", data.message)
        fetchSimulatorStatus() // Refresh status after action
      } else {
        showToast.error("Failed to Start Simulator", data.error)
      }
    } catch (error) {
      console.error("Error starting simulator:", error)
      showToast.error("Error", "An error occurred while trying to start the simulator.")
    } finally {
      setIsStarting(false)
    }
  }

  const handleStopSimulator = async () => {
    setIsStopping(true)
    try {
      const res = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      })
      const data = await res.json()
      if (data.success) {
        showToast.success("Simulator Stopped", data.message)
        fetchSimulatorStatus() // Refresh status after action
      } else {
        showToast.error("Failed to Stop Simulator", data.error)
      }
    } catch (error) {
      console.error("Error stopping simulator:", error)
      showToast.error("Error", "An error occurred while trying to stop the simulator.")
    } finally {
      setIsStopping(false)
    }
  }

  const handleGenerateBulk = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_bulk",
          count: bulkCount
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast.success("Bulk Requests Generated", data.message)
      } else {
        showToast.error("Failed to Generate Requests", data.error)
      }
    } catch (error) {
      console.error("Error generating bulk requests:", error)
      showToast.error("Error", "An error occurred while trying to generate bulk requests.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUpdateConfig = async () => {
    setIsUpdatingConfig(true)
    try {
      const res = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_config",
          requestFrequencyMs: frequency
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast.success("Configuration Updated", data.message)
        fetchSimulatorStatus() // Refresh status after action
      } else {
        showToast.error("Failed to Update Configuration", data.error)
      }
    } catch (error) {
      console.error("Error updating configuration:", error)
      showToast.error("Error", "An error occurred while trying to update the configuration.")
    } finally {
      setIsUpdatingConfig(false)
    }
  }

  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Zap className="text-[#ff8a00]" size={24} />
          <h2 className="text-lg font-medium text-[#103a5e]">Request Simulator</h2>
        </div>
      </div>

      {/* Simulator Status */}
      <div className="border border-[#d9d9d9] rounded-md p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-[#103a5e]">Simulator Status</h3>
          <button onClick={fetchSimulatorStatus} disabled={isLoadingStatus} className="text-[#0097fb] hover:text-[#0088e2] disabled:opacity-50">
            <RefreshCcw size={18} className={isLoadingStatus ? "animate-spin" : ""} />
          </button>
        </div>
        {isLoadingStatus ? (
          <div className="text-[#7d7d7d]">Loading status...</div>
        ) : status ? (
          <div className="text-sm text-[#103a5e]">
            <div className="flex items-center gap-2 mb-1">
              Status:
              <span className={`px-2 py-1 text-xs rounded-md ${status.isRunning ? 'bg-[#48c864] text-white' : 'bg-[#e92c2c] text-white'}`}>
                {status.isRunning ? "Running" : "Stopped"}
              </span>
            </div>
            <div>Request Frequency: {(status.requestFrequencyMs / 1000).toFixed(1)} seconds</div>
            <div>Request Expiry: {status.expiryTimeMinutes} minutes</div>
          </div>
        ) : (
          <div className="text-[#e92c2c]">Failed to load simulator status.</div>
        )}
      </div>

      {/* Simulator Controls */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleStartSimulator}
          disabled={status?.isRunning || isStarting}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
            status?.isRunning || isStarting
              ? "bg-[#7d7d7d] text-white cursor-not-allowed"
              : "bg-[#48c864] text-white hover:bg-[#3db854]"
          }`}
        >
          {isStarting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Play size={16} />
          )}
          Start Simulator
        </button>
        <button
          onClick={handleStopSimulator}
          disabled={!status?.isRunning || isStopping}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
            !status?.isRunning || isStopping
              ? "bg-[#7d7d7d] text-white cursor-not-allowed"
              : "bg-[#e92c2c] text-white hover:bg-[#d91e1e]"
          }`}
        >
          {isStopping ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Square size={16} />
          )}
          Stop Simulator
        </button>
      </div>

      {/* Simulator Configuration */}
      <div className="border border-[#d9d9d9] rounded-md p-4 mb-4">
        <h3 className="font-medium text-[#103a5e] mb-3">Simulator Configuration</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-[#103a5e] mb-1">
              Request Frequency (milliseconds)
            </label>
            <input
              type="number"
              min="1000"
              step="1000"
              value={frequency}
              onChange={(e) => setFrequency(Math.max(1000, parseInt(e.target.value) || 1000))}
              className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 text-sm"
            />
            <div className="text-xs text-[#7d7d7d] mt-1">
              {(frequency / 1000).toFixed(1)} seconds between requests
            </div>
          </div>
          <button
            onClick={handleUpdateConfig}
            disabled={isUpdatingConfig}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[#0097fb] text-white hover:bg-[#0088e2] disabled:opacity-50"
          >
            {isUpdatingConfig ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              "Update Configuration"
            )}
          </button>
        </div>
      </div>

      {/* Bulk Generation */}
      <div className="border border-[#d9d9d9] rounded-md p-4">
        <h3 className="font-medium text-[#103a5e] mb-3">Bulk Request Generation</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-[#103a5e] mb-1">
              Number of Requests to Generate
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={bulkCount}
              onChange={(e) => setBulkCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleGenerateBulk}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[#ff8a00] text-white hover:bg-[#e67c00] disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Zap size={16} />
                Generate Requests
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
