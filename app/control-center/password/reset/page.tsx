"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { confirmPasswordReset } from "@/services/authService";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordResetPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract token from URL
    const resetToken = searchParams.get("token");
    console.log("Token from URL:", resetToken);
    
    if (resetToken) {
      setToken(resetToken);
    } else {
      toast({
        title: "Error",
        description: "Password reset token is missing.",
        variant: "destructive",
      });
      // Redirect to login page if token is missing
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  }, [searchParams, toast, router]);

  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    
    // Add more password validation rules if needed
    // For example:
    // if (!/[A-Z]/.test(password)) {
    //   setPasswordError('Password must contain at least one uppercase letter');
    //   return false;
    // }
    
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset any previous errors
    setPasswordError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    // Validate password strength
    if (!validatePassword(password)) {
      toast({
        title: 'Error',
        description: passwordError || 'Password does not meet requirements.',
        variant: 'destructive',
      });
      return;
    }

    if (!token) {
      toast({
        title: 'Error',
        description: 'Password reset token is missing.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(token, password);
      toast({
        title: 'Success',
        description: 'Your password has been reset successfully.',
      });
      // Redirect to login page after successful reset
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during password reset.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9fc] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#103a5e]">Reset Your Password</h1>
          <p className="text-[#7d7d7d] mt-2">Enter your new password below to reset your account password.</p>
        </div>
        <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#103a5e] mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (e.target.value) validatePassword(e.target.value);
                  }}
                  className={`w-full border border-[#d9d9d9] rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${passwordError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-[#103a5e] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full border border-[#d9d9d9] rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${password !== confirmPassword && confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password !== confirmPassword && confirmPassword && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-[#0097fb] text-white py-2 rounded-md hover:bg-[#0088e2] transition-colors disabled:bg-[#7d7d7d] mt-6" 
              disabled={loading}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-[#7d7d7d]">
            Remember your password?{" "}
            <a href="/login" className="text-[#0097fb] hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
