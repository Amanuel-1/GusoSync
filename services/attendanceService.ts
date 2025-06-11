// Attendance Service for GusoSync
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  status: AttendanceStatus;
  check_in_time?: string | null;
  check_out_time?: string | null;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  notes?: string | null;
  marked_by?: string | null;
  marked_at: string;
}

export interface AttendanceHeatmapData {
  user_id: string;
  date_from: string;
  date_to: string;
  attendance_data: Record<string, string>; // date -> status mapping
}

export interface AttendanceSummary {
  user_id: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  attendance_percentage: number;
  records: AttendanceRecord[];
}

export interface MarkAttendanceRequest {
  user_id: string;
  date: string;
  status: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class AttendanceService {
  private baseUrl = '/api/attendance';

  // Get attendance records
  async getAttendanceRecords(params?: {
    user_id?: string;
    date_from?: string;
    date_to?: string;
    attendance_status?: AttendanceStatus;
  }): Promise<ApiResponse<AttendanceRecord[]>> {
    try {
      const url = new URL(this.baseUrl, window.location.origin);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            url.searchParams.append(key, value);
          }
        });
      }

      console.log('AttendanceService: Making request to:', url.toString());
      console.log('AttendanceService: Request params:', params);

      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      console.log('AttendanceService: Response status:', response.status);
      console.log('AttendanceService: Response data:', data);

      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          message: data.error || 'Failed to fetch attendance records',
        };
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }

  // Get attendance heatmap data
  async getAttendanceHeatmap(params?: {
    user_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<AttendanceHeatmapData>> {
    try {
      const url = new URL(`${this.baseUrl}/heatmap`, window.location.origin);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            url.searchParams.append(key, value);
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          message: data.error || 'Failed to fetch attendance heatmap',
        };
      }
    } catch (error) {
      console.error('Error fetching attendance heatmap:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }



  // Mark attendance
  async markAttendance(request: MarkAttendanceRequest): Promise<ApiResponse<AttendanceRecord>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          message: data.error || 'Failed to mark attendance',
        };
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  }
}

export default new AttendanceService();
