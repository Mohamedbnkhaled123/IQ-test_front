import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthApiService } from '../services/auth-api.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authApi = inject(AuthApiService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        if (req.url.startsWith('/api/admin')) {
          authApi.logoutAdmin();
          void router.navigate(['/admin/login']);
        } else if (!req.url.startsWith('/api/auth')) {
          authApi.logoutUser();
          void router.navigate(['/']);
        }
      }
      return throwError(() => err);
    })
  );
};
