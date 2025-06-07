"use client"

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, Calendar, MapPin, Clock, Route, Bus, Users, Activity, Award, CheckCircle, XCircle } from 'lucide-react';
import { type User as UserType } from '@/services/userService';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

interface AttendanceData {
  date: string;
  status: 'present' | 'absent' | 'late';
  checkIn?: string;
  checkOut?: string;
}

interface HeatmapValue {
  date: string;
  count: number;
  status?: 'present' | 'absent' | 'late';
}

interface RouteData {
  id: string;
  name: string;
  totalTrips: number;
  completedTrips: number;
  lastDriven: string;
  rating: number;
}

interface PerformanceMetrics {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  attendanceRate: number;
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'performance' | 'history'>('overview');
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapValue[]>([]);
  const [routeData, setRouteData] = useState<RouteData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        // Mock attendance data for recent records
        const mockAttendance: AttendanceData[] = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const statuses: ('present' | 'absent' | 'late')[] = ['present', 'present', 'present', 'late', 'absent'];
          const status = statuses[Math.floor(Math.random() * statuses.length)];

          return {
            date: date.toISOString().split('T')[0],
            status,
            checkIn: status !== 'absent' ? `${7 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : undefined,
            checkOut: status !== 'absent' ? `${17 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : undefined,
          };
        });

        // Generate heatmap data for the entire current year (all 12 months)
        const mockHeatmapData: HeatmapValue[] = [];
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1); // January 1st of current year
        const endDate = new Date(currentYear, 11, 31); // December 31st of current year
        const today = new Date();

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];

          // Only generate attendance data for past dates and today
          if (d <= today) {
            const statuses: ('present' | 'absent' | 'late')[] = ['present', 'present', 'present', 'present', 'late', 'absent'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            // Convert status to count for heatmap (present=3, late=2, absent=1, no data=0)
            const count = status === 'present' ? 3 : status === 'late' ? 2 : status === 'absent' ? 1 : 0;

            mockHeatmapData.push({
              date: dateStr,
              count,
              status,
            });
          } else {
            // Future dates have no data (will show as empty)
            mockHeatmapData.push({
              date: dateStr,
              count: 0,
              status: undefined,
            });
          }
        }

        // Mock route data for drivers
        const mockRoutes: RouteData[] = [
          { id: 'R001', name: 'Downtown - Airport', totalTrips: 45, completedTrips: 43, lastDriven: '2024-01-15', rating: 4.8 },
          { id: 'R002', name: 'University - Mall', totalTrips: 32, completedTrips: 30, lastDriven: '2024-01-14', rating: 4.6 },
          { id: 'R003', name: 'Residential - Business District', totalTrips: 28, completedTrips: 28, lastDriven: '2024-01-13', rating: 4.9 },
        ];

        // Mock performance metrics
        const presentDays = mockAttendance.filter(d => d.status === 'present').length;
        const lateDays = mockAttendance.filter(d => d.status === 'late').length;
        const absentDays = mockAttendance.filter(d => d.status === 'absent').length;
        
        const mockPerformance: PerformanceMetrics = {
          totalDays: mockAttendance.length,
          presentDays,
          lateDays,
          absentDays,
          attendanceRate: ((presentDays + lateDays) / mockAttendance.length) * 100,
        };

        setAttendanceData(mockAttendance);
        setHeatmapData(mockHeatmapData);
        setRouteData(mockRoutes);
        setPerformanceMetrics(mockPerformance);
        setLoading(false);
      }, 1000);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'BUS_DRIVER':
        return 'Bus Driver';
      case 'QUEUE_REGULATOR':
        return 'Queue Regulator';
      case 'CONTROL_STAFF':
        return 'Control Staff';
      default:
        return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-blue-100 text-blue-800';
      case 'late':
        return 'bg-sky-100 text-sky-800';
      case 'absent':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden transform transition-all duration-300 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-[#103a5e] to-[#0097fb]">
          <div className="flex items-center gap-4">
            {user.profile_image ? (
              <img 
                src={user.profile_image} 
                alt={`${user.first_name} ${user.last_name}`}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#103a5e] text-xl font-bold shadow-lg">
                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
              </div>
            )}
            <div className="text-white">
              <h2 className="text-2xl font-bold">{user.first_name} {user.last_name}</h2>
              <p className="text-blue-100">{getRoleDisplayName(user.role)}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${user.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex">
            {['overview', 'attendance', 'performance', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 px-6 text-sm font-medium capitalize ${
                  activeTab === tab 
                    ? 'bg-white text-[#103a5e] border-b-2 border-[#0097fb]' 
                    : 'text-gray-600 hover:text-[#103a5e] hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0097fb]"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#103a5e] mb-4 flex items-center gap-2">
                      <User size={20} />
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-gray-500" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-gray-500" />
                        <span className="text-sm">{user.phone_number || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield size={16} className="text-gray-500" />
                        <span className="text-sm">{getRoleDisplayName(user.role)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-sm">Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#103a5e] mb-4 flex items-center gap-2">
                      <Activity size={20} />
                      Quick Stats
                    </h3>
                    {performanceMetrics && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#0097fb]">{performanceMetrics.attendanceRate.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">Attendance Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#103a5e]">{performanceMetrics.presentDays}</div>
                          <div className="text-sm text-gray-600">Present Days</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-sky-600">{performanceMetrics.lateDays}</div>
                          <div className="text-sm text-gray-600">Late Days</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600">{performanceMetrics.absentDays}</div>
                          <div className="text-sm text-gray-600">Absent Days</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Role-specific Information */}
                  {user.role === 'BUS_DRIVER' && (
                    <div className="lg:col-span-2 bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#103a5e] mb-4 flex items-center gap-2">
                        <Bus size={20} />
                        Driver Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#0097fb]">{routeData.length}</div>
                          <div className="text-sm text-gray-600">Routes Assigned</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#103a5e]">
                            {routeData.reduce((sum, route) => sum + route.completedTrips, 0)}
                          </div>
                          <div className="text-sm text-gray-600">Total Trips</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-600">
                            {routeData.length > 0 ? (routeData.reduce((sum, route) => sum + route.rating, 0) / routeData.length).toFixed(1) : '0'}
                          </div>
                          <div className="text-sm text-gray-600">Avg Rating</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {user.role === 'QUEUE_REGULATOR' && (
                    <div className="lg:col-span-2 bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#103a5e] mb-4 flex items-center gap-2">
                        <Users size={20} />
                        Queue Regulator Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#0097fb]">5</div>
                          <div className="text-sm text-gray-600">Stops Managed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#103a5e]">1,234</div>
                          <div className="text-sm text-gray-600">Passengers Served</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-600">4.7</div>
                          <div className="text-sm text-gray-600">Service Rating</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {user.role === 'CONTROL_STAFF' && (
                    <div className="lg:col-span-2 bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#103a5e] mb-4 flex items-center gap-2">
                        <Shield size={20} />
                        Control Staff Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#0097fb]">15</div>
                          <div className="text-sm text-gray-600">Systems Monitored</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#103a5e]">98.5%</div>
                          <div className="text-sm text-gray-600">System Uptime</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-600">24</div>
                          <div className="text-sm text-gray-600">Issues Resolved</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  {/* Attendance Heatmap */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#103a5e] mb-4 flex items-center gap-2">
                      <Calendar size={20} />
                      Attendance Heatmap ({new Date().getFullYear()})
                    </h3>
                    <div className="mb-4 overflow-x-auto">
                      <CalendarHeatmap
                        startDate={new Date(new Date().getFullYear(), 0, 1)}
                        endDate={new Date(new Date().getFullYear(), 11, 31)}
                        values={heatmapData}
                        classForValue={(value) => {
                          if (!value || value.count === 0) {
                            return 'color-empty';
                          }
                          if (value.status === 'present') {
                            return 'color-blue-3'; // Main theme blue
                          }
                          if (value.status === 'late') {
                            return 'color-blue-2'; // Light blue
                          }
                          if (value.status === 'absent') {
                            return 'color-blue-1'; // Very light blue
                          }
                          return 'color-empty';
                        }}
                        showWeekdayLabels={true}
                        showMonthLabels={true}
                        weekdayLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                        monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#0097fb] rounded-sm"></div>
                        <span>Present</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#7dd3fc] rounded-sm"></div>
                        <span>Late</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#e0f2fe] rounded-sm border border-gray-300"></div>
                        <span>Absent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#f8fafc] rounded-sm border border-gray-300"></div>
                        <span>No Data</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Attendance */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#103a5e] mb-4">Recent Attendance</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {attendanceData.slice(0, 10).map((attendance, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              attendance.status === 'present' ? 'bg-[#0097fb]' :
                              attendance.status === 'late' ? 'bg-[#7dd3fc]' :
                              'bg-[#e0f2fe] border border-gray-300'
                            }`}></div>
                            <span className="font-medium">{new Date(attendance.date).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(attendance.status)}`}>
                              {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                            </span>
                          </div>
                          {attendance.checkIn && (
                            <div className="text-sm text-gray-600">
                              {attendance.checkIn} - {attendance.checkOut}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-6">
                  {/* Performance Overview */}
                  {performanceMetrics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="text-[#0097fb]" size={24} />
                          <div>
                            <div className="text-2xl font-bold text-[#0097fb]">{performanceMetrics.attendanceRate.toFixed(1)}%</div>
                            <div className="text-sm text-[#103a5e]">Attendance Rate</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center gap-3">
                          <Calendar className="text-[#103a5e]" size={24} />
                          <div>
                            <div className="text-2xl font-bold text-[#103a5e]">{performanceMetrics.presentDays}</div>
                            <div className="text-sm text-slate-600">Present Days</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
                        <div className="flex items-center gap-3">
                          <Clock className="text-sky-600" size={24} />
                          <div>
                            <div className="text-2xl font-bold text-sky-600">{performanceMetrics.lateDays}</div>
                            <div className="text-sm text-sky-700">Late Days</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                          <XCircle className="text-gray-500" size={24} />
                          <div>
                            <div className="text-2xl font-bold text-gray-600">{performanceMetrics.absentDays}</div>
                            <div className="text-sm text-gray-500">Absent Days</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Role-specific Performance */}
                  {user.role === 'BUS_DRIVER' && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#103a5e] mb-4 flex items-center gap-2">
                        <Route size={20} />
                        Route Performance
                      </h3>
                      <div className="space-y-4">
                        {routeData.map((route) => (
                          <div key={route.id} className="bg-white rounded-lg p-4 border">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-[#103a5e]">{route.name}</h4>
                              <span className="text-sm text-gray-600">Route {route.id}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Completion Rate:</span>
                                <div className="font-medium text-[#0097fb]">
                                  {((route.completedTrips / route.totalTrips) * 100).toFixed(1)}%
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Total Trips:</span>
                                <div className="font-medium text-[#103a5e]">{route.completedTrips}/{route.totalTrips}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Rating:</span>
                                <div className="font-medium text-slate-600">★ {route.rating}</div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-[#0097fb] h-2 rounded-full"
                                  style={{ width: `${(route.completedTrips / route.totalTrips) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.role === 'QUEUE_REGULATOR' && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#103a5e] mb-4 flex items-center gap-2">
                        <MapPin size={20} />
                        Stop Management Performance
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium text-[#103a5e] mb-2">Queue Efficiency</h4>
                          <div className="text-2xl font-bold text-[#0097fb]">94.2%</div>
                          <div className="text-sm text-gray-600">Average queue processing efficiency</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border">
                          <h4 className="font-medium text-[#103a5e] mb-2">Customer Satisfaction</h4>
                          <div className="text-2xl font-bold text-slate-600">★ 4.7</div>
                          <div className="text-sm text-gray-600">Based on passenger feedback</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6">
                  {/* Activity Timeline */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#103a5e] mb-4 flex items-center gap-2">
                      <Clock size={20} />
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {[
                        { date: '2024-01-15', action: 'Completed Route R001', type: 'success' },
                        { date: '2024-01-14', action: 'Late arrival reported', type: 'warning' },
                        { date: '2024-01-13', action: 'Perfect attendance week', type: 'success' },
                        { date: '2024-01-12', action: 'Training session completed', type: 'info' },
                        { date: '2024-01-11', action: 'Route assignment updated', type: 'info' },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-md">
                          <div className={`w-3 h-3 rounded-full ${
                            activity.type === 'success' ? 'bg-green-500' :
                            activity.type === 'warning' ? 'bg-yellow-500' :
                            activity.type === 'error' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="font-medium">{activity.action}</div>
                            <div className="text-sm text-gray-600">{new Date(activity.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#103a5e] mb-4 flex items-center gap-2">
                      <Award size={20} />
                      Achievements & Milestones
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { title: 'Perfect Attendance', description: '30 consecutive days', icon: '🏆', color: 'bg-yellow-100 text-yellow-800' },
                        { title: 'Safety Champion', description: 'Zero incidents in 6 months', icon: '🛡️', color: 'bg-green-100 text-green-800' },
                        { title: 'Customer Favorite', description: '4.8+ rating for 3 months', icon: '⭐', color: 'bg-blue-100 text-blue-800' },
                        { title: 'Route Master', description: 'Completed 100+ trips', icon: '🚌', color: 'bg-purple-100 text-purple-800' },
                      ].map((achievement, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{achievement.icon}</span>
                            <div>
                              <h4 className="font-medium text-[#103a5e]">{achievement.title}</h4>
                              <p className="text-sm text-gray-600">{achievement.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
