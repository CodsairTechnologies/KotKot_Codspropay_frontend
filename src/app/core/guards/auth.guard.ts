import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');

  console.log('Token in authGuard:', token); 
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
