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
              const now = Math.floor(Date.now() / 1000)
              const isExpired = payload.exp && payload.exp < now

              console.log("🔑 Token payload:", {
                sub: payload.sub,
                role: payload.role,
                exp: payload.exp,
                expiry: new Date(payload.exp * 1000).toISOString(),
                isExpired: isExpired,
                timeUntilExpiry: payload.exp ? `${payload.exp - now} seconds` : 'unknown'
              })

              if (isExpired) {
                console.warn("🔑 Token is expired!")
                return null
              }
            } catch (e) {
              console.warn("🔑 Could not decode token payload:", e)
            }
          } else {
            console.warn("🔑 Token does not appear to be JWT format")
          }
        }

        return data.token
      } else {
        console.warn('Failed to get auth token:', response.status, response.statusText)
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
      // Additional fallback endpoints
      `wss://guzosync-fastapi.onrender.com/ws/notifications?token=${encodeURIComponent(this.authToken)}`,
      `wss://guzosync-fastapi.onrender.com/websocket?token=${encodeURIComponent(this.authToken)}`,
    ]

    for (let i = 0; i < endpoints.length; i++) {
      const wsUrl = endpoints[i]
      console.log(`🔌 Attempting WebSocket connection ${i + 1}/${endpoints.length} to:`, wsUrl.replace(/[?&](token|auth)=[^&]+/, '$1=***'))

      try {
        await this.connectToEndpoint(wsUrl)
        console.log(`✅ Successfully connected to WebSocket endpoint ${i + 1}`)
        return // Success, exit the loop
      } catch (error) {
        console.warn(`❌ WebSocket connection ${i + 1} failed:`, error)
        if (i === endpoints.length - 1) {
          console.error('🚫 All WebSocket connection attempts failed')
          console.log('🔄 WebSocket unavailable, notifications will not work in real-time')
          this.emit("error", {
            message: 'WebSocket connection failed - real-time notifications unavailable',
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

            // Filter out bus location updates from console logs to reduce noise
            const shouldLogMessage = !this.isBusLocationUpdate(message)

            if (shouldLogMessage) {
              console.log('📨 Received WebSocket message:', message)
            }

            // Handle different message types
            if (message.type) {
              // Handle authentication success
              if (message.type === 'authenticated') {
                console.log('✅ WebSocket authentication successful')
              }
              // Handle subscription responses
              else if (message.success !== undefined) {
                if (message.success) {
                  console.log('✅ WebSocket operation successful:', message.message || 'Operation completed')
                  if (message.subscribed_types) {
                    console.log('🔔 Successfully subscribed to notifications:', message.subscribed_types)
                  }
                } else {
                  console.error('❌ WebSocket operation failed:', message.error || 'Unknown error')
                }
              }
              // Handle pong responses
              else if (message.type === 'pong') {
                // Don't log pong messages to reduce console noise
                // console.log('🏓 Received pong from server')
              }
              // Handle error messages
              else if (message.type === 'error') {
                console.error('❌ WebSocket error from server:', message.message)
              }
              // Special handling for notification messages
              else if (message.type === 'notification') {
                this.handleNotificationMessage(message)
              }
              // Handle all other message types (including bus location updates)
              else {
                this.emit(message.type, message)
              }
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

  // Helper method to check if a message is a bus location update
  private isBusLocationUpdate(message: any): boolean {
    return message.type === 'bus_location_update' ||
           message.type === 'location_update' ||
           message.type === 'bus_position' ||
           (message.type === 'update' && message.data?.type === 'location') ||
           (message.data && message.data.latitude && message.data.longitude && message.data.bus_id)
  }

  // Handle notification messages with proper processing
  private handleNotificationMessage(message: any) {
    // Handle both direct notification format and nested notification format
    let notification = message.notification || message.data || message

    // If the message has a 'data' field with notification info, use that
    if (message.data && (message.data.title || message.data.notification_type)) {
      notification = {
        id: message.data.id || `notification_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        title: message.data.title,
        message: message.data.message,
        notification_type: message.data.notification_type,
        timestamp: message.data.timestamp || new Date().toISOString(),
        is_read: false,
        related_entity: message.data.related_entity
      }
    }
    // If it's already a properly formatted notification
    else if (notification && notification.title) {
      // Ensure the notification has required fields
      if (!notification.id) {
        notification.id = `notification_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      }
      if (!notification.timestamp) {
        notification.timestamp = new Date().toISOString()
      }
      if (notification.is_read === undefined) {
        notification.is_read = false
      }
    }
    else {
      console.warn('📢 Received notification message with invalid format:', message)
      return
    }

    console.log('📢 Processing notification:', {
      id: notification.id,
      title: notification.title,
      type: notification.notification_type,
      timestamp: notification.timestamp
    })

    // Emit the notification to listeners
    this.emit('notification', {
      type: 'notification',
      notification: notification
    })
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
    console.log('📡 Sending notification subscription request...')

    // Subscribe to notification types as specified in the backend format
    const notificationTypes = [
      'ALERT',
      'ROUTE_REALLOCATION',
      'TRIP_UPDATE',
      'CHAT_MESSAGE',
      'REALLOCATION_REQUEST_SUBMITTED',
      'REALLOCATION_REQUEST_APPROVED',
      'REALLOCATION_REQUEST_DISCARDED',
      'INCIDENT_REPORTED',
      'GENERAL',
      'PROXIMITY_ALERT',
      'SERVICE_ALERT'
    ]

    this.send('subscribe_notifications', {
      notification_types: notificationTypes
    })

    console.log('📡 Subscribed to notification types:', notificationTypes)
  }

  // Send a test notification (for debugging)
  public sendTestNotification(notificationData: {
    title: string;
    message: string;
    notification_type: string;
    target_roles?: string[];
    target_user_ids?: string[];
    related_entity?: any;
  }) {
    console.log('🧪 Sending test notification:', notificationData)
    this.send('send_test_notification', notificationData)
  }

  // Send reallocation request notification
  public sendReallocationRequestNotification(requestData: {
    request_id: string;
    bus_id: string;
    current_route_id: string;
    requesting_regulator_id: string;
    reason: string;
    priority: "LOW" | "NORMAL" | "HIGH";
  }) {
    this.send('send_notification', {
      title: "New Reallocation Request",
      message: `New reallocation request submitted for bus ${requestData.bus_id} on route ${requestData.current_route_id}. Reason: ${requestData.reason}`,
      notification_type: "REALLOCATION_REQUEST_SUBMITTED",
      target_roles: ["CONTROL_CENTER_ADMIN", "CONTROL_STAFF"],
      related_entity: {
        entity_type: "reallocation_request",
        request_id: requestData.request_id,
        bus_id: requestData.bus_id,
        current_route_id: requestData.current_route_id,
        requesting_regulator_id: requestData.requesting_regulator_id,
        reason: requestData.reason,
        priority: requestData.priority
      }
    })
  }

  // Send reallocation approval notification
  public sendReallocationApprovalNotification(approvalData: {
    request_id: string;
    bus_id: string;
    old_route_id: string;
    new_route_id: string;
    approved_by: string;
  }) {
    this.send('send_notification', {
      title: "Reallocation Request Approved",
      message: `Your reallocation request for bus ${approvalData.bus_id} has been approved. Bus will be moved from ${approvalData.old_route_id} to ${approvalData.new_route_id}`,
      notification_type: "REALLOCATION_REQUEST_APPROVED",
      target_user_ids: [], // Will be filled by backend based on request
      related_entity: {
        entity_type: "reallocation_request",
        request_id: approvalData.request_id,
        bus_id: approvalData.bus_id,
        priority: "NORMAL"
      }
    })
  }

  // Send reallocation discard notification
  public sendReallocationDiscardNotification(discardData: {
    request_id: string;
    bus_id: string;
    reason: string;
    discarded_by: string;
  }) {
    this.send('send_notification', {
      title: "Reallocation Request Discarded",
      message: `Your reallocation request for bus ${discardData.bus_id} has been discarded. Reason: ${discardData.reason}`,
      notification_type: "REALLOCATION_REQUEST_DISCARDED",
      target_user_ids: [], // Will be filled by backend based on request
      related_entity: {
        entity_type: "reallocation_request",
        request_id: discardData.request_id,
        bus_id: discardData.bus_id,
        priority: "NORMAL"
      }
    })
  }

  // Send route reallocation notification
  public sendRouteReallocationNotification(reallocationData: {
    bus_id: string;
    old_route_id: string;
    new_route_id: string;
    reallocated_by: string;
  }) {
    this.send('send_notification', {
      title: "Bus Route Reallocated",
      message: `Bus ${reallocationData.bus_id} has been reallocated from ${reallocationData.old_route_id} to ${reallocationData.new_route_id}`,
      notification_type: "ROUTE_REALLOCATION",
      target_roles: ["BUS_DRIVER", "QUEUE_REGULATOR"],
      related_entity: {
        entity_type: "route_reallocation",
        bus_id: reallocationData.bus_id,
        route_id: reallocationData.new_route_id,
        priority: "HIGH"
      }
    })
  }

  // Chat functionality
  public joinConversation(conversationId: string) {
    this.send('join_conversation', { conversation_id: conversationId })
  }

  public sendTypingIndicator(conversationId: string, isTyping: boolean) {
    this.send('typing_indicator', {
      conversation_id: conversationId,
      is_typing: isTyping
    })
  }

  public markMessageRead(conversationId: string, messageId: string) {
    this.send('mark_message_read', {
      conversation_id: conversationId,
      message_id: messageId
    })
  }

  // Send chat message directly via WebSocket (if supported by backend)
  public sendChatMessage(conversationId: string, content: string, type: string = 'TEXT') {
    this.send('send_chat_message', {
      conversation_id: conversationId,
      content: content,
      type: type
    })
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
