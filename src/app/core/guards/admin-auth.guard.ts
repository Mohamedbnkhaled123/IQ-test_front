import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { AuthApiService } from '../services/auth-api.service';

export const adminAuthGuard: CanActivateFn = () => {
  const authApi = inject(AuthApiService);
  const router = inject(Router);
  if (authApi.isAdminLoggedIn()) {
    return true;
  }

  return authApi.getAuthConfig().pipe(
    switchMap((cfg) => {
      if (cfg.adminNoPasswordMode) {
        return authApi.autoLoginAdmin().pipe(map(() => true));
      }
      return of(router.createUrlTree(['/admin/login']));
    }),
    catchError(() => of(router.createUrlTree(['/admin/login'])))
  );
};
