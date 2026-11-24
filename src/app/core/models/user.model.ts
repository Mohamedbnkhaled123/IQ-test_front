export type SelfIqRating = 'ذكاء عالي' | 'ذكاء متوسط' | 'أقل من المتوسط';

export interface UserProfile {
  _id: string;
  name: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  occupation: string;
  hobbies: string;
  selfIqRating: SelfIqRating;
  completedAttemptsCount: number;
  createdAt?: string;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  dateOfBirth: string;
  occupation: string;
  hobbies: string;
  selfIqRating: SelfIqRating;
}

export interface LoginPayload {
  name: string;
  phone: string;
}

export interface AdminLoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface AdminIdentity {
  username: string;
}

export interface AdminAuthResponse {
  token: string;
  admin: AdminIdentity;
}

export interface AuthConfig {
  freePreviewMode: boolean;
  adminNoPasswordMode: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
  reason?: string;
  whatsappUrl?: string;
}

export interface ApiErrorBody {
  success?: boolean;
  message?: string;
  code?: string;
  reason?: string;
  whatsappUrl?: string;
}
