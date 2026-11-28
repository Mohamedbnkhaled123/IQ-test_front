import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { parseHttpError } from '../../../core/utils/http-error.util';
import { AlertBannerComponent } from '../../../shared/components/alert-banner/alert-banner.component';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule, AlertBannerComponent],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  readonly loading = signal<boolean>(false);
  readonly demoMode = signal<boolean>(false);
  readonly needsSetup = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  ngOnInit(): void {
    if (this.authApi.isAdminLoggedIn()) {
      void this.router.navigate(['/admin']);
      return;
    }
    this.authApi.getAuthConfig().subscribe({
      next: (cfg) => {
        if (cfg.adminNoPasswordMode) {
          this.demoMode.set(true);
          this.enterDemoAdmin();
          return;
        }
        this.needsSetup.set(cfg.adminConfigured === false);
      },
      error: () => {
        // Keep manual login form available if config fetch fails.
      }
    });
  }

  enterDemoAdmin(): void {
    if (this.loading()) {
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.authApi.autoLoginAdmin().subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/admin']);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(parseHttpError(err, 'تعذر الدخول المباشر للوحة الإدارة').message);
      }
    });
  }

  submit(): void {
    if (this.loginForm.invalid || this.loading()) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.authApi.adminLogin(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/admin']);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(parseHttpError(err, 'بيانات دخول الأدمن غير صحيحة').message);
      }
    });
  }
}
