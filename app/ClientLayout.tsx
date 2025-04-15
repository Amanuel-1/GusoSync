"use client"

import type React from "react"

import { useState } from "react"
import { Bell, Mail } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
// No CSS import needed here

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showUserPopup, setShowUserPopup] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-full bg-[#f4f9fc] overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-20 bg-[#103a5e] flex flex-col items-center">
        <div className="py-6 flex flex-col items-center">
          <div className="text-white font-bold text-2xl mb-8">
            <span className="sr-only">PMD</span>
            <div className="w-10 h-10 bg-white text-[#103a5e] flex items-center justify-center font-bold">PMD</div>
          </div>

          <div className="flex flex-col gap-8 items-center">
            <Link
              href="/"
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
              href="/insights"
              className={`flex flex-col items-center text-white ${pathname === "/insights" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 12L6 6L10 18L14 9L18 15L21 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xs mt-1">Insights</span>
            </Link>

            <Link
              href="/history"
              className={`flex flex-col items-center text-white ${pathname === "/history" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 8V12L15 15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-xs mt-1">History</span>
            </Link>

            <Link
              href="/analysis"
              className={`flex flex-col items-center text-white ${pathname === "/analysis" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
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
              href="/rra"
              className={`flex flex-col items-center text-white ${pathname === "/rra" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
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
              href="/users"
              className={`flex flex-col items-center text-white ${pathname === "/users" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" />
                  <path
                    d="M20 19C20 16.2386 16.4183 14 12 14C7.58172 14 4 16.2386 4 19"
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <span className="text-xs mt-1">Users</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-[#d9d9d9] bg-white flex items-center justify-between px-6">
          <div className="flex items-center">
            <span className="font-bold text-[#103a5e] text-lg">PMD</span>
            <span className="text-[#7d7d7d] text-xs ml-1">
              Professional
              <br />
              Monitoring Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-[#e92c2c] text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Police Helpline
            </button>

            <div className="relative">
              <button className="relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-[#e92c2c] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  2
                </span>
              </button>
            </div>

            <div className="relative">
              <button className="relative">
                <Mail size={20} />
                <span className="absolute -top-1 -right-1 bg-[#e92c2c] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>

            <div className="relative">
              <button className="flex items-center gap-2" onClick={() => setShowUserPopup(!showUserPopup)}>
                <div className="w-8 h-8 rounded-full bg-[#f1f1f1] flex items-center justify-center text-[#103a5e]">
                  P
                </div>
                <span className="font-medium">John Doe</span>
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
                      <div className="font-medium">John Doe</div>
                      <div className="text-xs text-[#7d7d7d]">Administrator</div>
                    </div>
                    <ul>
                      <li>
                        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
                        </a>
                      </li>
                      <li>
                        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                          Edit Account
                        </a>
                      </li>
                      <li>
                        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
                        </a>
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
    </div>
  )
}
