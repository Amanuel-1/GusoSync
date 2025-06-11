"use client"

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, Calendar, Clock, Bus, Users, Activity, Award, CheckCircle, XCircle } from 'lucide-react';
import { type User as UserType } from '@/services/userService';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import attendanceService, { type AttendanceRecord, type AttendanceHeatmapData } from '@/services/attendanceService';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

interface HeatmapValue {
  date: string;
  count: number;
  status?: 'PRESENT' | 'ABSENT' | 'LATE';
}



interface PerformanceMetrics {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  attendanceRate: number;
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'history'>('overview');
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapValue[]>([]);

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);

  const [loading, setLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // Fetch real attendance data from API
  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      fetchAttendanceData();
    }
  }, [isOpen, user]);

  const fetchAttendanceData = async () => {
    try {
      setAttendanceError(null);
      const currentYear = new Date().getFullYear();
      const yearStart = `${currentYear}-01-01`;
      const yearEnd = `${currentYear}-12-31`;

      console.log('Fetching attendance data for user:', {
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
        dateRange: { yearStart, yearEnd }
      });

      // Fetch basic attendance records for the user (without date filters)
      const recordsResponse = await attendanceService.getAttendanceRecords({
        user_id: user?.id,
      });

      if (recordsResponse.success && recordsResponse.data) {
        setAttendanceData(recordsResponse.data);

        // Calculate metrics from records
        const records = recordsResponse.data;
        const presentDays = records.filter(r => r.status === 'PRESENT').length;
        const lateDays = records.filter(r => r.status === 'LATE').length;
        const absentDays = records.filter(r => r.status === 'ABSENT').length;
        const totalDays = records.length;

        const performanceMetrics: PerformanceMetrics = {
          totalDays,
          presentDays,
          lateDays,
          absentDays,
          attendanceRate: totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0,
        };
        setPerformanceMetrics(performanceMetrics);


      } else {
        console.warn('Failed to fetch attendance records, using fallback data:', recordsResponse.message);

        // Fallback: Show empty state or basic info
        const fallbackMetrics: PerformanceMetrics = {
          totalDays: 0,
          presentDays: 0,
          lateDays: 0,
          absentDays: 0,
          attendanceRate: 0,
        };
        setPerformanceMetrics(fallbackMetrics);
        setAttendanceData([]);

        // Only set error if it's a real error, not just no data
        if (recordsResponse.message && !recordsResponse.message.includes('No data')) {
          setAttendanceError(recordsResponse.message);
        }
      }

      // Fetch heatmap data (without date filters)
      const heatmapResponse = await attendanceService.getAttendanceHeatmap({
        user_id: user?.id,
      });

      if (heatmapResponse.success && heatmapResponse.data) {
        const heatmapData = transformHeatmapData(heatmapResponse.data);
        setHeatmapData(heatmapData);

        // If we don't have attendance records but have heatmap data, create records from heatmap
        if (attendanceData.length === 0) {
          const recordsFromHeatmap = createRecordsFromHeatmap(heatmapResponse.data);
          setAttendanceData(recordsFromHeatmap);

          // Recalculate metrics with heatmap data
          const presentDays = recordsFromHeatmap.filter((r: AttendanceRecord) => r.status === 'PRESENT').length;
          const lateDays = recordsFromHeatmap.filter((r: AttendanceRecord) => r.status === 'LATE').length;
          const absentDays = recordsFromHeatmap.filter((r: AttendanceRecord) => r.status === 'ABSENT').length;
          const totalDays = recordsFromHeatmap.length;

          const performanceMetrics: PerformanceMetrics = {
            totalDays,
            presentDays,
            lateDays,
            absentDays,
            attendanceRate: totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0,
          };
          setPerformanceMetrics(performanceMetrics);
        }
      }



    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const transformHeatmapData = (heatmapData: AttendanceHeatmapData): HeatmapValue[] => {
    const result: HeatmapValue[] = [];
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    // Create a normalized attendance data map (convert timestamps to date strings)
    const normalizedAttendanceData: Record<string, string> = {};
    Object.entries(heatmapData.attendance_data).forEach(([dateKey, status]) => {
      // Handle both timestamp format (2025-04-14T00:00:00) and date format (2025-04-14)
      const normalizedDate = dateKey.includes('T') ? dateKey.split('T')[0] : dateKey;
      normalizedAttendanceData[normalizedDate] = status;
    });

    console.log('Normalized attendance data:', normalizedAttendanceData);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const attendanceStatus = normalizedAttendanceData[dateStr];

      let count = 0;
      let status: 'PRESENT' | 'ABSENT' | 'LATE' | undefined = undefined;

      if (attendanceStatus) {
        status = attendanceStatus as 'PRESENT' | 'ABSENT' | 'LATE';
        count = status === 'PRESENT' ? 3 : status === 'LATE' ? 2 : status === 'ABSENT' ? 1 : 0;
      }

      result.push({
        date: dateStr,
        count,
        status,
      });
    }

    console.log('Transformed heatmap data sample:', result.filter(r => r.count > 0).slice(0, 5));
    return result;
  };

  const createRecordsFromHeatmap = (heatmapData: AttendanceHeatmapData): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];

    Object.entries(heatmapData.attendance_data).forEach(([dateKey, status]) => {
      // Handle both timestamp format (2025-04-14T00:00:00) and date format (2025-04-14)
      const normalizedDate = dateKey.includes('T') ? dateKey.split('T')[0] : dateKey;

      records.push({
        id: `${heatmapData.user_id}-${normalizedDate}`,
        user_id: heatmapData.user_id,
        date: normalizedDate,
        status: status as 'PRESENT' | 'ABSENT' | 'LATE',
        check_in_time: null,
        check_out_time: null,
        location: null,
        notes: null,
        marked_by: null,
        marked_at: new Date().toISOString(),
      });
    });

    // Sort by date (most recent first)
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log('Created records from heatmap:', records.slice(0, 5));
    return records;
  };

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
      case 'PRESENT':
        return 'bg-blue-100 text-blue-800';
      case 'LATE':
        return 'bg-sky-100 text-sky-800';
      case 'ABSENT':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return timeString;
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
            {['overview', 'attendance', 'history'].map((tab) => (
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
                          <div className="text-2xl font-bold text-[#0097fb]">3</div>
                          <div className="text-sm text-gray-600">Routes Assigned</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#103a5e]">125</div>
                          <div className="text-sm text-gray-600">Total Trips</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-600">4.7</div>
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
                  {/* Error Message */}
                  {attendanceError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-800">
                        <XCircle size={20} />
                        <span className="font-medium">Error loading attendance data</span>
                      </div>
                      <p className="text-red-600 text-sm mt-1">{attendanceError}</p>
                    </div>
                  )}

                  {/* Attendance Summary */}
                  {performanceMetrics ? (
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
                  ) : !loading && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No attendance data available</p>
                      <p className="text-sm">Attendance information will appear here once available.</p>
                    </div>
                  )}

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
                          if (value.status === 'PRESENT') {
                            return 'color-blue-3'; // Main theme blue
                          }
                          if (value.status === 'LATE') {
                            return 'color-blue-2'; // Light blue
                          }
                          if (value.status === 'ABSENT') {
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
                    <h3 className="text-lg font-semibold text-[#103a5e] mb-4">Recent Attendance Records</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {attendanceData.slice(0, 10).map((attendance, index) => (
                        <div key={attendance.id || index} className="flex items-center justify-between p-3 bg-white rounded-md border">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              attendance.status === 'PRESENT' ? 'bg-[#0097fb]' :
                              attendance.status === 'LATE' ? 'bg-[#7dd3fc]' :
                              'bg-[#e0f2fe] border border-gray-300'
                            }`}></div>
                            <div>
                              <span className="font-medium">{new Date(attendance.date).toLocaleDateString()}</span>
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(attendance.status)}`}>
                                {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1).toLowerCase()}
                              </span>
                              {attendance.notes && (
                                <div className="text-xs text-gray-500 mt-1">{attendance.notes}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {(attendance.check_in_time || attendance.check_out_time) && (
                              <div className="text-sm text-gray-600">
                                {attendance.check_in_time && (
                                  <div>In: {formatTime(attendance.check_in_time)}</div>
                                )}
                                {attendance.check_out_time && (
                                  <div>Out: {formatTime(attendance.check_out_time)}</div>
                                )}
                              </div>
                            )}
                            {attendance.location && (
                              <div className="text-xs text-gray-500 mt-1">
                                📍 {attendance.location.address || `${attendance.location.latitude}, ${attendance.location.longitude}`}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {attendanceData.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">No attendance records found</p>
                          <p className="text-sm">This user doesn't have any attendance records yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
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
