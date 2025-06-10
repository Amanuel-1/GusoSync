"use client"

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, User, Mail, Phone, Shield, Calendar } from 'lucide-react';
import { approvalService, type PendingRegistration } from '@/services/approvalService';
import { showToast } from '@/lib/toast';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApprovalModal({ isOpen, onClose }: ApprovalModalProps) {
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<PendingRegistration | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch pending registrations
  const fetchPendingRegistrations = async () => {
    setLoading(true);
    try {
      const response = await approvalService.getPendingRegistrations('PENDING');
      if (response.success && response.data) {
        // Filter only pending registrations
        const pendingOnly = response.data.filter(reg => reg.status === 'PENDING');
        setPendingRegistrations(pendingOnly);
      } else {
        console.error('Error fetching pending registrations:', response.message);
        setPendingRegistrations([]);
      }
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
      setPendingRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPendingRegistrations();
    }
  }, [isOpen]);

  const handleApprove = async (registration: PendingRegistration, reviewNotes?: string) => {
    try {
      const response = await approvalService.approveRegistration(registration.id, undefined, reviewNotes);

      if (response.success) {
        // Remove from pending list since it's no longer pending
        setPendingRegistrations(prev => prev.filter(r => r.id !== registration.id));
        showToast.success(
          'Registration Approved',
          `${registration.first_name} ${registration.last_name} has been approved and activated.`
        );
      } else {
        showToast.error('Approval Failed', response.message || 'Failed to approve registration. Please try again.');
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      showToast.error('Approval Failed', 'Failed to approve registration. Please try again.');
    }
  };

  const handleReject = async (registration: PendingRegistration, reviewNotes?: string) => {
    if (window.confirm(`Are you sure you want to reject ${registration.first_name} ${registration.last_name}'s registration?`)) {
      try {
        const response = await approvalService.rejectRegistration(registration.id, reviewNotes);

        if (response.success) {
          // Remove from pending list since it's no longer pending
          setPendingRegistrations(prev => prev.filter(r => r.id !== registration.id));
          showToast.success(
            'Registration Rejected',
            `${registration.first_name} ${registration.last_name}'s registration has been rejected.`
          );
        } else {
          showToast.error('Rejection Failed', response.message || 'Failed to reject registration. Please try again.');
        }
      } catch (error) {
        console.error('Error rejecting registration:', error);
        showToast.error('Rejection Failed', 'Failed to reject registration. Please try again.');
      }
    }
  };

  const handleViewDetails = (registration: PendingRegistration) => {
    setSelectedRegistration(registration);
    setShowDetails(true);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'CONTROL_STAFF':
        return 'Control Staff';
      case 'BUS_DRIVER':
        return 'Bus Driver';
      case 'QUEUE_REGULATOR':
        return 'Queue Regulator';
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Clock className="text-orange-500" size={24} />
            <h2 className="text-xl font-semibold text-[#103a5e]">
              Pending Registrations ({pendingRegistrations.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0097fb] mx-auto mb-4"></div>
                <p className="text-[#7d7d7d]">Loading pending registrations...</p>
              </div>
            </div>
          ) : pendingRegistrations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <p className="text-[#7d7d7d] mb-2">No pending registrations</p>
                <p className="text-sm text-[#7d7d7d]">All control staff registrations have been processed.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRegistrations.map((registration) => (
                <div key={registration.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {registration.profile_image ? (
                        <img
                          src={registration.profile_image}
                          alt={`${registration.first_name} ${registration.last_name}`}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center ${registration.profile_image ? 'hidden' : ''}`}>
                        <User className="text-orange-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#103a5e]">
                          {registration.first_name} {registration.last_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-[#7d7d7d] mt-1">
                          <div className="flex items-center gap-1">
                            <Mail size={14} />
                            <span>{registration.email}</span>
                          </div>
                          {registration.phone_number && (
                            <div className="flex items-center gap-1">
                              <Phone size={14} />
                              <span>{registration.phone_number}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Shield size={14} />
                            <span>{getRoleDisplayName(registration.role)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#7d7d7d] mt-1">
                          <Calendar size={12} />
                          <span>Submitted: {formatDate(registration.requested_at)}</span>
                          {registration.reviewed_by && (
                            <span className="ml-2">by {registration.reviewed_by}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(registration)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleApprove(registration)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(registration)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetails && selectedRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-[#103a5e]">Registration Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-[#7d7d7d]">Full Name</label>
                  <p className="text-[#103a5e]">{selectedRegistration.first_name} {selectedRegistration.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#7d7d7d]">Email</label>
                  <p className="text-[#103a5e]">{selectedRegistration.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#7d7d7d]">Phone Number</label>
                  <p className="text-[#103a5e]">{selectedRegistration.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#7d7d7d]">Role</label>
                  <p className="text-[#103a5e]">{getRoleDisplayName(selectedRegistration.role)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#7d7d7d]">Submitted</label>
                  <p className="text-[#103a5e]">{formatDate(selectedRegistration.requested_at)}</p>
                </div>
                {selectedRegistration.reviewed_by && (
                  <div>
                    <label className="text-sm font-medium text-[#7d7d7d]">Reviewed By</label>
                    <p className="text-[#103a5e]">{selectedRegistration.reviewed_by}</p>
                  </div>
                )}
                {selectedRegistration.review_notes && (
                  <div>
                    <label className="text-sm font-medium text-[#7d7d7d]">Review Notes</label>
                    <p className="text-[#103a5e]">{selectedRegistration.review_notes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 p-4 border-t">
                <button
                  onClick={() => {
                    handleApprove(selectedRegistration);
                    setShowDetails(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedRegistration);
                    setShowDetails(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
