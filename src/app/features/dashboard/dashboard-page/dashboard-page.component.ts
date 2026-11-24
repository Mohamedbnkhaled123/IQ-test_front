import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardApiService } from '../../../core/services/dashboard-api.service';
import { PaymentApiService } from '../../../core/services/payment-api.service';
import { parseHttpError } from '../../../core/utils/http-error.util';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BulkPurchaseFormComponent } from '../bulk-purchase-form/bulk-purchase-form.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    DatePipe,
    AlertBannerComponent,
    LoadingSpinnerComponent,
    BulkPurchaseFormComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent implements OnInit {
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly paymentApi = inject(PaymentApiService);

  readonly dashboard = this.dashboardApi.dashboard;
  readonly paymentInfo = this.paymentApi.paymentInfo;
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    this.refreshData();
    this.paymentApi.loadPaymentInfo().subscribe({
      error: () => {
        // Payment page loads payment info directly as well.
      }
    });
  }

  refreshData(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.dashboardApi.loadDashboard().subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(parseHttpError(err, 'تعذر تحميل بيانات لوحة التحكم').message);
      }
    });
  }

  grantStatusLabel(status: string): string {
    if (status === 'available') {
      return 'متاحة للبدء';
    }
    if (status === 'in_use') {
      return 'قيد الاختبار';
    }
    return 'مكتملة';
  }
}
