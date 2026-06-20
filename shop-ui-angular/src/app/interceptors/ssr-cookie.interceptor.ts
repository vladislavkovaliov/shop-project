import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID, REQUEST } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export const ssrCookieInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isPlatformServer(inject(PLATFORM_ID))) {
    return next(req);
  }

  try {
    const originalReq = inject(REQUEST) as any;
    const cookie =
      typeof originalReq.headers?.get === 'function'
        ? originalReq.headers.get('Cookie')
        : originalReq.headers?.cookie;

    if (cookie) {
      req = req.clone({ setHeaders: { Cookie: cookie } });
    }
  } catch {}

  return next(req);
};
