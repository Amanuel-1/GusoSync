"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bell, Mail, X, Check, AlertTriangle, Info } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { authService, User } from "@/services/authService" // Import authService and User type
import { Toaster } from "@/components/ui/sonner"
// No CSS import needed here

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showUserPopup, setShowUserPopup] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showInbox, setShowInbox] = useState(false)
  const [user, setUser] = useState<User | null>(null); // State to hold user data
  const [loading, setLoading] = useState(true); // Add loading state
  const pathname = usePathname()
  const router = useRouter(); // Get router instance

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "Bus A245 Delayed",
      message: "Bus A245 is delayed by 15 minutes due to traffic",
      time: "2 minutes ago",
      read: false
    },
    {
      id: 2,
      type: "info",
      title: "Route Update",
      message: "Route R-103 has been modified",
      time: "1 hour ago",
      read: true
    },
    {
      id: 3,
      type: "warning",
      title: "Low Fuel Alert",
      message: "Bus B112 is running low on fuel",
      time: "3 hours ago",
      read: false
    }
  ]

  // Sample inbox messages
  const messages = [
    {
      id: 1,
      sender: "Route Manager",
      subject: "Route Assignment Update",
      preview: "Your route assignment has been updated for next week...",
      time: "10:30 AM",
      read: false
    },
    {
      id: 2,
      sender: "System Admin",
      subject: "System Maintenance",
      preview: "Scheduled maintenance will occur this weekend...",
      time: "Yesterday",
      read: true
    },
    {
      id: 3,
      sender: "Driver Support",
      subject: "Training Session",
      preview: "New training session available for all drivers...",
      time: "2 days ago",
      read: true
    }
  ]

  useEffect(() => {
    // Function to load user data
    const loadUser = async () => {
      if (!authService.isAuthenticated()) {
        // If not authenticated, redirect to login
        router.push('/login');
        return; // Stop execution
      }

      const fetchedUser = authService.getUser();

      if (fetchedUser) {
        // Check if user has permission to access control system
        if (!authService.canAccessControlSystem()) {
          console.error('User does not have permission to access control system:', fetchedUser.role);
          await authService.logout();
          router.push('/login?error=unauthorized');
          return;
        }
        setUser(fetchedUser);
      } else {
        // If authenticated but no user data in sessionStorage (shouldn't happen if login worked),
        // redirect to login as a fallback
        console.error('Authenticated but no user data found in sessionStorage.');
        await authService.logout();
        router.push('/login');
      }
      setLoading(false); // Set loading to false after auth check and data load attempt
    };

    loadUser();
  }, [router]); // Dependency array includes router

  const handleLogout = async () => {
    await authService.logout(); // This will clear the HTTP-only cookie and sessionStorage
    router.push('/login'); // Redirect to login page after logout
  };


  // Show loading state or redirect if user is null
  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while checking auth
  }

  if (!user) {
     // If not loading but no user, it means the auth check failed or user data is missing/invalid
     // The useEffect should have already redirected, but this is a fallback
     return null; // Or a message indicating authentication failed
  }


  return (
    <div className="flex h-screen w-full bg-[#f4f9fc] overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-20 bg-[#103a5e] flex flex-col items-center">
        <div className="py-6 flex flex-col items-center">
          <div className="text-white font-bold text-2xl mb-8">
            <span className="sr-only">GuzoSync</span>
            <div className="w-10 h-10 bg-white text-[#103a5e] flex items-center justify-center">
              <img src="/image.png" alt="GuzoSync Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="flex flex-col gap-8 items-center">
            <Link
              href="/dashboard"
              className={`flex flex-col items-center text-white ${pathname === "/" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="7" height="7" stroke="white" strokeWidth="2" />
                  <rect x="14" y="3" width="7" height="7" stroke="white" strokeWidth="2" />
                  <rect x="3" y="14" width="7" height="7" stroke="white" strokeWidth="2" />
                  <rect x="14" y="14" width="7" height="7" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-xs mt-1">Dashboard</span>
            </Link>

            <Link
              href="/dashboard/routes"
              className={`flex flex-col items-center text-white ${pathname === "/dashboard/routes" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 6h18M3 12h18M3 18h18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 6v12M15 6v12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xs mt-1">Routes</span>
            </Link>

            <Link
              href="/dashboard/busses"
              className={`flex flex-col items-center text-white ${pathname === "/dashboard/busses" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8 6v6M16 6v6M6 8h12M6 18h12M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="8" cy="20" r="1" stroke="white" strokeWidth="2" />
                  <circle cx="16" cy="20" r="1" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-xs mt-1">Busses</span>
            </Link>

            <Link
              href="/dashboard/analysis"
              className={`flex flex-col items-center text-white ${pathname === "/dashboard/analysisysis" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3M7 16L12 11L16 16L21 11"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xs mt-1">Analysis</span>
            </Link>

            <Link
              href="/dashboard/rra"
              className={`flex flex-col items-center text-white ${pathname === "/dashboard/rra" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 6h18M3 12h18M3 18h18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 4l-2 2 2 2M5 14l2 2-2 2M19 20l-2-2 2-2"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xs mt-1">RRA</span>
            </Link>

            <Link
              href="/dashboard/personnel"
              className={`flex flex-col items-center text-white ${pathname === "/dashboard/personnel" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" />
                  <path
                    d="M22 21v-2a4 4 0 0 0-3-3.87"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 3.13a4 4 0 0 1 0 7.75"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xs mt-1">Personnel</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-[#d9d9d9] bg-white flex items-center justify-between px-6">
          <div className="flex items-center">
            <span className="font-bold text-[#103a5e] text-lg">GuzoSync</span>
            <span className="text-[#7d7d7d] text-xs ml-1">
              Bus Tracking
              <br />
              & Management
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                className="relative"
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowInbox(false)
                }}
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-[#e92c2c] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  2
                </span>
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-medium text-[#103a5e]">Notifications</h3>
                      <button className="text-xs text-[#0097fb]">Mark all as read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? "bg-[#f8f9ff]" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`mt-1 ${
                              notification.type === "alert" ? "text-[#e92c2c]" :
                              notification.type === "warning" ? "text-[#ff8a00]" :
                              "text-[#0097fb]"
                            }`}>
                              {notification.type === "alert" ? <AlertTriangle size={16} /> :
                               notification.type === "warning" ? <AlertTriangle size={16} /> :
                               <Info size={16} />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <span className="text-xs text-[#7d7d7d]">{notification.time}</span>
                              </div>
                              <p className="text-xs text-[#7d7d7d] mt-1">{notification.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100 text-center">
                      <button className="text-xs text-[#0097fb]">View all notifications</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button className="flex items-center gap-2" onClick={() => setShowUserPopup(!showUserPopup)}>
                {(user?.profile_image || user?.photoUrl) ? (
                  <img src={user.profile_image || user.photoUrl} alt={`${user.first_name || user.firstName} ${user.last_name || user.lastName}'s avatar`} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center text-[#103a5e]">
                    {(user?.first_name || user?.firstName) ? (user.first_name || user.firstName)!.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="font-medium">{user ? `${user.first_name || user.firstName} ${user.last_name || user.lastName}` : 'Guest'}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-200 ${showUserPopup ? "rotate-180" : ""}`}
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {showUserPopup && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserPopup(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <div className="font-medium">{user ? `${user.first_name || user.firstName} ${user.last_name || user.lastName}` : 'Guest'}</div>
                      <div className="text-xs text-[#7d7d7d]">{user?.email || 'N/A'}</div> {/* Display email */}
                      <div className="text-xs text-[#7d7d7d]">{user?.role || 'N/A'}</div> {/* Display role */}
                      {user?.phone_number && <div className="text-xs text-[#7d7d7d]">{user.phone_number}</div>} {/* Display phone if available */}
                    </div>
                    <ul>
                      <li>
                        <Link href="/dashboard/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <svg
                            className="mr-2 h-4 w-4 text-[#7d7d7d]"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          Profile
                        </Link>
                      </li>

                      <li>
                        <button onClick={handleLogout} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                          <svg
                            className="mr-2 h-4 w-4 text-[#7d7d7d]"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </div>

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  )
}
