"use client"

import { useState } from "react"
import { Calendar, ChevronDown, Download, Filter } from "lucide-react"
import EventChart from "../../../components/event-chart"
import EventDistribution from "../../../components/event-distribution"
import LocationHeatmap from "../../../components/location-heatmap"

export default function AnalysisPage() {
  const [dateFilter, setDateFilter] = useState("Last 30 days")
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for charts
  const generateChartData = () => {
    const data = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

      // Generate random data with some patterns
      const triggered = Math.floor(Math.random() * 50) + (i % 7 === 0 ? 100 : 0)
      const verified = Math.floor(Math.random() * 10) + (i % 10 === 0 ? 20 : 0)
      const acknowledged = Math.floor(Math.random() * 5) + (i % 15 === 0 ? 10 : 0)

      data.push({
        date: dateStr,
        triggered,
        verified,
        acknowledged,
      })
    }
    return data
  }

  const chartData = generateChartData()

  const eventDistributionData = [
    { type: "Panic Alarm", count: 156, color: "#ff8a00" },
    { type: "Fire Alarm", count: 89, color: "#e92c2c" },
    { type: "Intrusion", count: 124, color: "#0097fb" },
    { type: "System Check", count: 67, color: "#48c864" },
    { type: "Maintenance", count: 43, color: "#7d7d7d" },
  ]

  const locationData = [
    { id: "1", latitude: 9.0092, longitude: 38.7645, count: 87, name: "Bole Road, Addis Ababa" },
    { id: "2", latitude: 9.0192, longitude: 38.7545, count: 65, name: "Meskel Square, Addis Ababa" },
    { id: "3", latitude: 8.9992, longitude: 38.7745, count: 42, name: "Mexico Square, Addis Ababa" },
    { id: "4", latitude: 9.0072, longitude: 38.7565, count: 31, name: "Piazza, Addis Ababa" },
    { id: "5", latitude: 9.0052, longitude: 38.7535, count: 94, name: "Merkato, Addis Ababa" },
    { id: "6", latitude: 9.0152, longitude: 38.7635, count: 23, name: "Kazanchis, Addis Ababa" },
    { id: "7", latitude: 9.0252, longitude: 38.7735, count: 56, name: "CMC, Addis Ababa" },
    { id: "8", latitude: 9.0352, longitude: 38.7835, count: 38, name: "Ayat, Addis Ababa" },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-[#f4f9fc]">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium text-[#103a5e]">Analysis</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                className="flex items-center gap-2 bg-white border border-[#d9d9d9] rounded-md px-4 py-2 text-sm"
                onClick={() => setShowDateDropdown(!showDateDropdown)}
              >
                <Calendar size={16} />
                <span>{dateFilter}</span>
                <ChevronDown size={16} className={`transition-transform ${showDateDropdown ? "rotate-180" : ""}`} />
              </button>
              {showDateDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {[
                      "Today",
                      "Yesterday",
                      "Last 7 days",
                      "Last 30 days",
                      "This month",
                      "Last month",
                      "Custom range",
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
              )}
            </div>
            <button className="flex items-center gap-2 bg-white border border-[#d9d9d9] rounded-md px-4 py-2 text-sm">
              <Filter size={16} />
              <span>Filters</span>
            </button>
            <button className="flex items-center gap-2 bg-[#0097fb] text-white rounded-md px-4 py-2 text-sm">
              <Download size={16} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#d9d9d9] mb-6">
          <button
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === "overview" ? "border-b-2 border-[#0097fb] text-[#0097fb]" : "text-[#7d7d7d]"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === "events" ? "border-b-2 border-[#0097fb] text-[#0097fb]" : "text-[#7d7d7d]"
            }`}
            onClick={() => setActiveTab("events")}
          >
            Events
          </button>
          <button
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === "users" ? "border-b-2 border-[#0097fb] text-[#0097fb]" : "text-[#7d7d7d]"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === "locations" ? "border-b-2 border-[#0097fb] text-[#0097fb]" : "text-[#7d7d7d]"
            }`}
            onClick={() => setActiveTab("locations")}
          >
            Locations
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-md shadow-sm p-4">
            <div className="text-sm text-[#7d7d7d] mb-1">Total Events</div>
            <div className="text-2xl font-bold text-[#103a5e]">479</div>
            <div className="text-xs text-[#48c864] mt-1 flex items-center">
              <span className="mr-1">↑</span> 12% from last period
            </div>
          </div>
          <div className="bg-white rounded-md shadow-sm p-4">
            <div className="text-sm text-[#7d7d7d] mb-1">Panic Alarms</div>
            <div className="text-2xl font-bold text-[#ff8a00]">156</div>
            <div className="text-xs text-[#e92c2c] mt-1 flex items-center">
              <span className="mr-1">↑</span> 24% from last period
            </div>
          </div>
          <div className="bg-white rounded-md shadow-sm p-4">
            <div className="text-sm text-[#7d7d7d] mb-1">Response Time</div>
            <div className="text-2xl font-bold text-[#0097fb]">3.2 min</div>
            <div className="text-xs text-[#48c864] mt-1 flex items-center">
              <span className="mr-1">↓</span> 8% from last period
            </div>
          </div>
          <div className="bg-white rounded-md shadow-sm p-4">
            <div className="text-sm text-[#7d7d7d] mb-1">Active Users</div>
            <div className="text-2xl font-bold text-[#48c864]">964</div>
            <div className="text-xs text-[#48c864] mt-1 flex items-center">
              <span className="mr-1">↑</span> 5% from last period
            </div>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === "overview" && (
          <>
            <EventChart data={chartData} title="Event Trends" timeRange={dateFilter} />
            <div className="grid grid-cols-2 gap-6">
              <EventDistribution data={eventDistributionData} title="Event Distribution" />
              <LocationHeatmap data={locationData} title="Event Locations" />
            </div>
          </>
        )}

        {activeTab === "events" && (
          <>
            <EventChart data={chartData} title="Event Trends" timeRange={dateFilter} />
            <EventDistribution data={eventDistributionData} title="Event Distribution" />
          </>
        )}

        {activeTab === "users" && (
          <>
            <div className="bg-white rounded-md shadow-sm p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-[#103a5e]">User Activity</h2>
                <button className="flex items-center gap-1 text-[#0097fb] text-sm">
                  <Download size={16} />
                  Download
                </button>
              </div>
              <div className="h-[400px] flex items-center justify-center text-[#7d7d7d]">
                User activity chart would be displayed here
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-md shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-[#103a5e]">User Demographics</h2>
                  <button className="flex items-center gap-1 text-[#0097fb] text-sm">
                    <Download size={16} />
                    Download
                  </button>
                </div>
                <div className="h-[300px] flex items-center justify-center text-[#7d7d7d]">
                  User demographics chart would be displayed here
                </div>
              </div>
              <div className="bg-white rounded-md shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-[#103a5e]">User Engagement</h2>
                  <button className="flex items-center gap-1 text-[#0097fb] text-sm">
                    <Download size={16} />
                    Download
                  </button>
                </div>
                <div className="h-[300px] flex items-center justify-center text-[#7d7d7d]">
                  User engagement chart would be displayed here
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "locations" && (
          <>
            <LocationHeatmap data={locationData} title="Event Locations" />
            <div className="bg-white rounded-md shadow-sm p-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-[#103a5e]">Location Analysis</h2>
                <button className="flex items-center gap-1 text-[#0097fb] text-sm">
                  <Download size={16} />
                  Download
                </button>
              </div>
              <div className="h-[300px] flex items-center justify-center text-[#7d7d7d]">
                Location analysis chart would be displayed here
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
