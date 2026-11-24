import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/guards/admin-auth.guard';
import { userAuthGuard } from './core/guards/user-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/auth/landing/landing.component').then((m) => m.LandingComponent)
  },
  {
    path: 'dashboard',
    canActivate: [userAuthGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard-page/dashboard-page.component').then(
        (m) => m.DashboardPageComponent
      )
  },
  {
    path: 'payment',
    canActivate: [userAuthGuard],
    loadComponent: () =>
      import('./features/payment/payment-page/payment-page.component').then(
        (m) => m.PaymentPageComponent
      )
  },
  {
    path: 'exam',
    canActivate: [userAuthGuard],
    loadComponent: () =>
      import('./features/exam/exam-runner/exam-runner.component').then(
        (m) => m.ExamRunnerComponent
      )
  },
  {
    path: 'result/:attemptId',
    canActivate: [userAuthGuard],
    loadComponent: () =>
      import('./features/result/result-page/result-page.component').then(
        (m) => m.ResultPageComponent
      )
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./features/admin/admin-login/admin-login.component').then(
        (m) => m.AdminLoginComponent
      )
  },
  {
    path: 'admin',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/admin/admin-shell/admin-shell.component').then(
        (m) => m.AdminShellComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
