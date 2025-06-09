"use client"

import React from 'react';
import { X, Bus, MapPin, Clock, Calendar, Settings, Activity } from 'lucide-react';
import { type BusData } from '@/hooks/useBusManagementAPI';

interface BusDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bus: BusData | null;
}

export default function BusDetailsModal({ 
  isOpen, 
  onClose, 
  bus 
}: BusDetailsModalProps) {
  if (!isOpen || !bus) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'bg-green-100 text-green-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'BREAKDOWN':
        return 'bg-red-100 text-red-800';
      case 'IDLE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBusTypeLabel = (type: string) => {
    switch (type) {
      case 'STANDARD':
        return 'Standard Bus';
      case 'ARTICULATED':
        return 'Articulated Bus';
      case 'MINIBUS':
        return 'Minibus';
      default:
        return type;
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Bus className="text-[#0097fb]" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-[#103a5e]">{bus.license_plate}</h2>
              <p className="text-sm text-[#7d7d7d]">Bus Details</p>
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
                    <span className={`px-2 py-1 text-xs rounded-md ${getStatusColor(bus.bus_status)}`}>
                      {bus.bus_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d7d7d]">Bus Type:</span>
                    <span className="text-sm font-medium">{getBusTypeLabel(bus.bus_type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d7d7d]">Capacity:</span>
                    <span className="text-sm font-medium">{bus.capacity} passengers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d7d7d]">License Plate:</span>
                    <span className="text-sm font-medium">{bus.license_plate}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[#103a5e] mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Vehicle Details
                </h3>
                <div className="bg-[#f9f9f9] p-4 rounded-md space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d7d7d]">Manufacture Year:</span>
                    <span className="text-sm font-medium">{bus.manufacture_year || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d7d7d]">Bus Model:</span>
                    <span className="text-sm font-medium">{bus.bus_model || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d7d7d]">Bus ID:</span>
                    <span className="text-sm font-medium">{bus.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Information */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[#103a5e] mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Assignment Information
            </h3>
            <div className="bg-[#f9f9f9] p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-sm text-[#7d7d7d]">Assigned Route:</span>
                  <span className="text-sm font-medium">
                    {bus.assigned_route_id || 'Not assigned'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#7d7d7d]">Assigned Driver:</span>
                  <span className="text-sm font-medium">
                    {bus.assigned_driver_id || 'Not assigned'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          {bus.current_location && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[#103a5e] mb-2 flex items-center gap-2">
                <Activity size={16} />
                Real-time Information
              </h3>
              <div className="bg-[#f9f9f9] p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d7d7d]">Current Location:</span>
                    <span className="text-sm font-medium">
                      {bus.current_location.latitude.toFixed(6)}, {bus.current_location.longitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d7d7d]">Speed:</span>
                    <span className="text-sm font-medium">
                      {bus.speed ? `${bus.speed} km/h` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d7d7d]">Heading:</span>
                    <span className="text-sm font-medium">
                      {bus.heading ? `${bus.heading}°` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#7d7d7d]">Last Update:</span>
                    <span className="text-sm font-medium">
                      {formatDate(bus.last_location_update)}
                    </span>
                  </div>
                </div>
                {bus.current_address && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#7d7d7d]">Current Address:</span>
                      <span className="text-sm font-medium">{bus.current_address}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h3 className="text-sm font-medium text-[#103a5e] mb-2 flex items-center gap-2">
              <Clock size={16} />
              Timestamps
            </h3>
            <div className="bg-[#f9f9f9] p-4 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-sm text-[#7d7d7d]">Created:</span>
                  <span className="text-sm font-medium">{formatDate(bus.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#7d7d7d]">Last Updated:</span>
                  <span className="text-sm font-medium">{formatDate(bus.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
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
