import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Gates the shareholder portal. Convenience only — the API resolves every
 * shareholder's scope server-side, so removing this guard would change what
 * renders, never what data is reachable.
 */
export const shareholderGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // An admin landing here has taken a wrong turn — send them to their own area
  // rather than to the login page.
  if (!auth.isShareholder()) {
    router.navigate([auth.homeRoute()]);
    return false;
  }

  return true;
};
