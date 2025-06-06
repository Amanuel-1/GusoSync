"use client"

import type React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { authService, type RegisterRequest } from "../../../services/authService";

type UserRole = "queueRegulator" | "control" | "driver";

interface FormData {
  // Common fields
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  fatherName: string; // Added father's name
  phoneNumber: string // Changed from 'phone' to 'phoneNumber'
  dateOfBirth: string
  address: string
  city: string
  emergencyContact: string
  role: string // Added role to FormData
  emergencyPhone: string
  nationalId?: string; // Added National ID
  tinNumber?: string; // Added TIN Number
  photo?: File | null; // Added Photo field


  // Driver specific fields
  licenseNumber?: string
  licenseExpiry?: string
  licenseClass?: string
  drivingExperience?: number
  previousEmployer?: string
  vehicleTypes?: string[]

  // Queue Regulator specific fields
  // No specific fields identified yet beyond common and legal info

  // Control staff specific fields
  specialization?: string
  certifications?: string[]
  shiftPreference?: string
  languages?: string[]
  technicalSkills?: string[]
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null); // State for image preview

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    fatherName: "", // Added father's name
    phoneNumber: "", // Changed from 'phone' to 'phoneNumber'
    dateOfBirth: "",
    address: "",
    city: "",
    emergencyContact: "",
    emergencyPhone: "",
    role: "", // Added role to initial state
    nationalId: "", // Added National ID
    tinNumber: "", // Added TIN Number
    photo: null, // Added Photo field

    // Queue Regulator specific
    // No specific fields identified yet beyond common and legal info

    // Control staff specific
    specialization: "",
    certifications: [],
    shiftPreference: "",
    languages: [],
    technicalSkills: [],
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Handle file input separately, specifically for the photo
    if (type === 'file' && name === 'photo') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files ? fileInput.files[0] : null;

      setFormData({
        ...formData,
        [name]: file,
      });

      // Create and set image preview URL
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreviewUrl(null);
      }
    } else {
      // Handle other input types
      // Special handling for the phone input to map to phoneNumber state
      const updatedFormData = name === 'phone' ? { ...formData, phoneNumber: value } : { ...formData, [name]: value };

      setFormData(updatedFormData);
    }


    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, arrayName: string) => {
    const { value, checked } = e.target
    const currentArray = (formData[arrayName as keyof FormData] as string[]) || []

    if (checked) {
      setFormData({
        ...formData,
        [arrayName]: [...currentArray, value],
      })
    } else {
      setFormData({
        ...formData,
        [arrayName]: currentArray.filter((item) => item !== value),
      })
    }
  }

  const validateStep = (currentStep: number): boolean => {
    const errors: Record<string, string> = {}

    if (currentStep === 2) {
      // Validate basic info
      if (!formData.email) errors.email = "Email is required"
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid"

      if (!formData.password) errors.password = "Password is required"
      else if (formData.password.length < 8) errors.password = "Password must be at least 8 characters"

      if (!formData.confirmPassword) errors.confirmPassword = "Please confirm your password"
      else if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match"

      if (!formData.firstName) errors.firstName = "First name is required";
      if (!formData.lastName) errors.lastName = "Last name is required";
      if (!formData.phoneNumber) errors.phone = "Phone number is required"; // Changed from formData.phone to formData.phoneNumber
    }

    if (currentStep === 3) {
      // Validate common legal/photo info for all roles in step 3
      if (!formData.nationalId) errors.nationalId = "National ID is required";
      if (!formData.tinNumber) errors.tinNumber = "TIN Number is required";
      if (!formData.photo) errors.photo = "Photo is required";

      // Validate role-specific info
      if (selectedRole === "queueRegulator") {
        if (!formData.fatherName) errors.fatherName = "Father's Name is required";
      }

      if (selectedRole === "driver") {
        if (!formData.licenseNumber) errors.licenseNumber = "License Number is required";
        if (!formData.licenseExpiry) errors.licenseExpiry = "License Expiry Date is required";
        if (!formData.licenseClass) errors.licenseClass = "License Class is required";
        if (!formData.drivingExperience) errors.drivingExperience = "Driving Experience is required";
      }

      if (selectedRole === "control") {
        if (!formData.specialization) errors.specialization = "Specialization is required";
        if (!formData.certifications?.length) errors.certifications = "Select at least one certification";
        if (!formData.shiftPreference) errors.shiftPreference = "Shift preference is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(step)) {
      return;
    }

    setIsSubmitting(true);
    setFormErrors({}); // Clear previous errors

    // Prepare data for registration
    const registrationData: RegisterRequest = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      fatherName: formData.fatherName,
      phoneNumber: formData.phoneNumber,
      // Map roles to backend expectations
      role: selectedRole === "driver" ? 'BUS_DRIVER' :
            selectedRole === "queueRegulator" ? 'QUEUE_REGULATOR' :
            'CONTROL_STAFF',
      dateOfBirth: formData.dateOfBirth || undefined,
      address: formData.address && formData.city ? {
        street: formData.address,
        city: formData.city
      } : undefined,
      emergencyContact: formData.emergencyContact && formData.emergencyPhone ? {
        name: formData.emergencyContact,
        phoneNumber: formData.emergencyPhone
      } : undefined,
      nationalId: formData.nationalId || undefined,
      tinNumber: formData.tinNumber || undefined,
      photo: formData.photo || undefined,
      // Include driver-specific fields if driver role
      licenseNumber: selectedRole === "driver" ? formData.licenseNumber : undefined,
      licenseExpiry: selectedRole === "driver" ? formData.licenseExpiry : undefined,
      licenseClass: selectedRole === "driver" ? formData.licenseClass : undefined,
      drivingExperience: selectedRole === "driver" ? formData.drivingExperience : undefined,
      previousEmployer: selectedRole === "driver" ? formData.previousEmployer : undefined,
      vehicleTypes: selectedRole === "driver" ? formData.vehicleTypes : undefined,
      // Include control staff fields if control role
      specialization: selectedRole === "control" ? formData.specialization : undefined,
      certifications: selectedRole === "control" ? formData.certifications : undefined,
      shiftPreference: selectedRole === "control" ? formData.shiftPreference : undefined,
      languages: selectedRole === "control" ? formData.languages : undefined,
      technicalSkills: selectedRole === "control" ? formData.technicalSkills : undefined,
    };

    try {
      // The updated authService.register method will handle the photo upload
      const result = await authService.register(registrationData);

      if (result.success) {
        console.log('Registration successful:', result.data);
        setRegistrationComplete(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setFormErrors({ general: result.message || "An error occurred during registration. Please try again." });
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setFormErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-[#f4f9fc] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="flex flex-col items-center justify-center text-center">
            <CheckCircle className="text-[#48c864] w-16 h-16 mb-4" />
            <h1 className="text-2xl font-bold text-[#103a5e] mb-2">Registration Successful!</h1>
            <p className="text-[#7d7d7d] mb-6">
              Your account has been created successfully. You will be redirected to the login page shortly.
            </p>
            <Link
              href="/login"
              className="bg-[#0097fb] text-white px-6 py-2 rounded-md hover:bg-[#0088e2] transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f9fc] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#103a5e]">Create Your Account</h1>
          <div className="text-sm text-[#7d7d7d]">Step {step} of 3</div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#f1f1f1] rounded-full h-2 mb-8">
          <div
            className="bg-[#0097fb] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-[#103a5e] mb-4">Select Your Role</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Adjusted grid for 3 options */}
                <div
                  className={`border rounded-lg p-6 cursor-pointer transition-all ${
                    selectedRole === "queueRegulator"
                      ? "border-[#0097fb] bg-[#f0f9ff]"
                      : "border-[#d9d9d9] hover:border-[#0097fb]"
                  }`}
                  onClick={() => handleRoleSelect("queueRegulator")}
                >
                  <div className="w-16 h-16 bg-[#f0f9ff] rounded-full flex items-center justify-center mb-4 mx-auto">
                    {/* Queue Regulator icon */}
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#0097fb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9.00001 10.9999L11 12.9999L15 8.99994" stroke="#0097fb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="font-medium text-center mb-2">Queue Regulator</h3>
                  <p className="text-sm text-[#7d7d7d] text-center">
                    Register as a queue regulator to manage queues at bus stations.
                  </p>
                </div>

                <div
                  className={`border rounded-lg p-6 cursor-pointer transition-all ${
                    selectedRole === "driver"
                      ? "border-[#0097fb] bg-[#f0f9ff]"
                      : "border-[#d9d9d9] hover:border-[#0097fb]"
                  }`}
                  onClick={() => handleRoleSelect("driver")}
                >
                  <div className="w-16 h-16 bg-[#f0f9ff] rounded-full flex items-center justify-center mb-4 mx-auto">
                    {/* Driver icon */}
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10V6c0-2-2-4-4-4H4c-2 0-4 2-4 4v10c0 .6.4 1 1 1h2" stroke="#0097fb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="7" cy="17" r="2" stroke="#0097fb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 17h6" stroke="#0097fb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="17" cy="17" r="2" stroke="#0097fb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="font-medium text-center mb-2">Bus Driver</h3>
                  <p className="text-sm text-[#7d7d7d] text-center">
                    Register as a bus driver to operate public transportation vehicles.
                  </p>
                </div>

                <div
                  className={`border rounded-lg p-6 cursor-pointer transition-all ${
                    selectedRole === "control"
                      ? "border-[#0097fb] bg-[#f0f9ff]"
                      : "border-[#d9d9d9] hover:border-[#0097fb]"
                  }`}
                  onClick={() => handleRoleSelect("control")}
                >
                  <div className="w-16 h-16 bg-[#f0f9ff] rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 16v-4"
                        stroke="#0097fb"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 8h.01"
                        stroke="#0097fb"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"
                        stroke="#0097fb"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium text-center mb-2">Control Staff</h3>
                  <p className="text-sm text-[#7d7d7d] text-center">
                    Register as control staff to monitor and coordinate operations.
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  className="bg-[#0097fb] text-white px-6 py-2 rounded-md hover:bg-[#0088e2] transition-colors disabled:bg-[#7d7d7d]"
                  disabled={!selectedRole}
                  onClick={handleNextStep}
                >
                  Continue <ArrowRight className="inline ml-1" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Basic Information */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-[#103a5e] mb-4">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#103a5e] mb-1">
                    Email Address <span className="text-[#e92c2c]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full border ${
                      formErrors.email ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                    } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                    placeholder="your.email@example.com"
                  />
                  {formErrors.email && <p className="text-[#e92c2c] text-xs mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#103a5e] mb-1">
                    Phone Number <span className="text-[#e92c2c]">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber" // Changed id to phoneNumber
                    name="phoneNumber" // Changed name to phoneNumber
                    value={formData.phoneNumber} // Changed value to formData.phoneNumber
                    onChange={handleInputChange}
                    className={`w-full border ${
                      formErrors.phone ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                    } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                    placeholder="+251 91 234 5678"
                  />
                  {formErrors.phone && <p className="text-[#e92c2c] text-xs mt-1">{formErrors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[#103a5e] mb-1">
                    First Name <span className="text-[#e92c2c]">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full border ${
                      formErrors.firstName ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                    } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                    placeholder="First Name"
                  />
                  {formErrors.firstName && <p className="text-[#e92c2c] text-xs mt-1">{formErrors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-[#103a5e] mb-1">
                    Last Name <span className="text-[#e92c2c]">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full border ${
                      formErrors.lastName ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                    } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                    placeholder="Last Name"
                  />
                  {formErrors.lastName && <p className="text-[#e92c2c] text-xs mt-1">{formErrors.lastName}</p>}
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-[#103a5e] mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-[#103a5e] mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
                    placeholder="Street Address"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-[#103a5e] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-[#103a5e] mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
                    placeholder="Emergency Contact Name"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyPhone" className="block text-sm font-medium text-[#103a5e] mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
                    placeholder="+251 91 234 5678"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#103a5e] mb-1">
                    Password <span className="text-[#e92c2c]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full border ${
                        formErrors.password ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                      } rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7d7d7d]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formErrors.password && <p className="text-[#e92c2c] text-xs mt-1">{formErrors.password}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#103a5e] mb-1">
                    Confirm Password <span className="text-[#e92c2c]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full border ${
                        formErrors.confirmPassword ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                      } rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7d7d7d]"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-[#e92c2c] text-xs mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="border border-[#d9d9d9] text-[#7d7d7d] px-6 py-2 rounded-md hover:bg-[#f9f9f9] transition-colors"
                  onClick={handlePrevStep}
                >
                  <ArrowLeft className="inline mr-1" size={16} /> Back
                </button>
                <button
                  type="button"
                  className="bg-[#0097fb] text-white px-6 py-2 rounded-md hover:bg-[#0088e2] transition-colors"
                  onClick={handleNextStep}
                >
                  Continue <ArrowRight className="inline ml-1" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Role-Specific Information */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-[#103a5e] mb-4">
                {selectedRole === "queueRegulator" && "Queue Regulator Information"}
                {selectedRole === "driver" && "Driver Information"}
                {selectedRole === "control" && "Control Staff Information"}
              </h2>

              {/* Common Legal and Photo Information for all roles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 border-[#d9d9d9]">
                 {/* Photo Upload Section (Top-Left) */}
                 <div>
                    <label htmlFor="photo" className="block text-sm font-medium text-[#103a5e] mb-1">
                      Upload Photo <span className="text-[#e92c2c]">*</span>
                    </label>
                    <div className={`relative w-40 h-auto aspect-[3/4] border ${
                        formErrors.photo ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                      } rounded-md overflow-hidden cursor-pointer group hover:border-[#0097fb] transition-colors`}>
                      <input
                        type="file"
                        id="photo"
                        name="photo"
                        onChange={handleInputChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*" // Accept image files
                      />
                      {imagePreviewUrl ? (
                        <img src={imagePreviewUrl} alt="Photo Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-[#7d7d7d] text-sm">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2 group-hover:text-[#0097fb] transition-colors">
                            <path d="M15 10L17.5 12.5L20 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M17.5 12.5V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 15C20 16.8754 20 17.8131 19.6213 18.3966C19.2961 18.9111 18.7911 19.2961 18.2036 19.6213C17.6201 20 16.6824 20 14.8129 20H9.18711C7.31762 20 6.37987 20 5.79636 19.6213C5.20886 19.2961 4.70394 18.9111 4.37868 18.3966C4 17.8131 4 16.8754 4 15V9C4 7.12459 4 6.1869 4.37868 5.60341C4.70394 5.08891 5.20886 4.70394 5.79636 4.37868C6.37987 4 7.31762 4 9.18711 4H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15 4H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M17 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Click to Upload
                        </div>
                      )}
                    </div>
                    {formErrors.photo && (
                      <p className="text-[#e92c2c] text-xs mt-1">{formErrors.photo}</p>
                    )}
                     <p className="text-xs text-[#7d7d7d] mt-1">Please upload a photo with a 3:4 aspect ratio.</p>
                  </div>

                 {/* National ID and TIN Number fields */}
                 <div className="grid grid-cols-1 gap-6 content-start"> {/* Use content-start to align items to the top */}
                    <div>
                       <label htmlFor="nationalId" className="block text-sm font-medium text-[#103a5e] mb-1">
                         National ID Number <span className="text-[#e92c2c]">*</span>
                       </label>
                       <input
                         type="text"
                         id="nationalId"
                         name="nationalId"
                         value={formData.nationalId || ''}
                         onChange={handleInputChange}
                         className={`w-full border ${
                           formErrors.nationalId ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                         } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                         placeholder="National ID Number"
                       />
                       {formErrors.nationalId && (
                         <p className="text-[#e92c2c] text-xs mt-1">{formErrors.nationalId}</p>
                       )}
                     </div>

                     <div>
                       <label htmlFor="tinNumber" className="block text-sm font-medium text-[#103a5e] mb-1">
                         TIN Number <span className="text-[#e92c2c]">*</span>
                       </label>
                       <input
                         type="text"
                         id="tinNumber"
                         name="tinNumber"
                         value={formData.tinNumber || ''}
                         onChange={handleInputChange}
                         className={`w-full border ${
                           formErrors.tinNumber ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                         } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                         placeholder="TIN Number"
                       />
                       {formErrors.tinNumber && (
                         <p className="text-[#e92c2c] text-xs mt-1">{formErrors.tinNumber}</p>
                       )}
                     </div>
                 </div>
              </div>



              {/* Queue Regulator-specific fields */}
              {selectedRole === "queueRegulator" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 border-[#d9d9d9]">
                  <div>
                    <label htmlFor="fatherName" className="block text-sm font-medium text-[#103a5e] mb-1">
                      Father's Name <span className="text-[#e92c2c]">*</span>
                    </label>
                    <input
                      type="text"
                      id="fatherName"
                      name="fatherName"
                      value={formData.fatherName || ''}
                      onChange={handleInputChange}
                      className={`w-full border ${
                        formErrors.fatherName ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                      placeholder="Father's Name"
                    />
                    {formErrors.fatherName && (
                      <p className="text-[#e92c2c] text-xs mt-1">{formErrors.fatherName}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Driver-specific fields */}
              {selectedRole === "driver" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 border-[#d9d9d9]">
                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-[#103a5e] mb-1">
                      License Number <span className="text-[#e92c2c]">*</span>
                    </label>
                    <input
                      type="text"
                      id="licenseNumber"
                      name="licenseNumber"
                      value={formData.licenseNumber || ''}
                      onChange={handleInputChange}
                      className={`w-full border ${
                        formErrors.licenseNumber ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                      placeholder="License Number"
                    />
                    {formErrors.licenseNumber && (
                      <p className="text-[#e92c2c] text-xs mt-1">{formErrors.licenseNumber}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="licenseExpiry" className="block text-sm font-medium text-[#103a5e] mb-1">
                      License Expiry Date <span className="text-[#e92c2c]">*</span>
                    </label>
                    <input
                      type="date"
                      id="licenseExpiry"
                      name="licenseExpiry"
                      value={formData.licenseExpiry || ''}
                      onChange={handleInputChange}
                      className={`w-full border ${
                        formErrors.licenseExpiry ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                    />
                    {formErrors.licenseExpiry && (
                      <p className="text-[#e92c2c] text-xs mt-1">{formErrors.licenseExpiry}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="licenseClass" className="block text-sm font-medium text-[#103a5e] mb-1">
                      License Class <span className="text-[#e92c2c]">*</span>
                    </label>
                    <select
                      id="licenseClass"
                      name="licenseClass"
                      value={formData.licenseClass || ''}
                      onChange={handleInputChange}
                      className={`w-full border ${
                        formErrors.licenseClass ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                    >
                      <option value="">Select License Class</option>
                      <option value="Class A">Class A - Heavy Trucks</option>
                      <option value="Class B">Class B - Large Trucks & Buses</option>
                      <option value="Class C">Class C - Regular Vehicles</option>
                      <option value="Class D">Class D - Commercial Passenger</option>
                    </select>
                    {formErrors.licenseClass && (
                      <p className="text-[#e92c2c] text-xs mt-1">{formErrors.licenseClass}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="drivingExperience" className="block text-sm font-medium text-[#103a5e] mb-1">
                      Driving Experience (Years) <span className="text-[#e92c2c]">*</span>
                    </label>
                    <input
                      type="number"
                      id="drivingExperience"
                      name="drivingExperience"
                      value={formData.drivingExperience || ''}
                      onChange={handleInputChange}
                      min="0"
                      max="50"
                      className={`w-full border ${
                        formErrors.drivingExperience ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                      placeholder="Years of experience"
                    />
                    {formErrors.drivingExperience && (
                      <p className="text-[#e92c2c] text-xs mt-1">{formErrors.drivingExperience}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="previousEmployer" className="block text-sm font-medium text-[#103a5e] mb-1">
                      Previous Employer (Optional)
                    </label>
                    <input
                      type="text"
                      id="previousEmployer"
                      name="previousEmployer"
                      value={formData.previousEmployer || ''}
                      onChange={handleInputChange}
                      className="w-full border border-[#d9d9d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]"
                      placeholder="Previous employer name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#103a5e] mb-1">Vehicle Types Experience</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="City Bus"
                          checked={formData.vehicleTypes?.includes("City Bus")}
                          onChange={(e) => handleCheckboxChange(e, "vehicleTypes")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>City Bus</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="Intercity Bus"
                          checked={formData.vehicleTypes?.includes("Intercity Bus")}
                          onChange={(e) => handleCheckboxChange(e, "vehicleTypes")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>Intercity Bus</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="Minibus"
                          checked={formData.vehicleTypes?.includes("Minibus")}
                          onChange={(e) => handleCheckboxChange(e, "vehicleTypes")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>Minibus</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="Articulated Bus"
                          checked={formData.vehicleTypes?.includes("Articulated Bus")}
                          onChange={(e) => handleCheckboxChange(e, "vehicleTypes")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>Articulated Bus</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Control Staff-specific fields */}
              {selectedRole === "control" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 border-[#d9d9d9]">
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-[#103a5e] mb-1">
                      Specialization <span className="text-[#e92c2c]">*</span>
                    </label>
                    <select
                      id="specialization"
                      name="specialization"
                      value={formData.specialization || ''}
                      onChange={handleInputChange}
                      className={`w-full border ${
                        formErrors.specialization ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                    >
                      <option value="">Select Specialization</option>
                      <option value="Route Management">Route Management</option>
                      <option value="Traffic Control">Traffic Control</option>
                      <option value="Emergency Response">Emergency Response</option>
                      <option value="Fleet Monitoring">Fleet Monitoring</option>
                      <option value="Passenger Services">Passenger Services</option>
                    </select>
                    {formErrors.specialization && (
                      <p className="text-[#e92c2c] text-xs mt-1">{formErrors.specialization}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="shiftPreference" className="block text-sm font-medium text-[#103a5e] mb-1">
                      Shift Preference <span className="text-[#e92c2c]">*</span>
                    </label>
                    <select
                      id="shiftPreference"
                      name="shiftPreference"
                      value={formData.shiftPreference || ''}
                      onChange={handleInputChange}
                      className={`w-full border ${
                        formErrors.shiftPreference ? "border-[#e92c2c]" : "border-[#d9d9d9]"
                      } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0097fb]`}
                    >
                      <option value="">Select Shift Preference</option>
                      <option value="Morning">Morning (6 AM - 2 PM)</option>
                      <option value="Afternoon">Afternoon (2 PM - 10 PM)</option>
                      <option value="Night">Night (10 PM - 6 AM)</option>
                      <option value="Rotating">Rotating Shifts</option>
                      <option value="Flexible">Flexible Hours</option>
                    </select>
                    {formErrors.shiftPreference && (
                      <p className="text-[#e92c2c] text-xs mt-1">{formErrors.shiftPreference}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#103a5e] mb-1">
                      Certifications <span className="text-[#e92c2c]">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="Traffic Management"
                          checked={formData.certifications?.includes("Traffic Management")}
                          onChange={(e) => handleCheckboxChange(e, "certifications")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>Traffic Management</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="Emergency Response"
                          checked={formData.certifications?.includes("Emergency Response")}
                          onChange={(e) => handleCheckboxChange(e, "certifications")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>Emergency Response</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="Communication Systems"
                          checked={formData.certifications?.includes("Communication Systems")}
                          onChange={(e) => handleCheckboxChange(e, "certifications")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>Communication Systems</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="GPS and Tracking"
                          checked={formData.certifications?.includes("GPS and Tracking")}
                          onChange={(e) => handleCheckboxChange(e, "certifications")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>GPS and Tracking</span>
                      </label>
                    </div>
                    {formErrors.certifications && (
                      <p className="text-[#e92c2c] text-xs mt-1">{formErrors.certifications}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#103a5e] mb-1">Languages</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="Amharic"
                          checked={formData.languages?.includes("Amharic")}
                          onChange={(e) => handleCheckboxChange(e, "languages")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>Amharic</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="English"
                          checked={formData.languages?.includes("English")}
                          onChange={(e) => handleCheckboxChange(e, "languages")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>English</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="Oromo"
                          checked={formData.languages?.includes("Oromo")}
                          onChange={(e) => handleCheckboxChange(e, "languages")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>Oromo</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="Tigrinya"
                          checked={formData.languages?.includes("Tigrinya")}
                          onChange={(e) => handleCheckboxChange(e, "languages")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>Tigrinya</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#103a5e] mb-1">Technical Skills</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="Radio Communication"
                          checked={formData.technicalSkills?.includes("Radio Communication")}
                          onChange={(e) => handleCheckboxChange(e, "technicalSkills")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>Radio Communication</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="GPS Systems"
                          checked={formData.technicalSkills?.includes("GPS Systems")}
                          onChange={(e) => handleCheckboxChange(e, "technicalSkills")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>GPS Systems</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="CCTV Monitoring"
                          checked={formData.technicalSkills?.includes("CCTV Monitoring")}
                          onChange={(e) => handleCheckboxChange(e, "technicalSkills")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>CCTV Monitoring</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value="Data Analysis"
                          checked={formData.technicalSkills?.includes("Data Analysis")}
                          onChange={(e) => handleCheckboxChange(e, "technicalSkills")}
                          className="rounded text-[#0097fb] focus:ring-[#0097fb]"
                        />
                        <span>Data Analysis</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="border border-[#d9d9d9] text-[#7d7d7d] px-6 py-2 rounded-md hover:bg-[#f9f9f9] transition-colors"
                  onClick={handlePrevStep}
                >
                  <ArrowLeft className="inline mr-1" size={16} /> Back
                </button>
                <button
                  type="submit"
                  className="bg-[#0097fb] text-white px-6 py-2 rounded-md hover:bg-[#0088e2] transition-colors disabled:bg-[#7d7d7d]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-[#7d7d7d]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#0097fb] hover:underline">
            Sign in
          </Link>
        </div>

        {Object.keys(formErrors).length > 0 && (
          <div className="mt-6 p-3 bg-[#fff3ee] border border-[#ff8a00] rounded-md">
            <div className="flex items-start">
              <AlertCircle className="text-[#ff8a00] mr-2 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-[#ff8a00]">Please fix the following errors:</p>
                <ul className="text-xs text-[#7d7d7d] mt-1 list-disc list-inside">
                  {Object.values(formErrors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
