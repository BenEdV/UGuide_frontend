import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, switchMap, take, filter } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { AuthService } from '../services/auth.service';
import { RouteParamsService } from '../services/route-params.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private accessTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService, private routeParams: RouteParamsService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.endsWith('/authentication/refresh') && localStorage.getItem(this.authService.refreshCSRFKey)) {
      request = this.addToken(request, localStorage.getItem(this.authService.refreshCSRFKey));
    } else if (localStorage.getItem(this.authService.accessCSRFKey)) {
      request = this.addToken(request, localStorage.getItem(this.authService.accessCSRFKey));
    }

    return next.handle(request).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !request.url.endsWith('/authentication/')) {
        // Refresh token is expired
        if (request.url.endsWith('/authentication/refresh')) {
          this.authService.logout(false, (this.routeParams.currentRoute?.snapshot as any)._routerState?.url);
          this.isRefreshing = false;
          return of(null);
        } else {
          return this.handle401Error(request, next);
        }
      } else {
        return throwError(error);
      }
    }));
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'X-CSRF-TOKEN': `${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.accessTokenSubject.next(null);

      return this.authService.setUserFromRefreshToken().pipe(
        switchMap(user => {
          this.isRefreshing = false;
          this.accessTokenSubject.next((user as unknown as User).access_csrf);
          return next.handle(this.addToken(request, (user as unknown as User).access_csrf));
        }));
    } else {
      return this.accessTokenSubject.pipe(
        filter(user => user != null),
        take(1),
        switchMap(accessCSRF => {
          return next.handle(this.addToken(request, accessCSRF));
        }));
    }
  }
}
