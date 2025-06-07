"use client"

import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Route as RouteIcon, Plus, Trash2 } from 'lucide-react';
import { type BusRoute, type CreateRouteRequest, type UpdateRouteRequest } from '@/services/routeService';

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (routeData: CreateRouteRequest | UpdateRouteRequest) => Promise<{ success: boolean; message?: string }>;
  route?: BusRoute | null;
  mode: 'create' | 'edit';
}

export default function RouteModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  route, 
  mode 
}: RouteModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    color: '#0097fb',
    start: '',
    passBy: [''],
    destination: '',
    distance: 0,
    stops: 2,
    expectedLoad: 'Medium' as "Low" | "Medium" | "High" | "Very High",
    regulatorName: '',
    regulatorPhone: '',
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && route) {
        setFormData({
          name: route.name,
          color: route.color,
          start: route.start,
          passBy: route.passBy.length > 0 ? route.passBy : [''],
          destination: route.destination,
          distance: route.distance,
          stops: route.stops,
          expectedLoad: route.expectedLoad,
          regulatorName: route.regulatorName,
          regulatorPhone: route.regulatorPhone,
          is_active: route.is_active !== false,
        });
      } else {
        setFormData({
          name: '',
          color: '#0097fb',
          start: '',
          passBy: [''],
          destination: '',
          distance: 0,
          stops: 2,
          expectedLoad: 'Medium' as "Low" | "Medium" | "High" | "Very High",
          regulatorName: '',
          regulatorPhone: '',
          is_active: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, route]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePassByChange = (index: number, value: string) => {
    const newPassBy = [...formData.passBy];
    newPassBy[index] = value;
    setFormData(prev => ({ ...prev, passBy: newPassBy }));

    // Clear error when user starts typing
    if (errors.passBy) {
      setErrors(prev => ({ ...prev, passBy: '' }));
    }
  };

  const addPassBy = () => {
    setFormData(prev => ({
      ...prev,
      passBy: [...prev.passBy, '']
    }));
  };

  const removePassBy = (index: number) => {
    if (formData.passBy.length > 1) {
      const newPassBy = formData.passBy.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, passBy: newPassBy }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Route name is required';
    }

    if (!formData.start.trim()) {
      newErrors.start = 'Start location is required';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }

    if (formData.distance <= 0) {
      newErrors.distance = 'Distance must be greater than 0';
    }

    if (formData.stops < 2) {
      newErrors.stops = 'At least 2 stops are required';
    }

    if (!formData.regulatorName.trim()) {
      newErrors.regulatorName = 'Regulator name is required';
    }

    if (!formData.regulatorPhone.trim()) {
      newErrors.regulatorPhone = 'Regulator phone is required';
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
      // Filter out empty pass-by locations
      const validPassBy = formData.passBy.filter(location => location.trim() !== '');

      const routeData = {
        ...formData,
        passBy: validPassBy,
      };

      const result = await onSubmit(routeData);
      
      if (result.success) {
        onClose();
      } else {
        // Handle submission error
        setErrors({ submit: result.message || 'Failed to save route' });
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
            <RouteIcon className="text-[#0097fb]" size={24} />
            <h2 className="text-xl font-semibold text-[#103a5e]">
              {mode === 'create' ? 'Add New Route' : 'Edit Route'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Route Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter route name (e.g., Megenagna-Bole)"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Route Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
                placeholder="#0097fb"
              />
            </div>
          </div>

          {/* Start and Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Location
              </label>
              <input
                type="text"
                name="start"
                value={formData.start}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.start ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter start location"
              />
              {errors.start && <p className="text-red-500 text-sm mt-1">{errors.start}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.destination ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter destination"
              />
              {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination}</p>}
            </div>
          </div>

          {/* Pass By Locations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Pass By Locations (Optional)
              </label>
              <button
                type="button"
                onClick={addPassBy}
                className="flex items-center gap-1 text-sm text-[#0097fb] hover:text-[#0088e2]"
              >
                <Plus size={16} />
                Add Location
              </button>
            </div>
            <div className="space-y-2">
              {formData.passBy.map((location, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => handlePassByChange(index, e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
                      placeholder={`Pass by location ${index + 1}`}
                    />
                  </div>
                  {formData.passBy.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePassBy(index)}
                      className="p-2 text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.passBy && <p className="text-red-500 text-sm mt-1">{errors.passBy}</p>}
          </div>

          {/* Distance and Stops */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Distance (km)
              </label>
              <input
                type="number"
                name="distance"
                value={formData.distance}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.distance ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.0"
              />
              {errors.distance && <p className="text-red-500 text-sm mt-1">{errors.distance}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Stops
              </label>
              <input
                type="number"
                name="stops"
                value={formData.stops}
                onChange={handleInputChange}
                min="2"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.stops ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="2"
              />
              {errors.stops && <p className="text-red-500 text-sm mt-1">{errors.stops}</p>}
            </div>
          </div>

          {/* Expected Load */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Load
            </label>
            <select
              name="expectedLoad"
              value={formData.expectedLoad}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Very High">Very High</option>
            </select>
          </div>

          {/* Regulator Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Queue Regulator Name
              </label>
              <input
                type="text"
                name="regulatorName"
                value={formData.regulatorName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.regulatorName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter regulator name"
              />
              {errors.regulatorName && <p className="text-red-500 text-sm mt-1">{errors.regulatorName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regulator Phone
              </label>
              <input
                type="tel"
                name="regulatorPhone"
                value={formData.regulatorPhone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.regulatorPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+251911234567"
              />
              {errors.regulatorPhone && <p className="text-red-500 text-sm mt-1">{errors.regulatorPhone}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="rounded text-[#0097fb] focus:ring-[#0097fb]"
              />
              <span className="text-sm font-medium text-gray-700">Active Route</span>
            </label>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#0097fb] text-white rounded-md hover:bg-[#0088e2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Route' : 'Update Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
