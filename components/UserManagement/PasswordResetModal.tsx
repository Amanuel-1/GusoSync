"use client"

import React, { useState } from 'react';
import { X, Key, Copy, Check, AlertTriangle, Mail } from 'lucide-react';
import { type User } from '@/services/userService';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<{ success: boolean; newPassword?: string; message?: string }>;
  user: User | null;
}

export default function PasswordResetModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  user 
}: PasswordResetModalProps) {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'confirm' | 'success'>('confirm');

  const handleReset = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      const result = await onConfirm(user.id);
      
      if (result.success && result.newPassword) {
        setNewPassword(result.newPassword);
        setStep('success');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = async () => {
    if (newPassword) {
      try {
        await navigator.clipboard.writeText(newPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy password:', error);
      }
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setNewPassword(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-[#103a5e] flex items-center gap-2">
            <Key size={20} />
            Reset Password
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'confirm' ? (
            <>
              {/* Confirmation Step */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="text-orange-600" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Reset Password for {user.first_name} {user.last_name}?
                </h3>
                <p className="text-gray-600 text-sm">
                  This will generate a new password and send it to the user's email address. 
                  The current password will no longer work.
                </p>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={`${user.first_name} ${user.last_name}`}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 bg-[#0097fb] rounded-full flex items-center justify-center ${user.profile_image ? 'hidden' : ''}`}>
                    <span className="text-white font-medium">
                      {user.first_name[0]}{user.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      {user.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Success Step */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="text-green-600" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Password Reset Successfully
                </h3>
                <p className="text-gray-600 text-sm">
                  A new password has been generated and sent to the user's email address.
                </p>
              </div>

              {/* New Password Display */}
              {newPassword && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 font-mono text-sm">
                      {newPassword}
                    </div>
                    <button
                      onClick={handleCopyPassword}
                      className="px-3 py-2 bg-[#0097fb] text-white rounded-md hover:bg-[#0088e2] transition-colors flex items-center gap-1"
                      title="Copy password"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    The password has also been sent to {user.email}
                  </p>
                </div>
              )}

              {/* Email Notification */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="text-blue-600 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Email Sent
                    </p>
                    <p className="text-xs text-blue-700">
                      The new password has been sent to {user.email}. 
                      The user should check their inbox and spam folder.
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="w-full px-4 py-2 bg-[#0097fb] text-white rounded-md hover:bg-[#0088e2] transition-colors"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
