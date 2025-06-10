"use client"

import React from 'react';
import { X, MapPin, Clock, Calendar, Settings, Activity, Users } from 'lucide-react';
import { type BusStop } from '@/types/busStop';

interface BusStopDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  busStop: BusStop | null;
}

export default function BusStopDetailsModal({ 
  isOpen, 
  onClose, 
  busStop 
}: BusStopDetailsModalProps) {
  if (!isOpen || !busStop) return null;

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <MapPin className="text-[#0097fb]" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-[#103a5e]">{busStop.name}</h2>
              <p className="text-sm text-[#7d7d7d]">Bus Stop Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[#103a5e] mb-2 flex items-center gap-2">
                  <Settings size={16} />
                  Basic Information
                </h3>
                <div className="bg-[#f9f9f9] p-4 rounded-md space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#7d7d7d]">Status:</span>
                    <span className={`px-2 py-1 text-xs rounded-md ${getStatusColor(busStop.is_active)}`}>
                      {busStop.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d7d7d]">Bus Stop ID:</span>
                    <span className="text-sm font-medium">{busStop.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d7d7d]">Capacity:</span>
                    <span className="text-sm font-medium">{busStop.capacity || 'N/A'} passengers</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[#103a5e] mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Timestamps
                </h3>
                <div className="bg-[#f9f9f9] p-4 rounded-md space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d7d7d]">Created:</span>
                    <span className="text-sm font-medium">{formatDate(busStop.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d7d7d]">Last Updated:</span>
                    <span className="text-sm font-medium">{formatDate(busStop.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#103a5e] mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Location Information
            </h3>
            <div className="bg-[#f9f9f9] p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-sm text-[#7d7d7d]">Latitude:</span>
                  <span className="text-sm font-medium font-mono">
                    {formatCoordinate(busStop.location.latitude)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#7d7d7d]">Longitude:</span>
                  <span className="text-sm font-medium font-mono">
                    {formatCoordinate(busStop.location.longitude)}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm text-[#7d7d7d]">Coordinates:</span>
                  <span className="text-sm font-medium font-mono">
                    {formatCoordinate(busStop.location.latitude)}, {formatCoordinate(busStop.location.longitude)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#103a5e] mb-2 flex items-center gap-2">
              <Activity size={16} />
              Additional Information
            </h3>
            <div className="bg-[#f9f9f9] p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-sm text-[#7d7d7d]">Operational Status:</span>
                  <span className="text-sm font-medium">
                    {busStop.is_active ? 'Operational' : 'Out of Service'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#7d7d7d]">Passenger Capacity:</span>
                  <span className="text-sm font-medium">
                    {busStop.capacity ? `${busStop.capacity} passengers` : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Preview Placeholder */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#103a5e] mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Location Preview
            </h3>
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">Map preview would be displayed here</p>
              <p className="text-gray-400 text-xs mt-1">
                Coordinates: {formatCoordinate(busStop.location.latitude)}, {formatCoordinate(busStop.location.longitude)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0097fb] text-white rounded-md hover:bg-[#0088e2] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
