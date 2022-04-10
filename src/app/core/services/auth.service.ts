import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { shareReplay, tap, map, catchError } from 'rxjs/operators';
import { BehaviorSubject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../interfaces/user';
import { Collection } from '../interfaces/collection';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { TranslateService } from '@ngx-translate/core';
import { PermissionOperation } from '@shared/directives/has-permission.directive';
import { RoleOperation } from '@shared/directives/has-role.directive';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User>(null);
  user$ = this.userSubject.asObservable();

  private storageKey = 'idp'; // Stores whether the user has the HttpOnly cookie (used to show/hide the login form)
  accessCSRFKey = 'access_csrf';
  refreshCSRFKey = 'refresh_csrf';
  subsessionKey = 'subsession';

  constructor(private api: ApiService,
              private router: Router,
              private translate: TranslateService,
              private loadingBarService: LoadingBarService) { }

  get user() { return this.userSubject.value; }

  get hasCookie() { return localStorage.getItem(this.storageKey); }

  login(username: string, password: string, notifyOnError = false) {
    sessionStorage.setItem(this.subsessionKey, '0');
    return this.api.post('authentication/', {username, password}, notifyOnError)
      .pipe(
        tap(res => this.setUser(res as unknown as User)),
        shareReplay()
      );
  }

  logout(removeToken: boolean = true, returnUrl?: string) {
    // remove_token can be set to false if we know that the token is expired so that there is no failed expire
    if (removeToken) {
      this.api.post('authentication/remove', {}, false).subscribe(); // Delete HttpOnly Cookie on the server
    }
    this.loadingBarService.useRef('http').stop();
    this.setUser(null); // this will also reset services
    if (sessionStorage.getItem('SAMLlogin')) {
      this.router.navigate(['saml-logout'], {queryParams: {returnUrl}});
    } else {
      this.router.navigate(['login'], {queryParams: {returnUrl}});
    }
  }

  setUserFromRefreshToken() { // Get the currentuser by checking on the server if the HttpOnly cookie is set.
    return this.api.post('authentication/refresh', {}, false)
      .pipe(
        tap(res => this.setUser(res as unknown as User)),
        shareReplay()
      );
  }

  setUserFromSAMLToken(authCode: string, nonce: string, idp: string) {
    return this.api.post('authentication/', {username: authCode, password: nonce, idp}, false)
      .pipe(
        tap(res => this.setUser(res as unknown as User)),
        shareReplay()
      );
  }

  setUser(authResult: User) {
    this.userSubject.next(authResult);
    if (authResult) {
      if (authResult.idp) {
        localStorage.setItem(this.storageKey, authResult.idp);
      }
      if (authResult.access_csrf) {
        localStorage.setItem(this.accessCSRFKey, authResult.access_csrf);
      }
      if (authResult.refresh_csrf) {
        localStorage.setItem(this.refreshCSRFKey, authResult.refresh_csrf);
      }
      this.handleUserSettings(authResult.settings);
    } else {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.accessCSRFKey);
      localStorage.removeItem(this.refreshCSRFKey);
      this.translate.use(this.translate.getDefaultLang());
    }
  }

  handleUserSettings(settings: {[key: string]: any}) {
    if (!settings) {
      return;
    }

    if (settings.lang) {
      this.translate.use(settings.lang);
    }
  }

  register(firstName: string, lastName: string, email: string, password: string, institutionId: number,
           captchaToken: string, notifyOnError = false) {
    const payload = {
      first_name: firstName,
      last_name: lastName,
      institution_id: institutionId,
      email,
      password,
      captcha_token: captchaToken
    };

    return this.api.post('authentication/register', payload, notifyOnError);
  }

  private existPermission(collection: Collection, permission: string): boolean {
    const upperCasePermission = permission.toUpperCase();
    return collection.permissions.find(p => p.toUpperCase() === upperCasePermission) !== undefined;
  }

  checkPermissions(permissions: string[], collection: Collection, operator: PermissionOperation = 'AND'): boolean {
    if (!permissions) {
      return true;
    }

    if (collection && collection.permissions) {
      if (operator === 'OR') {
        return permissions.some(permission => this.existPermission(collection, permission));
      } else {
        return permissions.every(permission => this.existPermission(collection, permission));
      }
    }
    return false;
  }

  private existRole(collection: Collection, role: string): boolean {
    const upperCaseRole = role.toUpperCase();
    return collection.roles.find(r => r.toUpperCase() === upperCaseRole) !== undefined;
  }

  checkRoles(roles: string[], collection: Collection, operator: RoleOperation = 'AND'): boolean {
    if (!roles) {
      return true;
    }

    if (collection && collection.roles) {
      if (operator === 'OR') {
        return roles.some(role => this.existRole(collection, role));
      } else {
        return roles.every(role => this.existRole(collection, role));
      }
    }
    return false;
  }

  updateSettings(settings) {
    this.handleUserSettings(settings);
    return this.api.post(`currentuser/settings`, settings).pipe(
      map(newSettings => this.user.settings = newSettings)
    ); // backend will upsert them: no need to also send unchanged settings
  }

}
