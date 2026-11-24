import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentRecord } from '../../../core/models/payment.model';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { parseHttpError } from '../../../core/utils/http-error.util';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';

@Component({
  selector: 'app-settings-payments',
  imports: [ReactiveFormsModule, DatePipe, AlertBannerComponent],
  templateUrl: './settings-payments.component.html',
  styleUrl: './settings-payments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPaymentsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminApi = inject(AdminApiService);

  readonly payments = input<PaymentRecord[]>([]);
  readonly settingsSaved = output<void>();

  readonly saving = signal<boolean>(false);
  readonly successMessage = signal<string>('');
  readonly errorMessage = signal<string>('');

  readonly settingsForm = this.fb.nonNullable.group({
    examTitle: ['', [Validators.required]],
    baseExamPrice: [250, [Validators.required, Validators.min(0)]],
    retakeMultiplier: [2, [Validators.required, Validators.min(1)]],
    iqScaleMin: [70, [Validators.required]],
    iqScaleMax: [145, [Validators.required]],
    lowMax: [89, [Validators.required]],
    averageMax: [115, [Validators.required]]
  });

  ngOnInit(): void {
    this.adminApi.loadSettings().subscribe({
      next: (res) => {
        const s = res.data;
        if (s) {
          this.settingsForm.patchValue({
            examTitle: s.examTitle,
            baseExamPrice: s.baseExamPrice,
            retakeMultiplier: s.retakeMultiplier,
            iqScaleMin: s.iqScaleMin,
            iqScaleMax: s.iqScaleMax,
            lowMax: s.iqBands.lowMax,
            averageMax: s.iqBands.averageMax
          });
        }
      },
      error: (err: unknown) => {
        this.errorMessage.set(parseHttpError(err, 'تعذر تحميل الإعدادات').message);
      }
    });
  }

  saveSettings(): void {
    if (this.settingsForm.invalid || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
    const raw = this.settingsForm.getRawValue();
    this.adminApi
      .updateSettings({
        examTitle: raw.examTitle,
        baseExamPrice: raw.baseExamPrice,
        retakeMultiplier: raw.retakeMultiplier,
        iqScaleMin: raw.iqScaleMin,
        iqScaleMax: raw.iqScaleMax,
        iqBands: { lowMax: raw.lowMax, averageMax: raw.averageMax }
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.successMessage.set('تم حفظ الإعدادات وتحديث التسعير بنجاح.');
          this.settingsSaved.emit();
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.errorMessage.set(parseHttpError(err, 'تعذر حفظ الإعدادات').message);
        }
      });
  }

  buyerDisplay(payment: PaymentRecord): string {
    if (payment.buyerUserId && typeof payment.buyerUserId === 'object') {
      return `${payment.buyerUserId.name} (${payment.buyerUserId.phone})`;
    }
    return '—';
  }
}
