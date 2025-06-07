"use client"

import React from 'react';
import { X, MapPin, Clock, Route as RouteIcon, Calendar, Activity } from 'lucide-react';
import { type BusRoute } from '@/services/routeService';

interface RouteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: BusRoute | null;
}

export default function RouteDetailsModal({ 
  isOpen, 
  onClose, 
  route 
}: RouteDetailsModalProps) {
  
  if (!isOpen || !route) return null;

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(2)} km`;
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.round(duration);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
            <span className={`px-3 py-1 text-sm rounded-full ${
              route.is_active !== false
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}>
              <Activity size={14} className="inline mr-1" />
              {route.is_active !== false ? 'Active' : 'Inactive'}
            </span>
            <span className={`px-3 py-1 text-sm rounded-full ${
              route.expectedLoad === 'High' || route.expectedLoad === 'Very High'
                ? "bg-red-100 text-red-800"
                : route.expectedLoad === 'Medium'
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}>
              Load: {route.expectedLoad}
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
                    <label className="text-sm font-medium text-[#7d7d7d]">Route Path</label>
                    <p className="text-[#103a5e]">{route.start} → {route.destination}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#7d7d7d]">Via</label>
                    <p className="text-[#103a5e]">{route.passBy.join(', ') || 'Direct route'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#7d7d7d]">Route ID</label>
                    <p className="text-[#103a5e] font-mono text-sm">{route.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#7d7d7d]">Route Color</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: route.color }}
                      ></div>
                      <span className="text-[#103a5e] font-mono text-sm">{route.color}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-[#103a5e] mb-3">Route Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#7d7d7d]" />
                    <div>
                      <label className="text-sm font-medium text-[#7d7d7d]">Total Distance</label>
                      <p className="text-[#103a5e] font-medium">{formatDistance(route.distance)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#7d7d7d]" />
                    <div>
                      <label className="text-sm font-medium text-[#7d7d7d]">Estimated Duration</label>
                      <p className="text-[#103a5e] font-medium">~{Math.round(route.distance * 4)}m</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#7d7d7d]" />
                    <div>
                      <label className="text-sm font-medium text-[#7d7d7d]">Number of Stops</label>
                      <p className="text-[#103a5e] font-medium">{route.stops} stops</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div>
                      <label className="text-sm font-medium text-[#7d7d7d]">Active Buses</label>
                      <p className="text-[#103a5e] font-medium">{route.activeBuses} buses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Route Path */}
          <div>
            <h3 className="text-lg font-medium text-[#103a5e] mb-3">Route Path</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {/* Start */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      S
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#7d7d7d]" />
                      <span className="text-[#103a5e] font-medium">Start</span>
                    </div>
                    <p className="text-sm text-[#7d7d7d]">{route.start}</p>
                  </div>
                </div>

                {/* Pass By locations */}
                {route.passBy.map((location, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-[#0097fb] text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#7d7d7d]" />
                        <span className="text-[#103a5e] font-medium">Via</span>
                      </div>
                      <p className="text-sm text-[#7d7d7d]">{location}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-6 h-0.5 bg-[#d9d9d9]"></div>
                    </div>
                  </div>
                ))}

                {/* Destination */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      D
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#7d7d7d]" />
                      <span className="text-[#103a5e] font-medium">Destination</span>
                    </div>
                    <p className="text-sm text-[#7d7d7d]">{route.destination}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Regulator Information */}
          <div>
            <h3 className="text-lg font-medium text-[#103a5e] mb-3">Queue Regulator</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#7d7d7d]">Regulator Name</label>
                  <p className="text-[#103a5e] font-medium">{route.regulatorName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#7d7d7d]">Contact Number</label>
                  <p className="text-[#103a5e] font-medium">{route.regulatorPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Route Statistics */}
          <div>
            <h3 className="text-lg font-medium text-[#103a5e] mb-3">Route Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-blue-600" size={20} />
                  <span className="text-sm font-medium text-blue-800">Average Distance per Stop</span>
                </div>
                <p className="text-xl font-semibold text-blue-900">
                  {formatDistance(route.distance / Math.max(route.stops - 1, 1))}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-green-800">Average Time per Stop</span>
                </div>
                <p className="text-xl font-semibold text-green-900">
                  ~{Math.round((route.distance * 4) / Math.max(route.stops - 1, 1))}m
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <RouteIcon className="text-purple-600" size={20} />
                  <span className="text-sm font-medium text-purple-800">Average Speed</span>
                </div>
                <p className="text-xl font-semibold text-purple-900">
                  {(route.distance / (route.distance * 4 / 60) || 0).toFixed(1)} km/h
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
