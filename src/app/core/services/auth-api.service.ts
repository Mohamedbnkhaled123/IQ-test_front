import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import {
  AdminAuthResponse,
  AdminLoginPayload,
  ApiResponse,
  AuthConfig,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UserProfile
} from '../models/user.model';

const USER_TOKEN_KEY = 'iq_user_token';
const USER_PROFILE_KEY = 'iq_user_profile';
const ADMIN_TOKEN_KEY = 'iq_admin_token';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly userTokenSignal = signal<string | null>(this.readStorage(USER_TOKEN_KEY));
  private readonly adminTokenSignal = signal<string | null>(this.readStorage(ADMIN_TOKEN_KEY));
  private readonly userSignal = signal<UserProfile | null>(this.readUserProfile());

  readonly currentUser = this.userSignal.asReadonly();
  readonly isUserLoggedIn = computed(() => Boolean(this.userTokenSignal()));
  readonly isAdminLoggedIn = computed(() => Boolean(this.adminTokenSignal()));

  getAuthConfig(): Observable<AuthConfig> {
    return this.http.get<ApiResponse<AuthConfig>>('/api/auth/config').pipe(map((res) => res.data));
  }

  register(payload: RegisterPayload): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>('/api/auth/register', payload).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.saveUserSession(res.data);
        }
      })
    );
  }

  login(payload: LoginPayload): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>('/api/auth/login', payload).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.saveUserSession(res.data);
        }
      })
    );
  }

  adminLogin(payload: AdminLoginPayload): Observable<ApiResponse<AdminAuthResponse>> {
    return this.http.post<ApiResponse<AdminAuthResponse>>('/api/auth/admin/login', payload).pipe(
      tap((res) => {
        if (res.success && res.data?.token) {
          this.saveAdminSession(res.data.token);
        }
      })
    );
  }

  autoLoginAdmin(): Observable<AdminAuthResponse> {
    return this.http.post<ApiResponse<AdminAuthResponse>>('/api/auth/admin/login', {}).pipe(
      tap((res) => {
        if (res.success && res.data?.token) {
          this.saveAdminSession(res.data.token);
        }
      }),
      map((res) => res.data)
    );
  }

  setCurrentUser(user: UserProfile): void {
    this.userSignal.set(user);
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
  }

  getUserToken(): string | null {
    return this.userTokenSignal();
  }

  getAdminToken(): string | null {
    return this.adminTokenSignal();
  }

  logoutUser(): void {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_PROFILE_KEY);
    this.userTokenSignal.set(null);
    this.userSignal.set(null);
  }

  logoutAdmin(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    this.adminTokenSignal.set(null);
  }

  private saveAdminSession(token: string): void {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    this.adminTokenSignal.set(token);
  }

  private saveUserSession(auth: AuthResponse): void {
    localStorage.setItem(USER_TOKEN_KEY, auth.token);
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(auth.user));
    this.userTokenSignal.set(auth.token);
    this.userSignal.set(auth.user);
  }

  private readStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private readUserProfile(): UserProfile | null {
    const raw = this.readStorage(USER_PROFILE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }
}
