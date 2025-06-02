"use client"

import { useEffect, useState, useCallback } from "react"
import { Bot, Play, Square, RefreshCcw, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { useSocket } from "../utils/socket"
import { ReallocationDecision } from "../services/busAllocationAgent"

interface AgentReallocationPanelProps {
  onClose: () => void
}

interface AgentStatus {
  isActive: boolean;
  activeRequests: number;
  pendingManualReviews: number;
  completedToday: number;
  allocationLimitK: number;
  requestExpiryMinutes: number;
  processingThreshold: number;
}

export default function AgentReallocationPanel({ onClose }: AgentReallocationPanelProps) {
  const [status, setStatus] = useState<AgentStatus | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [recentDecisions, setRecentDecisions] = useState<ReallocationDecision[]>([]);
  const [allocationK, setAllocationK] = useState<number>(1);
  const [expiryMinutes, setExpiryMinutes] = useState<number>(30);
  const [processingThreshold, setProcessingThreshold] = useState<number>(5);
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);

  const fetchAgentStatus = useCallback(async () => {
    setIsLoadingStatus(true)
    try {
      const res = await fetch("/api/reallocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_status" }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus(data.status)
      } else {
        console.error("Failed to fetch agent status:", data.error)
        setStatus(null)
      }
    } catch (error) {
      console.error("Error fetching agent status:", error)
      setStatus(null)
    } finally {
      setIsLoadingStatus(false)
    }
  }, [])

  const fetchRecentDecisions = useCallback(async () => {
    try {
      const res = await fetch("/api/reallocation?type=decisions", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        // Limit to a few recent decisions for the panel
        setRecentDecisions(data.decisions.slice(0, 5));
      } else {
        console.error("Failed to fetch recent decisions:", data.error);
      }
    } catch (error) {
      console.error("Error fetching recent decisions:", error);
    }
  }, []);


  useEffect(() => {
    fetchAgentStatus()
    fetchRecentDecisions();
    const interval = setInterval(fetchAgentStatus, 10000); // Refresh status every 10 seconds
    return () => clearInterval(interval);
  }, [fetchAgentStatus, fetchRecentDecisions])
  
  // Update local state when status is fetched
  useEffect(() => {
    if (status) {
      setAllocationK(status.allocationLimitK);
      setExpiryMinutes(status.requestExpiryMinutes);
      setProcessingThreshold(status.processingThreshold);
    }
  }, [status]);

  // Listen for agent status updates via socket
  useSocket("agent_status_update", (status: AgentStatus) => {
    setStatus(status);
  });

  // Listen for allocation history updates via socket to refresh recent decisions
  useSocket("allocation_history_update", fetchRecentDecisions);

  const handleStartAutonomous = async () => {
    setIsStarting(true)
    try {
      const res = await fetch("/api/reallocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start_autonomous" }),
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message)
        fetchAgentStatus() // Refresh status after action
      } else {
        alert(`Failed to start agent: ${data.error}`)
      }
    } catch (error) {
      console.error("Error starting agent:", error)
      alert("An error occurred while trying to start the agent.")
    } finally {
      setIsStarting(false)
    }
  }

  const handleStopAutonomous = async () => {
    setIsStopping(true)
    try {
      const res = await fetch("/api/reallocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop_autonomous" }),
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message)
        fetchAgentStatus() // Refresh status after action
      } else {
        alert(`Failed to stop agent: ${data.error}`)
      }
    } catch (error) {
      console.error("Error stopping agent:", error)
      alert("An error occurred while trying to stop the agent.")
    } finally {
      setIsStopping(false)
    }
  }

  const handleSimulateRequest = async () => {
    try {
      const res = await fetch("/api/reallocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate_request" }),
      });
      const data = await res.json();
      if (data.success) {
        console.log("Simulated request added:", data.requestId);
        // Optionally show a toast notification
      } else {
        console.error("Failed to simulate request:", data.error);
        alert(`Failed to simulate request: ${data.error}`);
      }
    } catch (error) {
      console.error("Error simulating request:", error);
      alert("An error occurred while trying to simulate a request.");
    }
  };
  
  const handleUpdateConfiguration = async () => {
    setIsUpdatingConfig(true);
    try {
      const res = await fetch("/api/reallocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "update_configuration",
          config: {
            allocationLimitK: allocationK,
            requestExpiryMinutes: expiryMinutes,
            processingThreshold: processingThreshold
          }
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Configuration updated successfully");
        fetchAgentStatus(); // Refresh status to confirm changes
      } else {
        console.error("Failed to update configuration:", data.error);
        alert(`Failed to update configuration: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating configuration:", error);
      alert("An error occurred while trying to update the configuration.");
    } finally {
      setIsUpdatingConfig(false);
    }
  };


  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Bot className="text-[#0097fb]" size={24} />
          <h2 className="text-lg font-medium text-[#103a5e]">Agent Control & Monitoring</h2>
        </div>
        {/* <button onClick={onClose} className="text-[#7d7d7d] hover:text-[#103a5e]">
          <X size={20} />
        </button> */}
      </div>

      {/* Agent Status */}
      <div className="border border-[#d9d9d9] rounded-md p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-[#103a5e]">Agent Status</h3>
          <button onClick={fetchAgentStatus} disabled={isLoadingStatus} className="text-[#0097fb] hover:text-[#0088e2] disabled:opacity-50">
            <RefreshCcw size={18} className={isLoadingStatus ? "animate-spin" : ""} />
          </button>
        </div>
        {isLoadingStatus ? (
          <div className="text-[#7d7d7d]">Loading status...</div>
        ) : status ? (
          <div className="text-sm text-[#103a5e]">
            <div className="flex items-center gap-2 mb-1">
              Status:
              <span className={`px-2 py-1 text-xs rounded-md ${status.isActive ? 'bg-[#48c864] text-white' : 'bg-[#e92c2c] text-white'}`}>
                {status.isActive ? "Active (Autonomous)" : "Inactive"}
              </span>
            </div>
            <div>Active Requests: {status.activeRequests}</div>
            <div>Pending Manual Reviews: {status.pendingManualReviews}</div> {/* Corrected property name */}
            <div>Completed Today: {status.completedToday}</div>
          </div>
        ) : (
          <div className="text-[#e92c2c]">Failed to load agent status.</div>
        )}
      </div>

      {/* Agent Controls */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleStartAutonomous}
          disabled={status?.isActive || isStarting}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
            status?.isActive || isStarting
              ? "bg-[#7d7d7d] text-white cursor-not-allowed"
              : "bg-[#48c864] text-white hover:bg-[#3db854]"
          }`}
        >
          {isStarting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Play size={16} />
          )}
          Start Agent
        </button>
        <button
          onClick={handleStopAutonomous}
          disabled={!status?.isActive || isStopping}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
            !status?.isActive || isStopping
              ? "bg-[#7d7d7d] text-white cursor-not-allowed"
              : "bg-[#e92c2c] text-white hover:bg-[#d91e1e]"
          }`}
        >
          {isStopping ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Square size={16} />
          )}
          Stop Agent
        </button>
      </div>

      {/* Agent Configuration */}
      <div className="border border-[#d9d9d9] rounded-md p-4 mb-4">
        <h3 className="font-medium text-[#103a5e] mb-3">Agent Configuration</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-[#103a5e] mb-1">
              Allocation Limit (K) - Max buses to allocate per fermata group
            </label>
            <input
              type="number"
              min="1"
              value={allocationK}
              onChange={(e) => setAllocationK(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-[#103a5e] mb-1">
              Request Expiry Time (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-[#103a5e] mb-1">
              Processing Threshold - Min requests before processing
            </label>
            <input
              type="number"
              min="1"
              value={processingThreshold}
              onChange={(e) => setProcessingThreshold(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 text-sm"
            />
            <div className="text-xs text-[#7d7d7d] mt-1">
              Lower values will process requests more frequently
            </div>
          </div>
          <button
            onClick={handleUpdateConfiguration}
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

      {/* Manual Simulation */}
      <div className="border border-[#d9d9d9] rounded-md p-4 mb-4">
        <h3 className="font-medium text-[#103a5e] mb-3">Manual Request Simulation</h3>
        <button
          onClick={handleSimulateRequest}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[#0097fb] text-white hover:bg-[#0088e2]"
        >
          <Bot size={16} /> Simulate New Request
        </button>
      </div>

      {/* Recent Agent Actions/Decisions */}
      <div className="border border-[#d9d9d9] rounded-md p-4">
        <h3 className="font-medium text-[#103a5e] mb-3">Recent Agent Actions</h3>
        {recentDecisions.length === 0 ? (
          <div className="text-[#7d7d7d]">No recent actions by the agent.</div>
        ) : (
          <ul className="space-y-2">
            {recentDecisions.map(decision => (
              <li key={decision.id} className="bg-[#f9f9f9] p-3 rounded-md text-sm">
                <div className="flex items-center gap-2 mb-1">
                  {decision.status === 'auto_approved' ? (
                    <CheckCircle className="text-[#48c864]" size={16} />
                  ) : decision.status === 'manual_review' ? (
                    <AlertTriangle className="text-[#ff8a00]" size={16} />
                  ) : (
                    <Clock className="text-[#7d7d7d]" size={16} />
                  )}
                  <span className="font-medium">{decision.id}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-md ${
                    decision.status === 'auto_approved' ? 'bg-[#48c864] text-white' : 
                    decision.status === 'manual_review' ? 'bg-[#ff8a00] text-white' :
                    'bg-[#7d7d7d] text-white'
                  }`}>
                    {decision.status === 'auto_approved' ? 'Auto Approved' : 
                     decision.status === 'manual_review' ? 'Manual Review' :
                     decision.status}
                  </span>
                </div>
                <div className="text-xs text-[#7d7d7d] mb-1">
                  {new Date(decision.timestamp).toLocaleString()}
                </div>
                <div className="text-xs text-[#103a5e]">
                  Reasoning: {decision.agentDecision?.reasoning || 'N/A'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
