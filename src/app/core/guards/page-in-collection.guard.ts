import { Injectable } from '@angular/core';
import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CollectionService } from '../services/collection/collection.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PageInCollectionGuard implements CanActivateChild {

  constructor(private router: Router, private collectionService: CollectionService) { }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const pageKey = next.data.key;
    const modules = next.data.modules || [];

    if (!pageKey && modules.length === 0) { // if it cannot be checked, then allow access.
      return true;
    }

    const collectionId = +next.parent.params.collectionId;
    return this.collectionService.withId(collectionId)
      .pipe(
        map(collection => {
          if (collection) {
            if (collection.pages.indexOf(pageKey) !== -1) {
              return true;
            }

            for (const module of modules) {
              if (collection.pages.indexOf(module) !== -1) {
                return true;
              }
            }
          }

          return this.router.createUrlTree(['/page-not-found']);
        })
      );
  }

}
