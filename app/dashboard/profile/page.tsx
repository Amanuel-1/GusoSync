'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react'
import { authService, User as AuthUser } from '@/services/authService'

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)

      // First try to get user from sessionStorage (like dashboard layout does)
      const cachedUser = authService.getUser()
      if (cachedUser) {
        setUser(cachedUser)
        setLoading(false)
        return
      }

      // If no cached user, fetch from API
      const fetchedUser = await authService.getCurrentUser()

      if (fetchedUser) {
        setUser(fetchedUser)
      } else {
        setError('Failed to load profile')
      }
    } catch (err) {
      console.error('Error in fetchUserData:', err)
      setError('An error occurred while loading your profile')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'PASSENGER': 'Passenger',
      'BUS_DRIVER': 'Bus Driver',
      'QUEUE_REGULATOR': 'Queue Regulator',
      'CONTROL_CENTER_ADMIN': 'Control Center Admin',
      'REGULATOR': 'Regulator'
    }
    return roleMap[role] || role
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f4f9fc] h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0097fb] mx-auto"></div>
          <p className="mt-4 text-[#7d7d7d]">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f4f9fc] h-full">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button 
            onClick={fetchUserData}
            className="bg-[#0097fb] text-white px-4 py-2 rounded-md hover:bg-[#0088e2] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f4f9fc] h-full">
        <div className="text-center">
          <p className="text-[#7d7d7d]">No profile data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#f4f9fc] h-full">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-[#103a5e]">My Profile</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Profile Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#f1f1f1] flex items-center justify-center text-[#103a5e] text-2xl font-medium">
                    {user.first_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white ${
                  user.is_active ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              <div>
                <h2 className="text-xl font-medium text-[#103a5e]">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-[#7d7d7d] flex items-center gap-2 mt-1">
                  <Shield size={16} />
                  {getRoleDisplayName(user.role)}
                </p>
                <p className="text-sm text-[#7d7d7d] mt-1">
                  Status: {user.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-[#103a5e] mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f1f1f1] flex items-center justify-center">
                  <Mail size={18} className="text-[#103a5e]" />
                </div>
                <div>
                  <p className="text-sm text-[#7d7d7d]">Email Address</p>
                  <p className="font-medium text-[#103a5e]">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f1f1f1] flex items-center justify-center">
                  <Phone size={18} className="text-[#103a5e]" />
                </div>
                <div>
                  <p className="text-sm text-[#7d7d7d]">Phone Number</p>
                  <p className="font-medium text-[#103a5e]">{user.phone_number}</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium text-[#103a5e] mb-4 mt-8">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f1f1f1] flex items-center justify-center">
                  <Calendar size={18} className="text-[#103a5e]" />
                </div>
                <div>
                  <p className="text-sm text-[#7d7d7d]">Member Since</p>
                  <p className="font-medium text-[#103a5e]">{formatDate(user.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f1f1f1] flex items-center justify-center">
                  <User size={18} className="text-[#103a5e]" />
                </div>
                <div>
                  <p className="text-sm text-[#7d7d7d]">User ID</p>
                  <p className="font-medium text-[#103a5e] font-mono text-sm">{user.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
