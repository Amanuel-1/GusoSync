export interface Location {
  latitude: number;
  longitude: number;
}

export interface BusStop {
  id: string;
  name: string;
  location: Location;
  capacity?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IncomingBus {
  id: string; // trip id
  bus_id: string;
  route_id: string;
  driver_id?: string;
  estimated_arrival_time?: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DELAYED";
  // Additional computed fields
  bus_license_plate?: string;
  bus_type?: string;
  driver_name?: string;
  driver_phone?: string;
  route_name?: string;
  minutes_away?: number;
}

export interface BusStopWithIncomingBuses extends BusStop {
  incoming_buses: IncomingBus[];
  total_incoming: number;
  next_arrival?: string;
}

export interface CreateBusStopRequest {
  name: string;
  location: Location;
  capacity?: number;
  is_active: boolean;
}

export interface UpdateBusStopRequest {
  name?: string;
  location?: Location;
  capacity?: number;
  is_active?: boolean;
}
