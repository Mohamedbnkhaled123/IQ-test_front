import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SelfIqRating } from '../../../core/models/user.model';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { parseHttpError } from '../../../core/utils/http-error.util';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';
import { BrandLogoComponent } from '../../../shared/components/brand-logo/brand-logo.component';
import { EXAM_MODULES } from '../../exam/exam-runner/exam-modules.config';

type AuthTab = 'register' | 'login';

@Component({
  selector: 'app-landing',
  imports: [ReactiveFormsModule, AlertBannerComponent, BrandLogoComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  readonly activeTab = signal<AuthTab>('register');
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly dobSignal = signal<string>('');

  readonly iqRatings: SelfIqRating[] = ['ذكاء عالي', 'ذكاء متوسط', 'أقل من المتوسط'];
  readonly modules = EXAM_MODULES;

  readonly registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(8)]],
    dateOfBirth: ['', [Validators.required]],
    occupation: ['', [Validators.required, Validators.minLength(2)]],
    hobbies: ['', [Validators.required, Validators.minLength(2)]],
    selfIqRating: ['ذكاء متوسط' as SelfIqRating, [Validators.required]]
  });

  readonly loginForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(8)]]
  });

  readonly calculatedAge = computed<number | null>(() => {
    const dobValue = this.dobSignal();
    if (!dobValue) {
      return null;
    }
    const dob = new Date(dobValue);
    if (Number.isNaN(dob.getTime())) {
      return null;
    }
    const today = new Date();
    let age = today.getUTCFullYear() - dob.getUTCFullYear();
    const monthDiff = today.getUTCMonth() - dob.getUTCMonth();
    const dayDiff = today.getUTCDate() - dob.getUTCDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age -= 1;
    }
    return Math.max(0, age);
  });

  ngOnInit(): void {
    if (this.authApi.isUserLoggedIn()) {
      void this.router.navigate(['/dashboard']);
    }
  }

  switchTab(tab: AuthTab): void {
    this.activeTab.set(tab);
    this.errorMessage.set('');
  }

  onDateOfBirthInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dobSignal.set(target.value);
  }

  submitRegister(): void {
    if (this.registerForm.invalid || this.loading()) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.authApi.register(this.registerForm.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(parseHttpError(err, 'تعذر إتمام التسجيل').message);
      }
    });
  }

  submitLogin(): void {
    if (this.loginForm.invalid || this.loading()) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.authApi.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(parseHttpError(err, 'تعذر تسجيل الدخول').message);
      }
    });
  }
}
