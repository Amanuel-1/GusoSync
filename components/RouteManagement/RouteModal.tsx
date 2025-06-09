"use client"

import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, Route as RouteIcon, Plus, Trash2 } from 'lucide-react';
import { type RouteData, type CreateRouteRequest, type UpdateRouteRequest } from '@/hooks/useRouteManagementAPI';

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (routeData: CreateRouteRequest | UpdateRouteRequest) => Promise<{ success: boolean; message?: string }>;
  route?: RouteData | null;
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
    description: '',
    stop_ids: [''],
    total_distance: 0,
    estimated_duration: 0,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && route) {
        setFormData({
          name: route.name || '',
          description: route.description || '',
          stop_ids: route.stop_ids && route.stop_ids.length > 0 ? route.stop_ids : [''],
          total_distance: route.total_distance || 0,
          estimated_duration: route.estimated_duration || 0,
          is_active: route.is_active !== false,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          stop_ids: [''],
          total_distance: 0,
          estimated_duration: 0,
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

  const handleStopChange = (index: number, value: string) => {
    const newStopIds = [...formData.stop_ids];
    newStopIds[index] = value;
    setFormData(prev => ({ ...prev, stop_ids: newStopIds }));

    // Clear error when user starts typing
    if (errors.stop_ids) {
      setErrors(prev => ({ ...prev, stop_ids: '' }));
    }
  };

  const addStop = () => {
    setFormData(prev => ({
      ...prev,
      stop_ids: [...prev.stop_ids, '']
    }));
  };

  const removeStop = (index: number) => {
    if (formData.stop_ids.length > 1) {
      const newStopIds = formData.stop_ids.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, stop_ids: newStopIds }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Route name is required';
    }

    if (formData.total_distance <= 0) {
      newErrors.total_distance = 'Distance must be greater than 0';
    }

    if (formData.estimated_duration <= 0) {
      newErrors.estimated_duration = 'Estimated duration must be greater than 0';
    }

    const validStops = formData.stop_ids.filter(stop => stop.trim() !== '');
    if (validStops.length < 2) {
      newErrors.stop_ids = 'At least 2 stops are required';
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
      // Filter out empty stop IDs
      const validStopIds = formData.stop_ids.filter(stop => stop.trim() !== '');

      const routeData = {
        name: formData.name,
        description: formData.description || null,
        stop_ids: validStopIds,
        total_distance: formData.total_distance || null,
        estimated_duration: formData.estimated_duration || null,
        is_active: formData.is_active,
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
              Route Name *
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

          {/* Route Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
              placeholder="Enter route description (optional)"
            />
          </div>

          {/* Stop IDs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Bus Stops * (At least 2 required)
              </label>
              <button
                type="button"
                onClick={addStop}
                className="flex items-center gap-1 text-sm text-[#0097fb] hover:text-[#0088e2]"
              >
                <Plus size={16} />
                Add Stop
              </button>
            </div>
            <div className="space-y-2">
              {formData.stop_ids.map((stopId, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={stopId}
                      onChange={(e) => handleStopChange(index, e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
                      placeholder={`Stop ID ${index + 1}`}
                    />
                  </div>
                  {formData.stop_ids.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStop(index)}
                      className="p-2 text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.stop_ids && <p className="text-red-500 text-sm mt-1">{errors.stop_ids}</p>}
          </div>

          {/* Distance and Stops */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Distance (km)
              </label>
              <input
                type="number"
                name="total_distance"
                value={formData.total_distance}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.total_distance ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.0"
              />
              {errors.total_distance && <p className="text-red-500 text-sm mt-1">{errors.total_distance}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Duration (minutes) *
              </label>
              <input
                type="number"
                name="estimated_duration"
                value={formData.estimated_duration}
                onChange={handleInputChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.estimated_duration ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter estimated duration in minutes"
              />
              {errors.estimated_duration && <p className="text-red-500 text-sm mt-1">{errors.estimated_duration}</p>}
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
