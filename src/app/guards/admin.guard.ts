import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // A signed-in shareholder is not lost, just in the wrong place — send them
  // to their portal rather than back to the login page.
  if (!auth.isAdmin()) {
    router.navigate([auth.homeRoute()]);
    return false;
  }

  return true;
};
