import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionService } from '../services/session.service';

/**
 * If the API rejects a request with 401 (e.g. the stored session points at a
 * user that doesn't exist in the current database), clear the session and send
 * the user to the login screen instead of failing silently.
 */
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        session.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
