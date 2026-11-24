import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthApiService } from '../services/auth-api.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authApi = inject(AuthApiService);
  const isAdminRoute = req.url.startsWith('/api/admin');
  const token = isAdminRoute ? authApi.getAdminToken() : authApi.getUserToken();

  if (!token || !req.url.startsWith('/api')) {
    return next(req);
  }

  const authorizedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authorizedReq);
};
