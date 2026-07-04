import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';

/**
 * Attaches the current user's id as the X-User-Id header so the API can
 * scope requests to the logged-in user.
 */
export const userHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const userId = inject(SessionService).userId();

  if (userId) {
    req = req.clone({ setHeaders: { 'X-User-Id': userId } });
  }

  return next(req);
};
