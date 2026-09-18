/**
 * Authentication Type Definitions
 */

export interface PKICertificateInfo {
  serialNumber?: string;
  thumbprint?: string;
  subjectDN?: string;
  issuerDN?: string;
  validFrom?: string;
  validTo?: string;
  keyAlgorithm?: string;
  version?: string;
}

export interface User {
  id?: string;
  name?: string;
  email?: string;
  citizenId?: string;
  role?: string;
  token?: string;
  commandoPosition?: string;
  avatarUri?: string;
  pkiCertificate?: PKICertificateInfo;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  citizenId?: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password?: string;
  citizenId: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}
