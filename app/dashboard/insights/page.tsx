"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import Image from "next/image"

export default function InsightsPage() {
  const [showUserPopup, setShowUserPopup] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [showWarning, setShowWarning] = useState(true)

  const stats = [
    { label: "Monitored", value: "201", color: "bg-[#0097fb]" },
    { label: "Triggered", value: "0", color: "bg-[#e92c2c]" },
    { label: "Registered", value: "0", color: "bg-[#ff8a00]" },
    { label: "Verified", value: "17", color: "bg-[#48c864]" },
    { label: "Acknowledged", value: "0", color: "bg-[#7d7d7d]" },
    { label: "Total Number of Users", value: "1330", color: "bg-[#103a5e]" },
    { label: "Logged in Users", value: "964", color: "bg-[#0097fb]" },
  ]

  // All alerts
  const allAlerts = [
    {
      id: 1,
      type: "Panic Alarm",
      time: "11:51 AM",
      phone: "+923137004002",
      name: "Mehran Jillani",
      action: "Assign",
      color: "border-[#e92c2c]",
    },
    {
      id: 2,
      type: "Manual Alert",
      time: "12:25 PM",
      phone: "03016858040",
      name: "Manually Triggered Alert",
      action: "Assign",
      color: "border-[#0097fb]",
    },
    {
      id: 3,
      type: "No Alert",
      time: "",
      phone: "03445597641",
      name: "",
      action: "Trigger",
      color: "border-[#7d7d7d]",
    },
    {
      id: 4,
      type: "Fire Alert",
      time: "",
      phone: "03004000246",
      name: "",
      action: "Trigger",
      color: "border-[#e92c2c]",
    },
    {
      id: 5,
      type: "No Alert",
      time: "",
      phone: "03465900044",
      name: "",
      action: "",
      color: "border-[#7d7d7d]",
    },
    {
      id: 6,
      type: "No Alert",
      time: "",
      phone: "03001234567",
      name: "",
      action: "",
      color: "border-[#7d7d7d]",
    },
    {
      id: 7,
      type: "No Alert",
      time: "",
      phone: "+923135002315",
      name: "",
      action: "",
      color: "border-[#7d7d7d]",
    },
    {
      id: 8,
      type: "Fire Alert",
      time: "",
      phone: "03004000246",
      name: "",
      action: "Trigger",
      color: "border-[#e92c2c]",
    },
    {
      id: 9,
      type: "Panic Alarm",
      time: "11:51 AM",
      phone: "+923137004002",
      name: "Mehran Jillani",
      action: "Assign",
      color: "border-[#e92c2c]",
    },
  ]

  // Triggered alerts
  const triggeredAlerts = [
    {
      id: 1,
      type: "Panic Alarm",
      time: "11:51 AM",
      phone: "+923137004002",
      name: "Mehran Jillani",
      action: "Assign",
      color: "border-[#e92c2c]",
    },
    {
      id: 2,
      type: "Manual Alert",
      time: "12:25 PM",
      phone: "03016858040",
      name: "Manually Triggered Alert",
      action: "Assign",
      color: "border-[#0097fb]",
    },
    {
      id: 4,
      type: "Fire Alert",
      time: "10:15 AM",
      phone: "03004000246",
      name: "Fire Detection System",
      action: "Assign",
      color: "border-[#e92c2c]",
    },
    {
      id: 8,
      type: "Fire Alert",
      time: "09:30 AM",
      phone: "03004000246",
      name: "Fire Detection System",
      action: "Assign",
      color: "border-[#e92c2c]",
    },
  ]

  // Verified alerts
  const verifiedAlerts = [
    {
      id: 10,
      type: "Intrusion Alert",
      time: "08:45 AM",
      phone: "03001122334",
      name: "Security System",
      action: "Acknowledge",
      color: "border-[#48c864]",
      status: "Verified",
    },
    {
      id: 11,
      type: "Motion Detected",
      time: "09:12 AM",
      phone: "03009988776",
      name: "Outdoor Camera 2",
      action: "Acknowledge",
      color: "border-[#48c864]",
      status: "Verified",
    },
    {
      id: 12,
      type: "Window Breach",
      time: "10:30 AM",
      phone: "03005544332",
      name: "Window Sensor - Kitchen",
      action: "Acknowledge",
      color: "border-[#48c864]",
      status: "Verified",
    },
  ]

  // Acknowledged alerts
  const acknowledgedAlerts = [
    {
      id: 13,
      type: "Intrusion Alert",
      time: "Yesterday, 11:20 PM",
      phone: "03001122334",
      name: "Security System",
      action: "Close",
      color: "border-[#7d7d7d]",
      status: "Acknowledged by John Smith",
    },
    {
      id: 14,
      type: "Smoke Detected",
      time: "Yesterday, 08:15 PM",
      phone: "03009988776",
      name: "Kitchen Smoke Detector",
      action: "Close",
      color: "border-[#7d7d7d]",
      status: "Acknowledged by Sarah Johnson",
    },
  ]

  // Idle alerts
  const idleAlerts = [
    {
      id: 15,
      type: "No Alert",
      time: "",
      phone: "03445597641",
      name: "Main Entrance",
      action: "Trigger",
      color: "border-[#7d7d7d]",
      status: "Idle for 24 hours",
    },
    {
      id: 16,
      type: "No Alert",
      time: "",
      phone: "03465900044",
      name: "Garage Door",
      action: "Trigger",
      color: "border-[#7d7d7d]",
      status: "Idle for 12 hours",
    },
    {
      id: 17,
      type: "No Alert",
      time: "",
      phone: "03001234567",
      name: "Back Door",
      action: "Trigger",
      color: "border-[#7d7d7d]",
      status: "Idle for 36 hours",
    },
    {
      id: 18,
      type: "No Alert",
      time: "",
      phone: "+923135002315",
      name: "Basement",
      action: "Trigger",
      color: "border-[#7d7d7d]",
      status: "Idle for 48 hours",
    },
  ]

  // Get the current alerts based on active tab
  const getCurrentAlerts = () => {
    switch (activeTab) {
      case "triggered":
        return triggeredAlerts
      case "verified":
        return verifiedAlerts
      case "acknowledged":
        return acknowledgedAlerts
      case "idle":
        return idleAlerts
      default:
        return allAlerts
    }
  }

  const currentAlerts = getCurrentAlerts()

  return (
    <div className="flex h-screen w-full bg-[#f4f9fc] overflow-hidden">
      {/* Left Sidebar - This will be in the layout */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - This will be in the layout */}

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className="w-[360px] border-r border-[#d9d9d9] bg-white overflow-y-auto">
            <div className="p-4">
              {/* Search Bar */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search Events (Name, Phone, Name...)"
                  className="w-full border border-[#d9d9d9] rounded-md py-2 px-3 pr-10 text-sm"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7d7d7d]" size={16} />
              </div>

              {/* Show All Checkbox */}
              <div className="flex items-center mb-4">
                <div className="w-4 h-4 rounded-full bg-[#103a5e] mr-2"></div>
                <label className="text-sm">Show All Iylus Gateways</label>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#d9d9d9] mb-4">
                <button
                  className={`py-2 px-4 text-sm ${activeTab === "all" ? "border-b-2 border-[#0097fb] text-[#0097fb] font-medium" : "text-[#7d7d7d]"}`}
                  onClick={() => setActiveTab("all")}
                >
                  All
                </button>
                <button
                  className={`py-2 px-4 text-sm ${activeTab === "triggered" ? "border-b-2 border-[#0097fb] text-[#0097fb] font-medium" : "text-[#7d7d7d]"}`}
                  onClick={() => setActiveTab("triggered")}
                >
                  Triggered
                </button>
                <button
                  className={`py-2 px-4 text-sm ${activeTab === "verified" ? "border-b-2 border-[#0097fb] text-[#0097fb] font-medium" : "text-[#7d7d7d]"}`}
                  onClick={() => setActiveTab("verified")}
                >
                  Verified
                </button>
                <button
                  className={`py-2 px-4 text-sm ${activeTab === "acknowledged" ? "border-b-2 border-[#0097fb] text-[#0097fb] font-medium" : "text-[#7d7d7d]"}`}
                  onClick={() => setActiveTab("acknowledged")}
                >
                  Acknowledged
                </button>
                <button
                  className={`py-2 px-4 text-sm ${activeTab === "idle" ? "border-b-2 border-[#0097fb] text-[#0097fb] font-medium" : "text-[#7d7d7d]"}`}
                  onClick={() => setActiveTab("idle")}
                >
                  Idle
                </button>
              </div>

              {/* Tab Content Header */}
              <div className="mb-4">
                {activeTab === "all" && (
                  <div className="text-sm font-medium text-[#103a5e]">All Alerts ({allAlerts.length})</div>
                )}
                {activeTab === "triggered" && (
                  <div className="text-sm font-medium text-[#e92c2c]">Active Alerts ({triggeredAlerts.length})</div>
                )}
                {activeTab === "verified" && (
                  <div className="text-sm font-medium text-[#48c864]">Verified Alerts ({verifiedAlerts.length})</div>
                )}
                {activeTab === "acknowledged" && (
                  <div className="text-sm font-medium text-[#7d7d7d]">
                    Acknowledged Alerts ({acknowledgedAlerts.length})
                  </div>
                )}
                {activeTab === "idle" && (
                  <div className="text-sm font-medium text-[#7d7d7d]">Idle Devices ({idleAlerts.length})</div>
                )}
              </div>

              {/* Alerts List */}
              <div className="space-y-4">
                {currentAlerts.map((alert) => (
                  <div key={alert.id} className={`border-l-4 ${alert.color} bg-white p-3 rounded-r-md shadow-sm`}>
                    <div className="flex justify-between items-start">
                      <div>
                        {alert.time && <div className="font-medium text-[#103a5e]">{alert.time}</div>}
                        <div className="text-sm text-[#7d7d7d]">Alert: {alert.type}</div>
                        {alert.name && <div className="text-xs text-[#7d7d7d]">{alert.name}</div>}
                        {alert.status && <div className="text-xs text-[#0097fb] mt-1">{alert.status}</div>}
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center mb-2">
                          <div className="w-2 h-2 rounded-full bg-[#48c864] mr-1"></div>
                          <span className="text-xs">{alert.phone}</span>
                        </div>
                        {alert.action && (
                          <button
                            className={`text-xs text-white px-4 py-1 rounded-md ${
                              alert.action === "Assign"
                                ? "bg-[#0097fb]"
                                : alert.action === "Trigger"
                                  ? "bg-[#ff8a00]"
                                  : alert.action === "Acknowledge"
                                    ? "bg-[#48c864]"
                                    : "bg-[#7d7d7d]"
                            }`}
                          >
                            {alert.action}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {currentAlerts.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-[#7d7d7d] text-sm">No alerts found</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map Area */}
          <div className="flex-1 relative">
            {/* Stats Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between bg-[#0097fb] text-white px-4 py-2">
              <div className="text-sm font-medium">Iylus Home overview</div>
              <div className="text-sm font-medium">Iyzil overview</div>
            </div>

            {/* Stats Counters */}
            <div className="absolute top-10 left-0 right-0 z-10 flex justify-between bg-[#0097fb] text-white px-4 py-2">
              {stats.slice(0, 5).map((stat, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-1 ${stat.color === "bg-[#0097fb]" ? "bg-white text-[#0097fb]" : stat.color}`}
                  >
                    {stat.value}
                  </div>
                  <span className="text-xs">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="absolute top-10 right-4 z-10 flex space-x-4 bg-[#0097fb] text-white px-4 py-2">
              {stats.slice(5).map((stat, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-1 ${stat.color === "bg-[#0097fb]" ? "bg-white text-[#0097fb]" : stat.color}`}
                  >
                    {stat.value}
                  </div>
                  <span className="text-xs">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Map */}
            <Image src="/placeholder.svg?height=800&width=1000" alt="Map" fill className="object-cover" />

            {/* Map Markers - These would be dynamically positioned in a real app */}
            <div className="absolute top-1/3 left-1/3">
              <div className="w-8 h-8 rounded-full bg-[#ff8a00] text-white flex items-center justify-center">30</div>
            </div>
            <div className="absolute top-1/4 right-1/4">
              <div className="w-8 h-8 rounded-full bg-[#ff8a00] text-white flex items-center justify-center">38</div>
            </div>
            <div className="absolute top-1/2 left-1/2">
              <div className="w-8 h-8 rounded-full bg-[#0097fb] text-white flex items-center justify-center">81</div>
            </div>
            <div className="absolute bottom-1/3 right-1/3">
              <div className="w-8 h-8 rounded-full bg-[#0097fb] text-white flex items-center justify-center">83</div>
            </div>
            <div className="absolute bottom-1/4 left-1/4">
              <div className="w-8 h-8 rounded-full bg-[#ff8a00] text-white flex items-center justify-center">30</div>
            </div>

            {/* Warning Popup */}
            {showWarning && (
              <div className="absolute bottom-4 right-4 bg-white rounded-md shadow-lg w-80 overflow-hidden">
                <div className="flex items-start p-4">
                  <div className="bg-[#ff8a00] text-white p-2 rounded-md mr-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 9v4M12 17h.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.93 2.929a2 2 0 012.138 0l7.879 5.657a2 2 0 01.874 1.658v8.756a2 2 0 01-2 2H4.18a2 2 0 01-2-2v-8.756a2 2 0 01.874-1.658l7.877-5.657z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-[#ff8a00] font-medium">My Lord, is that legal?</h3>
                      <button onClick={() => setShowWarning(false)}>
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-[#7d7d7d] mt-1">
                      Laiq plo darth bali mon obi-wan dun hausen typho kastolar.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
