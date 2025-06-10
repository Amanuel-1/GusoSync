"use client"

import { useState, useEffect } from "react"
import { 
  AlertTriangle, 
  Users, 
  Activity, 
  Route, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Download,
  Calendar,
  ChevronDown
} from "lucide-react"
import { showToast } from "@/lib/toast"
import LineChart from "@/components/analytics/LineChart"
import BarChart from "@/components/analytics/BarChart"
import PieChart from "@/components/analytics/PieChart"
import AreaChart from "@/components/analytics/AreaChart"
import MetricCard from "@/components/analytics/MetricCard"
import GaugeChart from "@/components/analytics/GaugeChart"

interface AnalyticsData {
  incidents: any;
  personnel: any;
  systemPerformance: any;
  routesReallocated: any;
  passengers: any;
  tickets: any;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [dateFilter, setDateFilter] = useState("Last 30 days")
  const [showDateDropdown, setShowDateDropdown] = useState(false)

  // Map date filter labels to days
  const dateFilterMap: Record<string, number> = {
    "Last 7 days": 7,
    "Last 30 days": 30,
    "Last 90 days": 90,
    "Last year": 365,
  }

  const currentDays = dateFilterMap[dateFilter] || 30

  // Function to filter data based on date range
  const filterDataByDateRange = (rawData: any) => {
    if (!rawData) return rawData

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - currentDays)



    // Filter incidents data
    if (rawData.incidents && rawData.incidents.trendData) {
      // Filter the existing trend data based on date range
      const filteredTrendData = rawData.incidents.trendData.filter((item: any) => {
        const itemDate = new Date(item.date)
        return itemDate >= startDate
      })

      // Recalculate summary from filtered trend data
      const totalFromTrend = filteredTrendData.reduce((sum: number, day: any) => sum + (day.count || 0), 0)
      const resolvedFromTrend = filteredTrendData.reduce((sum: number, day: any) => sum + (day.resolved || 0), 0)
      const pendingFromTrend = filteredTrendData.reduce((sum: number, day: any) => sum + (day.pending || 0), 0)

      rawData.incidents = {
        ...rawData.incidents,
        summary: {
          ...rawData.incidents.summary,
          total: totalFromTrend,
          resolved: resolvedFromTrend,
          pending: pendingFromTrend,
          resolutionRate: totalFromTrend > 0 ? Math.round((resolvedFromTrend / totalFromTrend) * 100) : 0,
        },
        trendData: filteredTrendData
      }
    }

    // Filter passengers data
    if (rawData.passengers && rawData.passengers.registrationTrend) {
      // Filter the existing registration trend data
      const filteredTrendData = rawData.passengers.registrationTrend.filter((item: any) => {
        const itemDate = new Date(item.date)
        return itemDate >= startDate
      })

      // Recalculate recent registrations from filtered trend data
      const recentRegistrations = filteredTrendData.reduce((sum: number, day: any) => sum + (day.registrations || 0), 0)

      rawData.passengers = {
        ...rawData.passengers,
        registrationTrend: filteredTrendData,
        summary: {
          ...rawData.passengers.summary,
          recentRegistrations,
          growthRate: rawData.passengers.summary.total > 0 ? Math.round((recentRegistrations / rawData.passengers.summary.total) * 100) : 0,
        }
      }
    }

    // Filter tickets data
    if (rawData.tickets && rawData.tickets.salesTrend) {
      // Filter the existing sales trend data
      const filteredTrendData = rawData.tickets.salesTrend.filter((item: any) => {
        const itemDate = new Date(item.date)
        return itemDate >= startDate
      })

      // Recalculate totals from filtered trend data
      const totalTickets = filteredTrendData.reduce((sum: number, day: any) => sum + (day.tickets || 0), 0)
      const totalRevenue = filteredTrendData.reduce((sum: number, day: any) => sum + (day.revenue || 0), 0)
      const usedTickets = filteredTrendData.reduce((sum: number, day: any) => sum + (day.used || 0), 0)

      rawData.tickets = {
        ...rawData.tickets,
        salesTrend: filteredTrendData,
        summary: {
          ...rawData.tickets.summary,
          total: totalTickets,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          used: usedTickets,
          usageRate: totalTickets > 0 ? Math.round((usedTickets / totalTickets) * 100) : 0,
        }
      }
    }

    // Filter routes reallocated data
    if (rawData.routesReallocated && rawData.routesReallocated.trendData) {
      // Filter the existing trend data
      const filteredTrendData = rawData.routesReallocated.trendData.filter((item: any) => {
        const itemDate = new Date(item.date)
        return itemDate >= startDate
      })

      // Recalculate totals from filtered trend data
      const totalRequests = filteredTrendData.reduce((sum: number, day: any) => sum + (day.total || 0), 0)
      const completedRequests = filteredTrendData.reduce((sum: number, day: any) => sum + (day.completed || 0), 0)
      const pendingRequests = filteredTrendData.reduce((sum: number, day: any) => sum + (day.pending || 0), 0)
      const approvedRequests = filteredTrendData.reduce((sum: number, day: any) => sum + (day.approved || 0), 0)

      rawData.routesReallocated = {
        ...rawData.routesReallocated,
        trendData: filteredTrendData,
        summary: {
          ...rawData.routesReallocated.summary,
          total: totalRequests,
          completed: completedRequests,
          pending: pendingRequests,
          approved: approvedRequests,
          successRate: totalRequests > 0 ? Math.round(((completedRequests + approvedRequests) / totalRequests) * 100) : 0,
        }
      }
    }

    return rawData
  }

  const fetchAnalyticsData = async () => {
    try {
      setRefreshing(true)

      const [incidentsRes, personnelRes, systemRes, routesRes, passengersRes, ticketsRes] = await Promise.all([
        fetch('/dashboard/api/analytics/incidents'),
        fetch('/dashboard/api/analytics/personnel'),
        fetch('/dashboard/api/analytics/system-performance'),
        fetch('/dashboard/api/analytics/routes-reallocated'),
        fetch('/dashboard/api/analytics/passengers'),
        fetch('/dashboard/api/analytics/tickets'),
      ])

      const [incidents, personnel, systemPerformance, routesReallocated, passengers, tickets] = await Promise.all([
        incidentsRes.json(),
        personnelRes.json(),
        systemRes.json(),
        routesRes.json(),
        passengersRes.json(),
        ticketsRes.json(),
      ])

      if (!incidentsRes.ok || !personnelRes.ok || !systemRes.ok || !routesRes.ok || !passengersRes.ok || !ticketsRes.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const rawData = {
        incidents: incidents.data,
        personnel: personnel.data,
        systemPerformance: systemPerformance.data,
        routesReallocated: routesReallocated.data,
        passengers: passengers.data,
        tickets: tickets.data,
      }

      // Apply date filtering locally
      const filteredData = filterDataByDateRange(rawData)
      setData(filteredData)
      
      setError(null)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
      showToast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [currentDays]) // Refetch when date filter changes

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Analytics</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 bg-[#f4f9fc] overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#103a5e]">Analytics Dashboard</h1>
          <p className="text-[#7d7d7d] mt-1">
            Comprehensive data insights and analysis for GusoSync transportation system
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
              {dateFilter}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Date Filter */}
          <div className="relative">
            <button
              className="flex items-center gap-2 bg-white border border-[#d9d9d9] rounded-md px-4 py-2 text-sm"
              onClick={() => setShowDateDropdown(!showDateDropdown)}
            >
              <Calendar size={16} />
              {dateFilter}
              <ChevronDown size={16} />
            </button>
            
            {showDateDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#d9d9d9] rounded-md shadow-lg z-10">
                {["Last 7 days", "Last 30 days", "Last 90 days", "Last year"].map((option) => (
                  <button
                    key={option}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      dateFilter === option ? 'bg-blue-50 text-blue-600 font-medium' : ''
                    }`}
                    onClick={() => {
                      setDateFilter(option)
                      setShowDateDropdown(false)
                      setLoading(true) // Show loading while fetching new data
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchAnalyticsData}
            disabled={refreshing}
            className="flex items-center gap-2 bg-[#0097fb] text-white px-4 py-2 rounded-md hover:bg-[#0086e0] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          {/* Export Button */}
          <button className="flex items-center gap-2 bg-white border border-[#d9d9d9] text-[#103a5e] px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Incidents"
          value={data?.incidents?.summary?.total || 0}
          subtitle={`${data?.incidents?.summary?.resolved || 0} resolved • ${data?.incidents?.summary?.pending || 0} pending`}
          trend={{
            value: data?.incidents?.summary?.resolutionRate || 0,
            isPositive: (data?.incidents?.summary?.resolutionRate || 0) >= 80,
            label: "Resolution Rate"
          }}
          icon={<AlertTriangle />}
          color="text-red-600"
          bgColor="bg-red-100"
        />

        <MetricCard
          title="Total Personnel"
          value={data?.personnel?.summary?.total || 0}
          subtitle={`${data?.personnel?.summary?.active || 0} active • ${data?.personnel?.summary?.inactive || 0} inactive`}
          trend={{
            value: data?.personnel?.summary?.attendanceRate || 0,
            isPositive: true,
            label: "Attendance Today"
          }}
          icon={<Users />}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />

        <MetricCard
          title="System Health"
          value={`${data?.systemPerformance?.systemHealth?.overall || 0}%`}
          subtitle={`${data?.systemPerformance?.summary?.activeBuses || 0} active buses • ${data?.systemPerformance?.summary?.activeRoutes || 0} active routes`}
          trend={{
            value: data?.systemPerformance?.summary?.busUtilizationRate || 0,
            isPositive: true,
            label: "Bus Utilization"
          }}
          icon={<Activity />}
          color="text-green-600"
          bgColor="bg-green-100"
        />

        <MetricCard
          title="Total Passengers"
          value={data?.passengers?.summary?.total || 0}
          subtitle={`${data?.passengers?.summary?.active || 0} active • ${data?.passengers?.summary?.recentRegistrations || 0} new this month`}
          trend={{
            value: data?.passengers?.summary?.verificationRate || 0,
            isPositive: true,
            label: "Verified"
          }}
          icon={<Users />}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      {/* Secondary Metrics with Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* <MetricCard
          title="Tickets Sold"
          value={data?.tickets?.summary?.total || 0}
          subtitle={`ETB ${data?.tickets?.summary?.totalRevenue || 0} • ${data?.tickets?.summary?.used || 0} used`}
          trend={{
            value: data?.tickets?.summary?.usageRate || 0,
            isPositive: true,
            label: "Usage Rate"
          }}
          icon={<TrendingUp />}
          color="text-green-600"
          bgColor="bg-green-100"
        />

        <MetricCard
          title="Reallocations"
          value={data?.routesReallocated?.summary?.total || 0}
          subtitle={`${data?.routesReallocated?.summary?.completed || 0} completed • ${data?.routesReallocated?.summary?.pending || 0} pending`}
          trend={{
            value: data?.routesReallocated?.summary?.successRate || 0,
            isPositive: true,
            label: "Success Rate"
          }}
          icon={<Route />}
          color="text-orange-600"
          bgColor="bg-orange-100"
        /> */}

        <GaugeChart
          value={data?.systemPerformance?.summary?.busUtilizationRate || 0}
          title="Bus Utilization"
          label="Utilization Rate"
          color="#3b82f6"
          height={100}
        />

        {/* <GaugeChart
          value={data?.personnel?.summary?.attendanceRate || 0}
          title="Attendance Rate"
          label="Today's Attendance"
          color="#10b981"
          height={180}
        /> */}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Incidents Trend Chart */}
        {data?.incidents?.trendData && (
          <LineChart
            data={data.incidents.trendData}
            title={`Incidents Trend (${dateFilter})`}
            lines={[
              { key: 'count', label: 'Total Incidents', color: '#ef4444' },
              { key: 'resolved', label: 'Resolved', color: '#22c55e' },
              { key: 'pending', label: 'Pending', color: '#f59e0b' },
            ]}
            height={300}
            yAxisLabel="Number of Incidents"
          />
        )}

        {/* System Performance Chart */}
        {data?.systemPerformance?.performanceData && (
          <AreaChart
            data={data.systemPerformance.performanceData}
            title="System Performance Metrics"
            areas={[
              { key: 'busUtilization', label: 'Bus Utilization (%)', color: '#3b82f6', fillColor: '#3b82f620' },
              { key: 'routeEfficiency', label: 'Route Efficiency (%)', color: '#10b981', fillColor: '#10b98120' },
              { key: 'systemUptime', label: 'System Uptime (%)', color: '#8b5cf6', fillColor: '#8b5cf620' },
            ]}
            height={300}
            yAxisLabel="Percentage (%)"
          />
        )}
      </div>

      {/* More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Incidents by Status Pie Chart */}
        {data?.incidents?.byStatus && (
          <PieChart
            data={{
              labels: Object.keys(data.incidents.byStatus).map(status =>
                status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
              ),
              datasets: [{
                data: Object.values(data.incidents.byStatus) as number[],
                backgroundColor: [
                  '#22c55e', // resolved - green
                  '#f59e0b', // pending - yellow
                  '#3b82f6', // in_progress - blue
                  '#ef4444', // other - red
                ],
                borderColor: ['#fff', '#fff', '#fff', '#fff'],
                borderWidth: 2,
              }]
            }}
            title="Incidents by Status"
            height={300}
            isDoughnut={true}
          />
        )}

        {/* Personnel by Role Bar Chart */}
        {data?.personnel?.roleBreakdown && (
          <BarChart
            data={{
              labels: data.personnel.roleBreakdown.map((role: any) => role.role),
              datasets: [{
                label: 'Personnel Count',
                data: data.personnel.roleBreakdown.map((role: any) => role.count),
                backgroundColor: data.personnel.roleBreakdown.map((role: any) => role.color),
                borderColor: data.personnel.roleBreakdown.map((role: any) => role.color),
                borderWidth: 1,
              }]
            }}
            title="Personnel Distribution by Role"
            height={300}
            yAxisLabel="Number of Personnel"
          />
        )}
      </div>

      {/* Revenue and Passenger Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Ticket Sales Trend */}
        {data?.tickets?.salesTrend && (
          <AreaChart
            data={data.tickets.salesTrend}
            title={`Ticket Sales & Revenue Trend (${dateFilter})`}
            areas={[
              { key: 'tickets', label: 'Tickets Sold', color: '#3b82f6', fillColor: '#3b82f630' },
              { key: 'revenue', label: 'Revenue (ETB)', color: '#10b981', fillColor: '#10b98130' },
            ]}
            height={300}
            yAxisLabel="Count / Revenue"
          />
        )}

        {/* Passenger Registration Trend */}
        {data?.passengers?.registrationTrend && (
          <LineChart
            data={data.passengers.registrationTrend}
            title={`Passenger Registration Trend (${dateFilter})`}
            lines={[
              { key: 'registrations', label: 'New Registrations', color: '#8b5cf6' },
              { key: 'active', label: 'Active Users', color: '#06b6d4' },
            ]}
            height={300}
            yAxisLabel="Number of Passengers"
          />
        )}
      </div>

      {/* Route Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Route Reallocation Trend */}
        {data?.routesReallocated?.trendData && (
          <AreaChart
            data={data.routesReallocated.trendData}
            title={`Route Reallocation Requests (${dateFilter})`}
            areas={[
              { key: 'total', label: 'Total Requests', color: '#f59e0b', fillColor: '#f59e0b30' },
              { key: 'completed', label: 'Completed', color: '#22c55e', fillColor: '#22c55e30' },
              { key: 'pending', label: 'Pending', color: '#ef4444', fillColor: '#ef444430' },
            ]}
            height={300}
            yAxisLabel="Number of Requests"
            stacked={true}
          />
        )}

        {/* Incidents by Source */}
        {data?.incidents?.bySource && (
          <BarChart
            data={{
              labels: Object.keys(data.incidents.bySource).map(source =>
                source.charAt(0).toUpperCase() + source.slice(1) + ' Incidents'
              ),
              datasets: [{
                label: 'Incident Count',
                data: Object.values(data.incidents.bySource) as number[],
                backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4'],
                borderColor: ['#3b82f6', '#8b5cf6', '#06b6d4'],
                borderWidth: 1,
              }]
            }}
            title="Incidents by Source"
            height={300}
            yAxisLabel="Number of Incidents"
          />
        )}
      </div>

      {/* Additional Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Route Performance by Revenue */}
        {data?.tickets?.routePerformance && (
          <BarChart
            data={{
              labels: Object.keys(data.tickets.routePerformance).slice(0, 8), // Top 8 routes
              datasets: [{
                label: 'Revenue (ETB)',
                data: Object.values(data.tickets.routePerformance).slice(0, 8).map((route: any) => route.revenue),
                backgroundColor: '#10b981',
                borderColor: '#10b981',
                borderWidth: 1,
              }, {
                label: 'Tickets Sold',
                data: Object.values(data.tickets.routePerformance).slice(0, 8).map((route: any) => route.total),
                backgroundColor: '#3b82f6',
                borderColor: '#3b82f6',
                borderWidth: 1,
              }]
            }}
            title="Route Performance (Top Routes)"
            height={300}
            yAxisLabel="Revenue / Tickets"
          />
        )}

        {/* Ticket Status Distribution */}
        {data?.tickets?.byStatus && (
          <PieChart
            data={{
              labels: Object.keys(data.tickets.byStatus).map(status =>
                status.charAt(0).toUpperCase() + status.slice(1)
              ),
              datasets: [{
                data: Object.values(data.tickets.byStatus) as number[],
                backgroundColor: [
                  '#3b82f6', // active - blue
                  '#22c55e', // used - green
                  '#6b7280', // expired - gray
                  '#ef4444', // cancelled - red
                ],
                borderColor: ['#fff', '#fff', '#fff', '#fff'],
                borderWidth: 2,
              }]
            }}
            title="Ticket Status Distribution"
            height={300}
          />
        )}
      </div>

      {/* System Health Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GaugeChart
          value={data?.systemPerformance?.systemHealth?.busFleet || 0}
          title="Bus Fleet Health"
          label="Fleet Status"
          color="#3b82f6"
          height={200}
        />

        <GaugeChart
          value={data?.systemPerformance?.systemHealth?.routeNetwork || 0}
          title="Route Network"
          label="Network Efficiency"
          color="#10b981"
          height={200}
        />

        <GaugeChart
          value={data?.systemPerformance?.systemHealth?.uptime || 0}
          title="System Uptime"
          label="Availability"
          color="#8b5cf6"
          height={200}
        />
      </div>

      {/* Detailed Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Incidents Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#103a5e]">Incidents Overview</h3>
            <button className="text-[#0097fb] text-sm hover:underline">View Details</button>
          </div>

          {/* Incidents by Status */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#7d7d7d] mb-3">By Status</h4>
            <div className="space-y-2">
              {Object.entries(data?.incidents?.byStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'resolved' ? 'bg-green-500' :
                      status === 'pending' ? 'bg-yellow-500' :
                      status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                  </div>
                  <span className="text-sm font-medium">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Incidents by Source */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#7d7d7d] mb-3">By Source</h4>
            <div className="space-y-2">
              {Object.entries(data?.incidents?.bySource || {}).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      source === 'driver' ? 'bg-blue-500' :
                      source === 'general' ? 'bg-purple-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm capitalize">{source} incidents</span>
                  </div>
                  <span className="text-sm font-medium">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Incidents */}
          <div>
            <h4 className="text-sm font-medium text-[#7d7d7d] mb-3">Recent Incidents</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {data?.incidents?.recentIncidents?.slice(0, 5).map((incident: any, index: number) => (
                <div key={incident.id || index} className="flex items-center justify-between py-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#103a5e] truncate">{incident.title || incident.description || 'Incident'}</p>
                    <p className="text-xs text-[#7d7d7d]">{incident.type || 'General'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    incident.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    incident.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {incident.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personnel Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#103a5e]">Personnel Overview</h3>
            <button className="text-[#0097fb] text-sm hover:underline">View Details</button>
          </div>

          {/* Personnel by Role */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#7d7d7d] mb-3">By Role</h4>
            <div className="space-y-2">
              {data?.personnel?.roleBreakdown?.map((role: any) => (
                <div key={role.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }}></div>
                    <span className="text-sm">{role.role}</span>
                  </div>
                  <span className="text-sm font-medium">{role.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Summary */}
          <div>
            <h4 className="text-sm font-medium text-[#7d7d7d] mb-3">Today's Attendance</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#7d7d7d]">Present</span>
                <span className="text-sm font-medium text-green-600">
                  {data?.personnel?.summary?.attendanceToday || 0} / {data?.personnel?.summary?.total || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${data?.personnel?.summary?.attendanceRate || 0}%`
                  }}
                ></div>
              </div>
              <div className="text-center mt-2">
                <span className="text-lg font-bold text-green-600">
                  {data?.personnel?.summary?.attendanceRate || 0}%
                </span>
              </div>

              {/* Attendance Breakdown */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <span className="text-blue-600 font-medium">
                      {data?.personnel?.attendanceBreakdown?.driverAttendance || 0}
                    </span>
                    <p className="text-[#7d7d7d]">Drivers</p>
                  </div>
                  <div className="text-center">
                    <span className="text-purple-600 font-medium">
                      {data?.personnel?.attendanceBreakdown?.generalAttendance || 0}
                    </span>
                    <p className="text-[#7d7d7d]">General</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Performance and Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* System Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#103a5e]">System Performance</h3>
            <button className="text-[#0097fb] text-sm hover:underline">View Details</button>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#7d7d7d]">Bus Fleet Utilization</span>
                <span className="text-sm font-medium">{data?.systemPerformance?.summary?.busUtilizationRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data?.systemPerformance?.summary?.busUtilizationRate || 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#7d7d7d]">Route Network Efficiency</span>
                <span className="text-sm font-medium">{data?.systemPerformance?.summary?.routeUtilizationRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data?.systemPerformance?.summary?.routeUtilizationRate || 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#7d7d7d]">System Uptime</span>
                <span className="text-sm font-medium">{data?.systemPerformance?.systemHealth?.uptime || 99.2}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data?.systemPerformance?.systemHealth?.uptime || 99.2}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-lg font-bold text-blue-600">{data?.systemPerformance?.summary?.activeBuses || 0}</p>
              <p className="text-xs text-blue-600">Active Buses</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-lg font-bold text-green-600">{data?.systemPerformance?.summary?.activeRoutes || 0}</p>
              <p className="text-xs text-green-600">Active Routes</p>
            </div>
          </div>
        </div>

        {/* Routes Reallocated */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#103a5e]">Route Reallocations</h3>
            <button className="text-[#0097fb] text-sm hover:underline">View Details</button>
          </div>

          {/* Reallocation Status */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#7d7d7d] mb-3">By Status</h4>
            <div className="space-y-2">
              {Object.entries(data?.routesReallocated?.byStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'completed' ? 'bg-green-500' :
                      status === 'approved' ? 'bg-blue-500' :
                      status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm capitalize">{status}</span>
                  </div>
                  <span className="text-sm font-medium">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Success Rate */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#7d7d7d] mb-3">Success Rate</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <span className="text-2xl font-bold text-green-600">
                  {data?.routesReallocated?.summary?.successRate || 0}%
                </span>
                <p className="text-sm text-[#7d7d7d] mt-1">
                  {(data?.routesReallocated?.summary?.completed || 0) + (data?.routesReallocated?.summary?.approved || 0)} successful out of {data?.routesReallocated?.summary?.total || 0} total
                </p>
              </div>
            </div>
          </div>

          {/* Recent Requests */}
          <div>
            <h4 className="text-sm font-medium text-[#7d7d7d] mb-3">Recent Requests</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {data?.routesReallocated?.recentRequests?.slice(0, 5).map((request: any, index: number) => (
                <div key={request.id || index} className="flex items-center justify-between py-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#103a5e]">Route {request.route_id}</p>
                    <p className="text-xs text-[#7d7d7d] capitalize">{request.reason || 'General'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                    request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Passengers and Tickets Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Passengers Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#103a5e]">Passengers Overview</h3>
            <button className="text-[#0097fb] text-sm hover:underline">View Details</button>
          </div>

          {/* Passenger Demographics */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#7d7d7d] mb-3">Demographics</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Verified</span>
                </div>
                <span className="text-sm font-medium">{data?.passengers?.demographics?.verified || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Unverified</span>
                </div>
                <span className="text-sm font-medium">{data?.passengers?.demographics?.unverified || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">With Profile Image</span>
                </div>
                <span className="text-sm font-medium">{data?.passengers?.demographics?.withProfileImage || 0}</span>
              </div>
            </div>
          </div>

          {/* Growth Stats */}
          <div>
            <h4 className="text-sm font-medium text-[#7d7d7d] mb-3">Growth</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <span className="text-lg font-bold text-purple-600">
                  +{data?.passengers?.growth?.thisMonth || 0}
                </span>
                <p className="text-sm text-[#7d7d7d] mt-1">New registrations this month</p>
                <div className="mt-2">
                  <span className="text-sm text-green-600">
                    {data?.passengers?.growth?.growthRate || 0}% growth rate
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e5e7eb]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#103a5e]">Tickets Overview</h3>
            <button className="text-[#0097fb] text-sm hover:underline">View Details</button>
          </div>

          {/* Ticket Status */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#7d7d7d] mb-3">By Status</h4>
            <div className="space-y-2">
              {Object.entries(data?.tickets?.byStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'used' ? 'bg-green-500' :
                      status === 'active' ? 'bg-blue-500' :
                      status === 'expired' ? 'bg-gray-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm capitalize">{status}</span>
                  </div>
                  <span className="text-sm font-medium">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Stats */}
          <div>
            <h4 className="text-sm font-medium text-[#7d7d7d] mb-3">Revenue</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <span className="text-lg font-bold text-green-600">
                  ETB {data?.tickets?.revenue?.total || 0}
                </span>
                <p className="text-sm text-[#7d7d7d] mt-1">Total revenue</p>
                <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-blue-600 font-medium">
                      ETB {data?.tickets?.revenue?.thisMonth || 0}
                    </span>
                    <p className="text-[#7d7d7d]">This month</p>
                  </div>
                  <div>
                    <span className="text-purple-600 font-medium">
                      ETB {data?.tickets?.revenue?.averageDaily || 0}
                    </span>
                    <p className="text-[#7d7d7d]">Daily avg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
