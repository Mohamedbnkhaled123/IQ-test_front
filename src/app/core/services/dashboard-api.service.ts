import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { DashboardData } from '../models/exam.model';
import { ApiResponse } from '../models/user.model';
import { AuthApiService } from './auth-api.service';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly authApi = inject(AuthApiService);
  private readonly dashboardSignal = signal<DashboardData | null>(null);

  readonly dashboard = this.dashboardSignal.asReadonly();

  loadDashboard(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>('/api/dashboard').pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.dashboardSignal.set(res.data);
          this.authApi.setCurrentUser(res.data.user);
        }
      })
    );
  }

  clearCache(): void {
    this.dashboardSignal.set(null);
  }
}
