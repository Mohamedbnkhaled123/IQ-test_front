import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  AdminOverview,
  CreateGrantPayload,
  PlatformSettings,
  UploadedImageResponse
} from '../models/admin.model';
import { GrantSummary } from '../models/exam.model';
import { AdminQuestion, QuestionPayload } from '../models/question.model';
import { ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly overviewSignal = signal<AdminOverview | null>(null);
  private readonly questionsSignal = signal<AdminQuestion[]>([]);
  private readonly settingsSignal = signal<PlatformSettings | null>(null);

  readonly overview = this.overviewSignal.asReadonly();
  readonly questions = this.questionsSignal.asReadonly();
  readonly settings = this.settingsSignal.asReadonly();

  loadOverview(): Observable<ApiResponse<AdminOverview>> {
    return this.http.get<ApiResponse<AdminOverview>>('/api/admin/overview').pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.overviewSignal.set(res.data);
        }
      })
    );
  }

  loadQuestions(): Observable<ApiResponse<AdminQuestion[]>> {
    return this.http.get<ApiResponse<AdminQuestion[]>>('/api/admin/questions').pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.questionsSignal.set(res.data);
        }
      })
    );
  }

  createQuestion(payload: QuestionPayload): Observable<ApiResponse<AdminQuestion>> {
    return this.http.post<ApiResponse<AdminQuestion>>('/api/admin/questions', payload);
  }

  updateQuestion(
    id: string,
    payload: Partial<QuestionPayload>
  ): Observable<ApiResponse<AdminQuestion>> {
    return this.http.put<ApiResponse<AdminQuestion>>(`/api/admin/questions/${id}`, payload);
  }

  deleteQuestion(id: string): Observable<ApiResponse<{ deleted: boolean }>> {
    return this.http.delete<ApiResponse<{ deleted: boolean }>>(`/api/admin/questions/${id}`);
  }

  uploadQuestionImage(file: File): Observable<ApiResponse<UploadedImageResponse>> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<ApiResponse<UploadedImageResponse>>(
      '/api/admin/questions/upload-image',
      formData
    );
  }

  loadSettings(): Observable<ApiResponse<PlatformSettings>> {
    return this.http.get<ApiResponse<PlatformSettings>>('/api/admin/settings').pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.settingsSignal.set(res.data);
        }
      })
    );
  }

  updateSettings(
    payload: Partial<PlatformSettings>
  ): Observable<ApiResponse<PlatformSettings>> {
    return this.http.put<ApiResponse<PlatformSettings>>('/api/admin/settings', payload).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.settingsSignal.set(res.data);
        }
      })
    );
  }

  createGrant(payload: CreateGrantPayload): Observable<ApiResponse<GrantSummary>> {
    return this.http.post<ApiResponse<GrantSummary>>('/api/admin/grants', payload);
  }

  deleteGrant(id: string): Observable<ApiResponse<{ deleted: boolean }>> {
    return this.http.delete<ApiResponse<{ deleted: boolean }>>(`/api/admin/grants/${id}`);
  }
}
