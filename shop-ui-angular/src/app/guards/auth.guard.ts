import { inject, PLATFORM_ID, REQUEST } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth/auth.service';

export const authGuard = async () => {
  if (isPlatformServer(inject(PLATFORM_ID))) {
    try {
      const req = inject(REQUEST) as any;
      const cookies: string = req.headers?.cookie || '';
      if (cookies.includes('better-auth.session_token')) {
        return true;
      }
    } catch {}
    return inject(Router).parseUrl('/login');
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  const session = authService.session();

  if (session === undefined) {
    await authService.init();
  }

  if (!authService.session()) {
    return router.parseUrl('/login');
  }

  return true;
};
