import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  NomineeInput,
  PaymentInfo,
  PaymentMethod,
  PaymentVerifyBulkResponse,
  PaymentVerifySelfResponse
} from '../models/payment.model';
import { ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  private readonly http = inject(HttpClient);
  private readonly paymentInfoSignal = signal<PaymentInfo | null>(null);

  readonly paymentInfo = this.paymentInfoSignal.asReadonly();

  loadPaymentInfo(): Observable<ApiResponse<PaymentInfo>> {
    return this.http.get<ApiResponse<PaymentInfo>>('/api/payments/info').pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.paymentInfoSignal.set(res.data);
        }
      })
    );
  }

  verifySelfPayment(
    method: PaymentMethod,
    receiptFile: File
  ): Observable<ApiResponse<PaymentVerifySelfResponse>> {
    const formData = new FormData();
    formData.append('method', method);
    formData.append('receipt', receiptFile);
    return this.http.post<ApiResponse<PaymentVerifySelfResponse>>(
      '/api/payments/verify-self',
      formData
    );
  }

  verifyBulkPayment(
    method: PaymentMethod,
    nominees: NomineeInput[],
    receiptFile: File
  ): Observable<ApiResponse<PaymentVerifyBulkResponse>> {
    const formData = new FormData();
    formData.append('method', method);
    formData.append('nominees', JSON.stringify(nominees));
    formData.append('receipt', receiptFile);
    return this.http.post<ApiResponse<PaymentVerifyBulkResponse>>(
      '/api/payments/verify-bulk',
      formData
    );
  }
}
