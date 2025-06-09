"use client"

import React from 'react';
import { X, MapPin, Clock, Route as RouteIcon, Calendar, Activity, Navigation } from 'lucide-react';
import { type RouteData } from '@/hooks/useRouteManagementAPI';

interface RouteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteData | null;
}

export default function RouteDetailsModal({
  isOpen,
  onClose,
  route
}: RouteDetailsModalProps) {
  if (!isOpen || !route) return null;

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

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <RouteIcon className="text-[#0097fb]" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-[#103a5e]">{route.name}</h2>
              <p className="text-sm text-[#7d7d7d]">Route Details</p>
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
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(route.is_active)}`}>
              <Activity size={14} className="inline mr-1" />
              {route.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-[#103a5e] mb-3">Route Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-[#7d7d7d]">Route Name</label>
                    <p className="text-[#103a5e] font-medium">{route.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#7d7d7d]">Route ID</label>
                    <p className="text-[#103a5e] font-mono text-sm">{route.id}</p>
                  </div>
                  {route.description && (
                    <div>
                      <label className="text-sm font-medium text-[#7d7d7d]">Description</label>
                      <p className="text-[#103a5e]">{route.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-[#103a5e] mb-3">Route Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Navigation size={16} className="text-[#7d7d7d]" />
                    <div>
                      <label className="text-sm font-medium text-[#7d7d7d]">Total Distance</label>
                      <p className="text-[#103a5e] font-medium">
                        {route.total_distance ? `${route.total_distance.toFixed(1)} km` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#7d7d7d]" />
                    <div>
                      <label className="text-sm font-medium text-[#7d7d7d]">Estimated Duration</label>
                      <p className="text-[#103a5e] font-medium">{formatDuration(route.estimated_duration || undefined)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#7d7d7d]" />
                    <div>
                      <label className="text-sm font-medium text-[#7d7d7d]">Number of Stops</label>
                      <p className="text-[#103a5e] font-medium">{route.stop_ids?.length || 0} stops</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bus Stops */}
          <div>
            <h3 className="text-lg font-medium text-[#103a5e] mb-3">
              Bus Stops ({route.stop_ids?.length || 0})
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {route.stop_ids && route.stop_ids.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {route.stop_ids.map((stopId, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded border">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-[#0097fb] text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-[#7d7d7d]" />
                          <span className="text-[#103a5e] font-medium text-sm">{stopId}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="mx-auto h-12 w-12 text-[#7d7d7d] mb-4" />
                  <p className="text-[#7d7d7d]">No stops defined for this route</p>
                </div>
              )}
            </div>
          </div>

          {/* Route Performance */}
          <div>
            <h3 className="text-lg font-medium text-[#103a5e] mb-3">Route Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="text-blue-600" size={20} />
                  <span className="text-sm font-medium text-blue-800">Avg Speed</span>
                </div>
                <p className="text-xl font-semibold text-blue-900">
                  {route.total_distance && route.estimated_duration
                    ? `${(route.total_distance / (route.estimated_duration / 60)).toFixed(1)} km/h`
                    : 'N/A'
                  }
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-green-800">Avg Distance/Stop</span>
                </div>
                <p className="text-xl font-semibold text-green-900">
                  {route.total_distance && route.stop_ids?.length
                    ? `${(route.total_distance / route.stop_ids.length).toFixed(2)} km`
                    : 'N/A'
                  }
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-purple-600" size={20} />
                  <span className="text-sm font-medium text-purple-800">Avg Time/Stop</span>
                </div>
                <p className="text-xl font-semibold text-purple-900">
                  {route.estimated_duration && route.stop_ids?.length
                    ? `${Math.round(route.estimated_duration / route.stop_ids.length)} min`
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          {(route.created_at || route.updated_at) && (
            <div>
              <h3 className="text-lg font-medium text-[#103a5e] mb-3">Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {route.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#7d7d7d]" />
                    <div>
                      <label className="text-sm font-medium text-[#7d7d7d]">Created</label>
                      <p className="text-[#103a5e]">{formatDate(route.created_at)}</p>
                    </div>
                  </div>
                )}
                {route.updated_at && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#7d7d7d]" />
                    <div>
                      <label className="text-sm font-medium text-[#7d7d7d]">Last Updated</label>
                      <p className="text-[#103a5e]">{formatDate(route.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
