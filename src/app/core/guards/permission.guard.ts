import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild} from '@angular/router';
import { Observable} from 'rxjs';
import { CollectionService } from '../services/collection/collection.service';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivateChild {

  constructor(private router: Router, private authService: AuthService, private collectionService: CollectionService) { }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiredPermissions = next.data.permissions as string[];

    if (!requiredPermissions) {
      return true;
    }

    return this.collectionService.withId(+next.params.collectionId)
      .pipe(
        map(collection => this.authService.checkPermissions(requiredPermissions, collection) ||
          this.router.createUrlTree(['page-not-found']))
      );
  }

}
