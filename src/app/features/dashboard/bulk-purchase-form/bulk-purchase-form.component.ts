import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import {
  NomineeInput,
  PaymentFailureInfo,
  PaymentInfo,
  PaymentMethod
} from '../../../core/models/payment.model';
import { PaymentApiService } from '../../../core/services/payment-api.service';
import { parseHttpError } from '../../../core/utils/http-error.util';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';

@Component({
  selector: 'app-bulk-purchase-form',
  imports: [AlertBannerComponent],
  templateUrl: './bulk-purchase-form.component.html',
  styleUrl: './bulk-purchase-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BulkPurchaseFormComponent {
  private readonly paymentApi = inject(PaymentApiService);

  readonly baseExamPrice = input.required<number>();
  readonly paymentInfo = input<PaymentInfo | null>(null);
  readonly purchased = output<void>();

  readonly nominees = signal<NomineeInput[]>([{ name: '', phone: '' }]);
  readonly method = signal<PaymentMethod>('instapay');
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly submitting = signal<boolean>(false);
  readonly errorInfo = signal<PaymentFailureInfo | null>(null);
  readonly successMessage = signal<string>('');

  readonly totalAmount = computed<number>(
    () => this.nominees().length * this.baseExamPrice()
  );

  addNominee(): void {
    this.nominees.update((list) => [...list, { name: '', phone: '' }]);
  }

  removeNominee(index: number): void {
    if (this.nominees().length <= 1) {
      return;
    }
    this.nominees.update((list) => list.filter((_, i) => i !== index));
  }

  onNomineeInput(index: number, field: 'name' | 'phone', event: Event): void {
    const target = event.target as HTMLInputElement;
    this.nominees.update((list) =>
      list.map((item, i) => (i === index ? { ...item, [field]: target.value } : item))
    );
  }

  onMethodChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.method.set(target.value as PaymentMethod);
  }

  onFileSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0] ?? null;
    this.selectedFile.set(file);
    this.errorInfo.set(null);
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

  submitBulkPurchase(): void {
    const cleaned = this.nominees()
      .map((n) => ({ name: n.name.trim(), phone: n.phone.trim() }))
      .filter((n) => n.name.length >= 2 && n.phone.length >= 8);

    if (cleaned.length !== this.nominees().length) {
      this.errorInfo.set({ message: 'يرجى إدخال الاسم ورقم التليفون بشكل صحيح لكل شخص.' });
      return;
    }
    const file = this.selectedFile();
    if (!file) {
      this.errorInfo.set({ message: 'يرجى رفع صورة إيصال الدفع الجماعي أولاً.' });
      return;
    }

    this.submitting.set(true);
    this.errorInfo.set(null);
    this.successMessage.set('');

    this.paymentApi.verifyBulkPayment(this.method(), cleaned, file).subscribe({
      next: (res) => {
        this.submitting.set(false);
        const count = res.data?.grants?.length ?? cleaned.length;
        this.successMessage.set(`تم اعتماد الإيصال وتفعيل ${count} تذكرة اختبار بنجاح.`);
        this.nominees.set([{ name: '', phone: '' }]);
        this.selectedFile.set(null);
        this.previewUrl.set(null);
        this.purchased.emit();
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        const parsed = parseHttpError(err, 'تعذر التحقق من إيصال الدفع الجماعي');
        this.errorInfo.set({
          message: parsed.message,
          reason: parsed.reason,
          whatsappUrl: parsed.whatsappUrl
        });
      }
    });
  }
}
