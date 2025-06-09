"use client"

import React, { useState, useEffect } from 'react';
import { X, Bus, Settings, Calendar } from 'lucide-react';
import { type BusData, type CreateBusRequest, type UpdateBusRequest } from '@/hooks/useBusManagementAPI';

interface BusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (busData: CreateBusRequest | UpdateBusRequest) => Promise<{ success: boolean; message?: string }>;
  bus?: BusData | null;
  mode: 'create' | 'edit';
}

export default function BusModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  bus, 
  mode 
}: BusModalProps) {
  const [formData, setFormData] = useState({
    license_plate: '',
    bus_type: 'STANDARD' as "STANDARD" | "ARTICULATED" | "MINIBUS",
    capacity: 50,
    bus_status: 'OPERATIONAL' as "OPERATIONAL" | "MAINTENANCE" | "BREAKDOWN" | "IDLE",
    assigned_route_id: '',
    assigned_driver_id: '',
    manufacture_year: new Date().getFullYear(),
    bus_model: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or bus changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && bus) {
        setFormData({
          license_plate: bus.license_plate || '',
          bus_type: bus.bus_type || 'STANDARD',
          capacity: bus.capacity || 50,
          bus_status: bus.bus_status || 'OPERATIONAL',
          assigned_route_id: bus.assigned_route_id || '',
          assigned_driver_id: bus.assigned_driver_id || '',
          manufacture_year: bus.manufacture_year || new Date().getFullYear(),
          bus_model: bus.bus_model || '',
        });
      } else {
        setFormData({
          license_plate: '',
          bus_type: 'STANDARD',
          capacity: 50,
          bus_status: 'OPERATIONAL',
          assigned_route_id: '',
          assigned_driver_id: '',
          manufacture_year: new Date().getFullYear(),
          bus_model: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, bus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'manufacture_year' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.license_plate.trim()) {
      newErrors.license_plate = 'License plate is required';
    }

    if (formData.capacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    if (formData.manufacture_year < 1900 || formData.manufacture_year > new Date().getFullYear() + 1) {
      newErrors.manufacture_year = 'Please enter a valid manufacture year';
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
      const busData = {
        ...formData,
        assigned_route_id: formData.assigned_route_id || null,
        assigned_driver_id: formData.assigned_driver_id || null,
        manufacture_year: formData.manufacture_year || null,
        bus_model: formData.bus_model || null,
      };

      const result = await onSubmit(busData);
      
      if (result.success) {
        onClose();
      } else {
        setErrors({ submit: result.message || 'Failed to save bus' });
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
            <Bus className="text-[#0097fb]" size={24} />
            <h2 className="text-xl font-semibold text-[#103a5e]">
              {mode === 'create' ? 'Add New Bus' : 'Edit Bus'}
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
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* License Plate */}
            <div>
              <label className="block text-sm font-medium text-[#103a5e] mb-1">
                License Plate *
              </label>
              <input
                type="text"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleInputChange}
                className={`w-full border rounded-md px-3 py-2 text-sm ${
                  errors.license_plate ? 'border-red-300' : 'border-[#d9d9d9]'
                } focus:outline-none focus:ring-2 focus:ring-[#0097fb] focus:border-transparent`}
                placeholder="Enter license plate"
              />
              {errors.license_plate && (
                <p className="text-red-500 text-xs mt-1">{errors.license_plate}</p>
              )}
            </div>

            {/* Bus Type */}
            <div>
              <label className="block text-sm font-medium text-[#103a5e] mb-1">
                Bus Type
              </label>
              <select
                name="bus_type"
                value={formData.bus_type}
                onChange={handleInputChange}
                className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0097fb] focus:border-transparent"
              >
                <option value="STANDARD">Standard</option>
                <option value="ARTICULATED">Articulated</option>
                <option value="MINIBUS">Minibus</option>
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-[#103a5e] mb-1">
                Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
                className={`w-full border rounded-md px-3 py-2 text-sm ${
                  errors.capacity ? 'border-red-300' : 'border-[#d9d9d9]'
                } focus:outline-none focus:ring-2 focus:ring-[#0097fb] focus:border-transparent`}
                placeholder="Enter capacity"
              />
              {errors.capacity && (
                <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
              )}
            </div>

            {/* Bus Status */}
            <div>
              <label className="block text-sm font-medium text-[#103a5e] mb-1">
                Status
              </label>
              <select
                name="bus_status"
                value={formData.bus_status}
                onChange={handleInputChange}
                className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0097fb] focus:border-transparent"
              >
                <option value="OPERATIONAL">Operational</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="BREAKDOWN">Breakdown</option>
                <option value="IDLE">Idle</option>
              </select>
            </div>

            {/* Manufacture Year */}
            <div>
              <label className="block text-sm font-medium text-[#103a5e] mb-1">
                Manufacture Year
              </label>
              <input
                type="number"
                name="manufacture_year"
                value={formData.manufacture_year}
                onChange={handleInputChange}
                min="1900"
                max={new Date().getFullYear() + 1}
                className={`w-full border rounded-md px-3 py-2 text-sm ${
                  errors.manufacture_year ? 'border-red-300' : 'border-[#d9d9d9]'
                } focus:outline-none focus:ring-2 focus:ring-[#0097fb] focus:border-transparent`}
                placeholder="Enter manufacture year"
              />
              {errors.manufacture_year && (
                <p className="text-red-500 text-xs mt-1">{errors.manufacture_year}</p>
              )}
            </div>

            {/* Bus Model */}
            <div>
              <label className="block text-sm font-medium text-[#103a5e] mb-1">
                Bus Model
              </label>
              <input
                type="text"
                name="bus_model"
                value={formData.bus_model}
                onChange={handleInputChange}
                className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0097fb] focus:border-transparent"
                placeholder="Enter bus model"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#d9d9d9] rounded-md text-[#103a5e] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#0097fb] text-white rounded-md hover:bg-[#0088e2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Bus' : 'Update Bus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
