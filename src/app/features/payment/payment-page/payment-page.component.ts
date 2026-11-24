import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PaymentFailureInfo, PaymentMethod } from '../../../core/models/payment.model';
import { DashboardApiService } from '../../../core/services/dashboard-api.service';
import { PaymentApiService } from '../../../core/services/payment-api.service';
import { parseHttpError } from '../../../core/utils/http-error.util';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-payment-page',
  imports: [RouterLink, AlertBannerComponent, LoadingSpinnerComponent],
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentPageComponent implements OnInit {
  private readonly paymentApi = inject(PaymentApiService);
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly router = inject(Router);

  readonly paymentInfo = this.paymentApi.paymentInfo;
  readonly dashboard = this.dashboardApi.dashboard;
  readonly loading = signal<boolean>(true);
  readonly submitting = signal<boolean>(false);
  readonly method = signal<PaymentMethod>('instapay');
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly failureInfo = signal<PaymentFailureInfo | null>(null);

  readonly requiredAmount = computed<number>(() => {
    const dash = this.dashboard();
    if (dash) {
      return dash.nextAttemptPrice;
    }
    return this.paymentInfo()?.baseExamPrice ?? 250;
  });

  readonly fallbackWhatsappUrl = computed<string>(() => {
    const info = this.paymentInfo();
    const dash = this.dashboard();
    if (!info?.whatsappNumber) {
      return '';
    }
    const name = dash?.user?.name ?? '';
    const phone = dash?.user?.phone ?? '';
    const amount = this.requiredAmount();
    const text = `مرحباً، واجهت مشكلة في تأكيد إيصال الدفع للاختبار.\nالاسم: ${name}\nالتليفون: ${phone}\nالمبلغ المطلوب: ${amount} ج.م`;
    return `https://wa.me/${info.whatsappNumber}?text=${encodeURIComponent(text)}`;
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.paymentApi.loadPaymentInfo().subscribe({
      next: () => this.loadDashboardState(),
      error: (err: unknown) => {
        this.loading.set(false);
        this.failureInfo.set({
          message: parseHttpError(err, 'تعذر تحميل بيانات الدفع').message
        });
      }
    });
  }

  onMethodChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.method.set(target.value as PaymentMethod);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    this.selectedFile.set(file);
    this.failureInfo.set(null);
    if (!file) {
      this.previewUrl.set(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  submitPayment(): void {
    const file = this.selectedFile();
    if (!file) {
      this.failureInfo.set({ message: 'يرجى اختيار صورة إيصال التحويل أولاً.' });
      return;
    }

    this.submitting.set(true);
    this.failureInfo.set(null);

    this.paymentApi.verifySelfPayment(this.method(), file).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigate(['/exam']);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        const parsed = parseHttpError(err, 'تعذر التحقق من الإيصال');
        this.failureInfo.set({
          message: parsed.message,
          reason: parsed.reason,
          whatsappUrl: parsed.whatsappUrl || this.fallbackWhatsappUrl()
        });
      }
    });
  }

  private loadDashboardState(): void {
    this.dashboardApi.loadDashboard().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false)
    });
  }
}
