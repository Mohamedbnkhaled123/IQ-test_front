import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminOverview } from '../../../core/models/admin.model';
import { UserProfile } from '../../../core/models/user.model';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { parseHttpError } from '../../../core/utils/http-error.util';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';

@Component({
  selector: 'app-users-grants',
  imports: [ReactiveFormsModule, DatePipe, AlertBannerComponent],
  templateUrl: './users-grants.component.html',
  styleUrl: './users-grants.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersGrantsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly adminApi = inject(AdminApiService);

  readonly overview = input<AdminOverview | null>(null);
  readonly mode = input<'users' | 'grants'>('users');
  readonly changed = output<void>();

  readonly busy = signal<boolean>(false);
  readonly successMessage = signal<string>('');
  readonly errorMessage = signal<string>('');

  readonly grantForm = this.fb.nonNullable.group({
    nomineeName: ['', [Validators.required, Validators.minLength(2)]],
    nomineePhone: ['', [Validators.required, Validators.minLength(8)]]
  });

  grantManualAccess(user: UserProfile): void {
    this.busy.set(true);
    this.clearMessages();
    this.adminApi
      .createGrant({
        nomineeName: user.name,
        nomineePhone: user.phone,
        source: 'manual_admin',
        amountPaid: 0
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.successMessage.set(`تم تفعيل تذكرة دخول يدوية للطالب: ${user.name}`);
          this.changed.emit();
        },
        error: (err: unknown) => {
          this.busy.set(false);
          this.errorMessage.set(parseHttpError(err, 'تعذر تفعيل التذكرة').message);
        }
      });
  }

  submitComplimentaryGrant(): void {
    if (this.grantForm.invalid || this.busy()) {
      this.grantForm.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.clearMessages();
    const val = this.grantForm.getRawValue();
    this.adminApi
      .createGrant({
        nomineeName: val.nomineeName,
        nomineePhone: val.nomineePhone,
        source: 'admin_complimentary',
        amountPaid: 0
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.successMessage.set(`تمت إضافة التذكرة المجانية بنجاح لـ ${val.nomineeName}`);
          this.grantForm.reset();
          this.changed.emit();
        },
        error: (err: unknown) => {
          this.busy.set(false);
          this.errorMessage.set(parseHttpError(err, 'تعذر إضافة التذكرة المجانية').message);
        }
      });
  }

  removeGrant(grantId: string): void {
    this.busy.set(true);
    this.clearMessages();
    this.adminApi.deleteGrant(grantId).subscribe({
      next: () => {
        this.busy.set(false);
        this.successMessage.set('تم حذف التذكرة غير المستخدمة بنجاح.');
        this.changed.emit();
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.errorMessage.set(parseHttpError(err, 'تعذر حذف التذكرة').message);
      }
    });
  }

  sourceLabel(source: string): string {
    if (source === 'self_purchase') return 'دفع شخصي';
    if (source === 'user_purchase') return 'شراء جماعي';
    if (source === 'manual_admin') return 'تفعيل يدوي (واتساب)';
    return 'منحة مجانية';
  }

  statusLabel(status: string): string {
    if (status === 'available') return 'متاحة';
    if (status === 'in_use') return 'قيد الاستخدام';
    return 'مستخدمة';
  }

  private clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
  }
}
