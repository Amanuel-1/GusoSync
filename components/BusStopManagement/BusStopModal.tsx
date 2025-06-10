"use client"

import React, { useState, useEffect } from 'react';
import { X, MapPin, Settings } from 'lucide-react';
import { type BusStop, type CreateBusStopRequest, type UpdateBusStopRequest } from '@/types/busStop';

interface BusStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (busStopData: CreateBusStopRequest | UpdateBusStopRequest) => Promise<{ success: boolean; message?: string }>;
  busStop?: BusStop | null;
  mode: 'create' | 'edit';
}

export default function BusStopModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  busStop, 
  mode 
}: BusStopModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    latitude: 0,
    longitude: 0,
    capacity: 50,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or bus stop changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && busStop) {
        setFormData({
          name: busStop.name || '',
          latitude: busStop.location?.latitude || 0,
          longitude: busStop.location?.longitude || 0,
          capacity: busStop.capacity || 50,
          is_active: busStop.is_active ?? true,
        });
      } else {
        setFormData({
          name: '',
          latitude: 0,
          longitude: 0,
          capacity: 50,
          is_active: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, busStop]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Bus stop name is required';
    }

    if (formData.latitude === 0) {
      newErrors.latitude = 'Latitude is required';
    }

    if (formData.longitude === 0) {
      newErrors.longitude = 'Longitude is required';
    }

    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const busStopData = {
        name: formData.name.trim(),
        location: {
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
        capacity: formData.capacity,
        is_active: formData.is_active,
      };

      const result = await onSubmit(busStopData);
      
      if (result.success) {
        onClose();
      } else {
        setErrors({ submit: result.message || 'Failed to save bus stop' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <MapPin className="text-[#0097fb]" size={24} />
            <h2 className="text-xl font-semibold text-[#103a5e]">
              {mode === 'create' ? 'Add New Bus Stop' : 'Edit Bus Stop'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-[#103a5e] mb-4 flex items-center gap-2">
                <Settings size={18} />
                Basic Information
              </h3>
            </div>

            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#103a5e] mb-2">
                Bus Stop Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter bus stop name"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-[#103a5e] mb-2">
                Latitude *
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.latitude ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="9.0105"
              />
              {errors.latitude && <p className="text-red-600 text-sm mt-1">{errors.latitude}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#103a5e] mb-2">
                Longitude *
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.longitude ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="38.7891"
              />
              {errors.longitude && <p className="text-red-600 text-sm mt-1">{errors.longitude}</p>}
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-[#103a5e] mb-2">
                Capacity
              </label>
              <input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 50 })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.capacity ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="50"
              />
              {errors.capacity && <p className="text-red-600 text-sm mt-1">{errors.capacity}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#103a5e] mb-2">
                Status
              </label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#0097fb] text-white rounded-md hover:bg-[#0088e2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (mode === 'create' ? 'Create Bus Stop' : 'Update Bus Stop')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
