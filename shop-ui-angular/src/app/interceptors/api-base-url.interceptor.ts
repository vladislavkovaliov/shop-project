import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '@app/tokens/api-base-url.token';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = inject(API_BASE_URL);

  if (apiUrl && req.url.startsWith('/api/')) {
    const cloned = req.clone({
      url: `${apiUrl}${req.url}`,
      withCredentials: true,
    });
    return next(cloned);
  }

  return next(req);
};
