"use client"

import { useEffect, useState } from "react"

// This would be replaced with an actual socket.io client in production
export class SocketService {
  private static instance: SocketService
  private callbacks: Record<string, Function[]> = {}
  private connected = false
  private reconnectTimer: NodeJS.Timeout | null = null

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
