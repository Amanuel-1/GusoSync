"use client"

import { useEffect, useState } from "react"

// Real-time WebSocket service for GusoSync backend
export class RealTimeSocketService {
  private static instance: RealTimeSocketService
  private ws: WebSocket | null = null
  private callbacks: Record<string, Function[]> = {}
  private connected = false
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3  // Reduced from 5 to 3
  private reconnectDelay = 5000     // Increased from 1000ms to 5000ms
  private authToken: string | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private authRetryInterval: NodeJS.Timeout | null = null

  private constructor() {
    // Don't auto-connect, wait for explicit connect call
    console.log('🔌 RealTimeSocketService instance created')
  }

  public static getInstance(): RealTimeSocketService {
    if (!RealTimeSocketService.instance) {
      RealTimeSocketService.instance = new RealTimeSocketService()
      console.log('🔌 New RealTimeSocketService singleton instance created')
    }
    return RealTimeSocketService.instance
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      console.log("🔑 Attempting to get auth token from API endpoint")
      const response = await fetch('/api/auth/websocket-token', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        console.log("🔑 Successfully got auth token from API")

        // Add token validation
        if (data.token) {
          // Check if it's a valid JWT format (has 3 parts separated by dots)
          const tokenParts = data.token.split('.')
          if (tokenParts.length === 3) {
            console.log("🔑 Token appears to be valid JWT format")
            // Try to decode the payload for debugging (without verification)
            try {
              const payload = JSON.parse(atob(tokenParts[1]))
              console.log("🔑 Token payload:", {
                sub: payload.sub,
                role: payload.role,
                exp: payload.exp,
                expiry: new Date(payload.exp * 1000).toISOString()
              })
            } catch (e) {
              console.warn("🔑 Could not decode token payload:", e)
            }
          } else {
            console.warn("🔑 Token does not appear to be JWT format")
          }
        }

        return data.token
      } else {
        console.warn('Failed to get auth token:', response.status)
        return null
      }
    } catch (error) {
      console.error('Error fetching auth token:', error)
      return null
    }
  }

  public async connect(token?: string) {
    console.log('🔌 Connect called, current state:', {
      connected: this.connected,
      wsReadyState: this.ws?.readyState,
      hasToken: !!this.authToken
    })

    if (this.isConnected() || this.isConnecting()) {
      console.log('🔌 Already connected or connecting, skipping')
      return
    }

    // Clean up any existing connection first
    this.cleanup()

    this.authToken = token || await this.getAuthToken()
    if (!this.authToken) {
      console.warn('🔑 No auth token available for WebSocket connection. Real-time features will be disabled.')

      // Try to get auth token periodically
      this.startAuthRetry()
      return
    }

    console.log('🔌 Starting WebSocket connection with token')
    // Try multiple WebSocket connection methods
    await this.tryWebSocketConnection()
  }

  private async tryWebSocketConnection() {
    if (!this.authToken) return

    const endpoints = [
      // Primary endpoint based on backend API info
      `wss://guzosync-fastapi.onrender.com/ws/connect?token=${encodeURIComponent(this.authToken)}`,
      // Fallback endpoints
      `wss://guzosync-fastapi.onrender.com/ws?token=${encodeURIComponent(this.authToken)}`,
      `wss://guzosync-fastapi.onrender.com/ws/connect?auth=${encodeURIComponent(this.authToken)}`,
    ]

    for (let i = 0; i < endpoints.length; i++) {
      const wsUrl = endpoints[i]
      console.log(`🔌 Attempting WebSocket connection ${i + 1}/${endpoints.length} to:`, wsUrl.replace(/[?&](token|auth)=[^&]+/, '$1=***'))

      try {
        await this.connectToEndpoint(wsUrl)
        return // Success, exit the loop
      } catch (error) {
        console.warn(`❌ WebSocket connection ${i + 1} failed:`, error)
        if (i === endpoints.length - 1) {
          console.error('🚫 All WebSocket connection attempts failed')
          console.log('🔄 WebSocket unavailable, fallback polling should be used')
          this.emit("error", {
            message: 'WebSocket connection failed - using fallback polling',
            originalError: error,
            timestamp: new Date().toISOString()
          })
        }
      }
    }
  }

  private async connectToEndpoint(wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl)

        // Set up connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            this.ws.close()
            reject(new Error('WebSocket connection timeout'))
          }
        }, 10000) // 10 second timeout

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout)
          console.log('✅ Connected to GusoSync WebSocket server')
          this.connected = true
          this.reconnectAttempts = 0
          this.emit("connect", {})
          this.startHeartbeat()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            console.log('📨 Received WebSocket message:', message)

            // Handle different message types
            if (message.type) {
              // Special handling for notification messages
              if (message.type === 'notification' && message.notification) {
                // Ensure the notification has an ID (generate one if missing)
                if (!message.notification.id) {
                  message.notification.id = `notification_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
                }

                // Ensure timestamp is in the correct format
                if (!message.notification.timestamp) {
                  message.notification.timestamp = new Date().toISOString()
                }

                console.log('📢 Processing notification:', message.notification)
              }

              this.emit(message.type, message)
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout)
          console.log('🔌 WebSocket connection closed:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            reconnectAttempts: this.reconnectAttempts
          })

          this.connected = false
          this.stopHeartbeat()
          this.emit("disconnect", { code: event.code, reason: event.reason })

          // Attempt to reconnect if not a normal closure and we haven't exceeded max attempts
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`)
            this.scheduleReconnect()
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('🚫 Max reconnection attempts reached, giving up')
            this.emit("error", {
              message: 'Max reconnection attempts reached',
              code: 'MAX_RECONNECT_ATTEMPTS',
              timestamp: new Date().toISOString()
            })
          }

          if (event.code !== 1000) {
            reject(new Error(`WebSocket closed with code ${event.code}: ${event.reason}`))
          }
        }

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout)
          console.error('❌ WebSocket error:', error)
          console.log('🔍 WebSocket connection details:', {
            url: wsUrl.replace(/[?&](token|auth)=[^&]+/, '$1=***'),
            readyState: this.ws?.readyState,
            tokenLength: this.authToken?.length,
            tokenPreview: this.authToken ? `${this.authToken.substring(0, 20)}...` : 'null'
          })

          // Try to provide more specific error information
          if (this.ws?.readyState === WebSocket.CLOSED) {
            console.warn('🔍 WebSocket was closed before connection could be established')
          }

          this.emit("error", {
            message: 'WebSocket connection error',
            originalError: error,
            timestamp: new Date().toISOString()
          })
          reject(error)
        }

      } catch (error) {
        console.error('Error creating WebSocket connection:', error)
        this.emit("error", {
          message: 'Failed to create WebSocket connection',
          originalError: error,
          timestamp: new Date().toISOString()
        })
        reject(error)
      }
    })
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', {})
      }
    }, 30000) // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private startAuthRetry() {
    if (this.authRetryInterval) {
      clearInterval(this.authRetryInterval)
    }

    this.authRetryInterval = setInterval(async () => {
      const token = await this.getAuthToken()
      if (token) {
        console.log('🔑 Auth token found, attempting to connect...')
        this.stopAuthRetry()
        this.connect(token)
      }
    }, 30000) // Check every 30 seconds (reduced frequency)
  }

  private stopAuthRetry() {
    if (this.authRetryInterval) {
      clearInterval(this.authRetryInterval)
      this.authRetryInterval = null
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts + 1} in ${delay}ms`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      this.connect()
    }, delay)
  }

  public send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = { type, data }
      this.ws.send(JSON.stringify(message))
      console.log('📤 Sent WebSocket message:', message)
    } else {
      console.warn('WebSocket not connected, cannot send message:', { type, data })
    }
  }

  public on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(callback)
  }

  public off(event: string, callback: Function) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter((cb) => cb !== callback)
    }
  }

  private emit(event: string, data: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((callback) => callback(data))
    }
  }

  public isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN
  }

  public isConnecting(): boolean {
    return this.ws?.readyState === WebSocket.CONNECTING
  }

  private cleanup() {
    console.log('🧹 Cleaning up existing WebSocket connection')

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.stopHeartbeat()
    this.stopAuthRetry()

    if (this.ws) {
      // Remove event listeners to prevent memory leaks
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onclose = null
      this.ws.onerror = null

      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Cleanup')
      }
      this.ws = null
    }

    this.connected = false
    this.reconnectAttempts = 0
  }

  public disconnect() {
    console.log('🔌 Disconnect called')
    this.cleanup()
  }

  public forceReconnect() {
    console.log('🔄 Force reconnect called')
    this.cleanup()
    this.reconnectAttempts = 0
    return this.connect()
  }

  // Subscribe to all bus location updates
  public subscribeToAllBuses() {
    this.send('subscribe_all_buses', {})
  }

  // Subscribe to proximity alerts
  public subscribeToProximityAlerts(busStopIds: string[], radiusMeters: number = 500) {
    this.send('subscribe_proximity_alerts', {
      bus_stop_ids: busStopIds,
      radius_meters: radiusMeters
    })
  }

  // Calculate ETA for a bus to reach a stop
  public calculateETA(busId: string, stopId: string) {
    this.send('calculate_eta', {
      bus_id: busId,
      stop_id: stopId
    })
  }

  // Subscribe to notifications
  public subscribeToNotifications() {
    this.send('subscribe_notifications', {})
  }
}

// Legacy SocketService for backward compatibility with existing chat functionality
export class SocketService {
  private static instance: SocketService
  private callbacks: Record<string, Function[]> = {}
  private connected = false

  private constructor() {
    // Simulate connection
    setTimeout(() => {
      this.connected = true
      this.emit("connect", {})
    }, 1000)
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  public on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(callback)
  }

  public off(event: string, callback: Function) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter((cb) => cb !== callback)
    }
  }

  public emit(event: string, data: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((callback) => callback(data))
    }
  }

  public isConnected(): boolean {
    return this.connected
  }

  public connect() {
    if (!this.connected) {
      // Simulate connection
      setTimeout(() => {
        this.connected = true
        this.emit("connect", {})
      }, 1000)
    }
  }

  public disconnect() {
    this.connected = false
    this.emit("disconnect", {})
  }
}

// Custom hook for using socket
export function useSocket(event: string, callback: Function) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socket = SocketService.getInstance()

    const onConnect = () => {
      setIsConnected(true)
    }

    const onDisconnect = () => {
      setIsConnected(false)
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on(event, callback)

    // Set initial connection state
    setIsConnected(socket.isConnected())

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off(event, callback)
    }
  }, [event, callback])

  return isConnected
}
