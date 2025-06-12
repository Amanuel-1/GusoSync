"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page
    router.replace("/login")
  }, [router])

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen bg-[#f4f9fc] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0097fb] mx-auto mb-4"></div>
        <p className="text-[#7d7d7d]">Redirecting to login...</p>
      </div>
    </div>
  )
}
