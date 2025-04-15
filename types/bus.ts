export interface BusLocation {
  latitude: number
  longitude: number
}

export interface BusRoute {
  id: string
  name: string
  color: string
}

export interface BusDriver {
  id: string
  name: string
  phone: string
  photo?: string
}

export interface Bus {
  id: string
  name: string
  routeId: string
  routeName: string
  routeColor: string
  location: BusLocation
  heading: number
  speed: number
  status: "IN_SERVICE" | "OUT_OF_SERVICE" | "DELAYED" | "MAINTENANCE"
  lastUpdated: Date
  nextStop: string
  nextStopETA: string
  passengerCount: number
  capacity: number
  driver: BusDriver
  vehicleType: string
  licensePlate: string
}

export interface BusStop {
  id: string
  name: string
  location: BusLocation
  routeIds: string[]
}
