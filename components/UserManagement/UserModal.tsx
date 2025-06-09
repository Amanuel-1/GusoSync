"use client"

import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, User, Mail, Phone, Shield } from 'lucide-react';
import { type User, type CreateUserRequest, type UpdateUserRequest } from '@/services/userService';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: CreateUserRequest | UpdateUserRequest) => Promise<{ success: boolean; message?: string }>;
  user?: User | null;
  mode: 'create' | 'edit';
  allowedRoles?: string[];
  defaultRole?: 'BUS_DRIVER' | 'QUEUE_REGULATOR' | 'CONTROL_STAFF';
}

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  mode,
  allowedRoles = ['BUS_DRIVER', 'QUEUE_REGULATOR', 'CONTROL_STAFF'],
  defaultRole = 'BUS_DRIVER'
}: UserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'BUS_DRIVER' as 'BUS_DRIVER' | 'QUEUE_REGULATOR' | 'CONTROL_STAFF',
    profile_image: '',
    // Driver-specific fields
    licenseNumber: '',
    licenseExpiry: '',
    licenseClass: '',
    drivingExperience: '',
    previousEmployer: '',
    vehicleTypes: [] as string[],
    // Queue Regulator-specific fields
    fatherName: '',
    // Control Staff-specific fields
    specialization: '',
    shiftPreference: '',
    certifications: [] as string[],
    languages: [] as string[],
    technicalSkills: [] as string[],
    // Common additional fields
    nationalId: '',
    tinNumber: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        setFormData({
          email: user.email,
          password: '',
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone_number || '',
          role: user.role as 'BUS_DRIVER' | 'QUEUE_REGULATOR' | 'CONTROL_STAFF',
          profile_image: user.profile_image || '',
          // Driver-specific fields
          licenseNumber: '',
          licenseExpiry: '',
          licenseClass: '',
          drivingExperience: '',
          previousEmployer: '',
          vehicleTypes: [],
          // Queue Regulator-specific fields
          fatherName: '',
          // Control Staff-specific fields
          specialization: '',
          shiftPreference: '',
          certifications: [],
          languages: [],
          technicalSkills: [],
          // Common additional fields
          nationalId: '',
          tinNumber: '',
        });
      } else {
        setFormData({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          phone_number: '',
          role: defaultRole,
          profile_image: '',
          // Driver-specific fields
          licenseNumber: '',
          licenseExpiry: '',
          licenseClass: '',
          drivingExperience: '',
          previousEmployer: '',
          vehicleTypes: [],
          // Queue Regulator-specific fields
          fatherName: '',
          // Control Staff-specific fields
          specialization: '',
          shiftPreference: '',
          certifications: [],
          languages: [],
          technicalSkills: [],
          // Common additional fields
          nationalId: '',
          tinNumber: '',
        });
      }
      setErrors({});
      setImagePreviewUrl(null);
    }
  }, [isOpen, mode, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImagePreviewUrl(result);
          setFormData(prev => ({ ...prev, [name]: result }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentArray = (prev[fieldName as keyof typeof prev] as string[]) || [];
      if (checked) {
        return { ...prev, [fieldName]: [...currentArray, value] };
      } else {
        return { ...prev, [fieldName]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Common validations
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (mode === 'create' && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    }

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'National ID is required';
    }

    if (!formData.tinNumber.trim()) {
      newErrors.tinNumber = 'TIN Number is required';
    }

    // Role-specific validations
    if (formData.role === 'BUS_DRIVER') {
      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'License number is required';
      }
      if (!formData.licenseExpiry.trim()) {
        newErrors.licenseExpiry = 'License expiry date is required';
      }
      if (!formData.licenseClass.trim()) {
        newErrors.licenseClass = 'License class is required';
      }
      if (!formData.drivingExperience.trim()) {
        newErrors.drivingExperience = 'Driving experience is required';
      }
    }

    if (formData.role === 'QUEUE_REGULATOR') {
      if (!formData.fatherName.trim()) {
        newErrors.fatherName = 'Father\'s name is required';
      }
    }

    if (formData.role === 'CONTROL_STAFF') {
      if (!formData.specialization.trim()) {
        newErrors.specialization = 'Specialization is required';
      }
      if (!formData.shiftPreference.trim()) {
        newErrors.shiftPreference = 'Shift preference is required';
      }
      if (formData.certifications.length === 0) {
        newErrors.certifications = 'At least one certification is required';
      }
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
      let submitData: CreateUserRequest | UpdateUserRequest;
      
      if (mode === 'create') {
        submitData = formData as CreateUserRequest;
      } else {
        // For edit mode, exclude password if empty and email if unchanged
        submitData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          profile_image: formData.profile_image,
        };
        
        // Only include email if it's different from current
        if (user && formData.email !== user.email) {
          (submitData as any).email = formData.email;
        }
      }

      const result = await onSubmit(submitData);
      
      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'BUS_DRIVER': 'Bus Driver',
      'QUEUE_REGULATOR': 'Queue Regulator',
      'CONTROL_STAFF': 'Control Staff',
    };
    return roleMap[role] || role;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-[#103a5e]">
            {mode === 'create' ? 'Add New Personnel' : 'Edit Personnel'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password (only for create mode) */}
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
          )}

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.first_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter first name"
              />
            </div>
            {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.last_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter last name"
              />
            </div>
            {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.phone_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
              />
            </div>
            {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
          </div>

          {/* Role (only for create mode or if user can manage all roles) */}
          {(mode === 'create' || allowedRoles.length > 1) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] appearance-none bg-white"
                  disabled={mode === 'edit'}
                >
                  {allowedRoles.map(role => (
                    <option key={role} value={role}>
                      {getRoleDisplayName(role)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Common Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* National ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National ID Number
              </label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.nationalId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter national ID number"
              />
              {errors.nationalId && <p className="text-red-500 text-sm mt-1">{errors.nationalId}</p>}
            </div>

            {/* TIN Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TIN Number
              </label>
              <input
                type="text"
                name="tinNumber"
                value={formData.tinNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                  errors.tinNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter TIN number"
              />
              {errors.tinNumber && <p className="text-red-500 text-sm mt-1">{errors.tinNumber}</p>}
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Photo
            </label>
            <div className={`relative w-32 h-40 border-2 border-dashed rounded-lg overflow-hidden cursor-pointer group hover:border-[#0097fb] transition-colors ${
              errors.profile_image ? 'border-red-500' : 'border-gray-300'
            }`}>
              <input
                type="file"
                name="profile_image"
                onChange={handleInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
              />
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 text-sm">
                  <User size={24} className="mb-2 group-hover:text-[#0097fb] transition-colors" />
                  <span>Click to Upload</span>
                </div>
              )}
            </div>
            {errors.profile_image && <p className="text-red-500 text-sm mt-1">{errors.profile_image}</p>}
          </div>

          {/* Driver-specific fields */}
          {formData.role === 'BUS_DRIVER' && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Driver Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                      errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter license number"
                  />
                  {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Expiry Date
                  </label>
                  <input
                    type="date"
                    name="licenseExpiry"
                    value={formData.licenseExpiry}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                      errors.licenseExpiry ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.licenseExpiry && <p className="text-red-500 text-sm mt-1">{errors.licenseExpiry}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Class
                  </label>
                  <select
                    name="licenseClass"
                    value={formData.licenseClass}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                      errors.licenseClass ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select License Class</option>
                    <option value="Class A">Class A - Heavy Trucks</option>
                    <option value="Class B">Class B - Large Trucks & Buses</option>
                    <option value="Class C">Class C - Regular Vehicles</option>
                    <option value="Class D">Class D - Commercial Passenger</option>
                  </select>
                  {errors.licenseClass && <p className="text-red-500 text-sm mt-1">{errors.licenseClass}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driving Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="drivingExperience"
                    value={formData.drivingExperience}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                      errors.drivingExperience ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Years of experience"
                  />
                  {errors.drivingExperience && <p className="text-red-500 text-sm mt-1">{errors.drivingExperience}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Previous Employer (Optional)
                  </label>
                  <input
                    type="text"
                    name="previousEmployer"
                    value={formData.previousEmployer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
                    placeholder="Previous employer name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Types Experience</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['City Bus', 'Intercity Bus', 'Minibus', 'Articulated Bus'].map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={type}
                          checked={formData.vehicleTypes?.includes(type) || false}
                          onChange={(e) => handleCheckboxChange(e, 'vehicleTypes')}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Queue Regulator-specific fields */}
          {formData.role === 'QUEUE_REGULATOR' && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Queue Regulator Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Name
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                    errors.fatherName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter father's name"
                />
                {errors.fatherName && <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>}
              </div>
            </div>
          )}

          {/* Control Staff-specific fields */}
          {formData.role === 'CONTROL_STAFF' && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Control Staff Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                      errors.specialization ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Specialization</option>
                    <option value="Route Management">Route Management</option>
                    <option value="Traffic Control">Traffic Control</option>
                    <option value="Emergency Response">Emergency Response</option>
                    <option value="Fleet Monitoring">Fleet Monitoring</option>
                    <option value="Passenger Services">Passenger Services</option>
                  </select>
                  {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift Preference
                  </label>
                  <select
                    name="shiftPreference"
                    value={formData.shiftPreference}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0097fb] ${
                      errors.shiftPreference ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Shift Preference</option>
                    <option value="Morning">Morning (6 AM - 2 PM)</option>
                    <option value="Afternoon">Afternoon (2 PM - 10 PM)</option>
                    <option value="Night">Night (10 PM - 6 AM)</option>
                    <option value="Rotating">Rotating Shifts</option>
                    <option value="Flexible">Flexible Hours</option>
                  </select>
                  {errors.shiftPreference && <p className="text-red-500 text-sm mt-1">{errors.shiftPreference}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certifications
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Traffic Management', 'Emergency Response', 'Communication Systems', 'GPS and Tracking'].map((cert) => (
                      <label key={cert} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={cert}
                          checked={formData.certifications?.includes(cert) || false}
                          onChange={(e) => handleCheckboxChange(e, 'certifications')}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span className="text-sm">{cert}</span>
                      </label>
                    ))}
                  </div>
                  {errors.certifications && <p className="text-red-500 text-sm mt-1">{errors.certifications}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Amharic', 'English', 'Oromo', 'Tigrinya'].map((lang) => (
                      <label key={lang} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={lang}
                          checked={formData.languages?.includes(lang) || false}
                          onChange={(e) => handleCheckboxChange(e, 'languages')}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span className="text-sm">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Radio Communication', 'GPS Systems', 'CCTV Monitoring', 'Data Analysis'].map((skill) => (
                      <label key={skill} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={skill}
                          checked={formData.technicalSkills?.includes(skill) || false}
                          onChange={(e) => handleCheckboxChange(e, 'technicalSkills')}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span className="text-sm">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#0097fb] text-white rounded-md hover:bg-[#0088e2] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
