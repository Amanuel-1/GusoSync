// Authentication related types based on OpenAPI schema

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface PasswordResetResponse {
  message: string;
  success?: boolean;
}

export interface ValidationError {
  msg: string;
  type: string;
  loc?: string[];
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// Existing auth types (if not already defined elsewhere)
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  profile_image?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
  // Legacy compatibility fields
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  fatherName?: string;
  dateOfBirth?: string;
  address?: any;
  emergencyContact?: any;
  nationalId?: string;
  tinNumber?: string;
  photoUrl?: string;
  // Driver specific fields
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseClass?: string;
  drivingExperience?: string;
  previousEmployer?: string;
  vehicleTypes?: string[];
  // Queue regulator specific fields
  specialization?: string;
  certifications?: string[];
  shiftPreference?: string;
  languages?: string[];
  technicalSkills?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}
