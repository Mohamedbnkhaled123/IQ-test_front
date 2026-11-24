import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApiService } from '../services/auth-api.service';

export const userAuthGuard: CanActivateFn = () => {
  const authApi = inject(AuthApiService);
  const router = inject(Router);
  if (authApi.isUserLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/']);
};
