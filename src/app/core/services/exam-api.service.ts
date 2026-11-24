import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  ExamAnswerPayload,
  ExamResult,
  StartExamResponse,
  SubmitExamResponse
} from '../models/exam.model';
import { ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ExamApiService {
  private readonly http = inject(HttpClient);
  private readonly activeSessionSignal = signal<StartExamResponse | null>(null);

  readonly activeSession = this.activeSessionSignal.asReadonly();

  startExam(): Observable<ApiResponse<StartExamResponse>> {
    return this.http.post<ApiResponse<StartExamResponse>>('/api/exam/start', {}).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.activeSessionSignal.set(res.data);
        }
      })
    );
  }

  submitExam(
    attemptId: string,
    answers: ExamAnswerPayload[]
  ): Observable<ApiResponse<SubmitExamResponse>> {
    return this.http
      .post<ApiResponse<SubmitExamResponse>>(`/api/exam/${attemptId}/submit`, { answers })
      .pipe(
        tap(() => {
          this.activeSessionSignal.set(null);
        })
      );
  }

  getResult(attemptId: string): Observable<ApiResponse<ExamResult>> {
    return this.http.get<ApiResponse<ExamResult>>(`/api/exam/${attemptId}/result`);
  }

  clearSession(): void {
    this.activeSessionSignal.set(null);
  }
}
