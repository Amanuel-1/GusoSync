"use client"

/**
 * Utility functions for authentication
 */

/**
 * Get auth token from browser cookies (for HTTP-only cookies, this won't work)
 * This function is kept for backward compatibility but will return null
 * for HTTP-only cookies
 */
export function getAuthTokenFromCookies(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'authToken') {
      return decodeURIComponent(value)
    }
  }
  return null
}

/**
 * Get auth token for WebSocket connection from API endpoint
 * This works with HTTP-only cookies
 */
export async function getAuthTokenForWebSocket(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const response = await fetch('/api/auth/websocket-token', {
      method: 'GET',
      credentials: 'include', // Include HTTP-only cookies
    })

    if (response.ok) {
      const data = await response.json()
      return data.token
    } else {
      console.warn('Failed to get WebSocket auth token:', response.status)
      return null
    }
  } catch (error) {
    console.error('Error fetching WebSocket auth token:', error)
    return null
  }
}

/**
 * Check if user is authenticated by checking for auth token
 */
export function isAuthenticated(): boolean {
  return getAuthTokenFromCookies() !== null
}

/**
 * Get user data from session storage
 */
export function getUserFromStorage(): any | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const userData = sessionStorage.getItem('currentUser')
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error parsing user data from storage:', error)
    return null
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(role: string): boolean {
  const user = getUserFromStorage()
  return user?.role === role
}

/**
 * Check if user can access control system
 */
export function canAccessControlSystem(): boolean {
  const user = getUserFromStorage()
  return user?.role === 'CONTROL_ADMIN' || user?.role === 'CONTROL_STAFF'
}
