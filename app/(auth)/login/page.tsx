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

        <div className="mt-8 pt-6 border-t border-[#f1f1f1]">
          <div className="flex justify-center space-x-4">
            <button className="flex items-center justify-center w-12 h-12 rounded-full border border-[#d9d9d9] hover:bg-[#f9f9f9] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
                  fill="#333"
                />
              </svg>
            </button>
            <button className="flex items-center justify-center w-12 h-12 rounded-full border border-[#d9d9d9] hover:bg-[#f9f9f9] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M23.766 12.2764c0-.9183-.076-1.8044-.235-2.6745h-11.49v5.0578h6.6439c-.2856 1.5356-1.1539 2.8395-2.4576 3.7133v3.0883h3.9826c2.3329-2.1478 3.6745-5.3113 3.6745-9.1849z"
                  fill="#4285F4"
                />
                <path
                  d="M12.0411 24c3.3323 0 6.1238-1.0966 8.1673-2.9752l-3.9826-3.0884c-1.1051.7399-2.5216 1.1795-4.1847 1.1795-3.2173 0-5.9392-2.1737-6.9103-5.0956H1.0769v3.1917C3.1248 21.2878 7.3293 24 12.0411 24z"
                  fill="#34A853"
                />
                <path
                  d="M5.1308 14.0139c-.2489-.7399-.3905-1.5285-.3905-2.3396 0-.8112.1416-1.5998.3905-2.3397V6.3429H1.0769C.3861 8.0099 0 9.8393 0 11.6743c0 1.835.3861 3.6644 1.0769 5.3314l4.0539-3.1918z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0411 4.6647c1.8138 0 3.4429.6231 4.7246 1.8414l3.5313-3.5313C18.1769 1.1324 15.3854 0 12.0411 0 7.3293 0 3.1248 2.7122 1.0769 6.3429l4.0539 3.1917c.9711-2.9219 3.693-5.0699 6.9103-5.0699z"
                  fill="#EA4335"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
