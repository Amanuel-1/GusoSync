"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"
import { authService } from "../../../services/authService"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for error parameters in URL
    const errorParam = searchParams.get('error')
    if (errorParam === 'unauthorized') {
      setError("Access denied. Only control staff and administrators can access the control system.")
    } else if (errorParam === 'authentication_required') {
      setError("Please sign in to access the control system.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Use the updated authService.login method that uses the direct API endpoint
      const result = await authService.login({ email, password });

      if (result.success) {
        console.log('Login successful:', result.data);

        // Check if user has permission to access control system
        if (!authService.canAccessControlSystem()) {
          await authService.logout();
          setError("Access denied. Only control staff and administrators can access the control system.");
          return;
        }

        router.push("/dashboard"); // Redirect to dashboard
      } else {
        setError(result.message || "An error occurred during login. Please try again.");
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9fc] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#103a5e]">Welcome Back</h1>
          <p className="text-[#7d7d7d] mt-2">Sign in to access your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-6 p-3 bg-[#fff3ee] border border-[#ff8a00] rounded-md">
              <div className="flex items-center">
                <AlertCircle className="text-[#ff8a00] mr-2" size={16} />
                <p className="text-sm text-[#ff8a00]">{error}</p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-[#103a5e] mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-[#103a5e]">
                Password
              </label>
              <Link href="/forgot-password/request" className="text-xs text-[#0097fb] hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7d7d7d]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0097fb] text-white py-2 rounded-md hover:bg-[#0088e2] transition-colors disabled:bg-[#7d7d7d]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#7d7d7d]">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#0097fb] hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
