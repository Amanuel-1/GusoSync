'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { confirmPasswordReset } from '@/services/authService'; // Assuming authService exists and will be updated

export default function ConfirmPasswordResetPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      toast({
        title: 'Error',
        description: 'Password reset token is missing.',
        variant: 'destructive',
      });
      // Optionally redirect to the request page or an error page
      // router.push('/forgot-password/request');
    }
  }, [searchParams, toast, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
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
      router.push('/login'); // Redirect to login page after successful reset
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during password reset confirmation.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Confirm Password Reset</CardTitle>
          <CardDescription>Enter your new password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !token}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
