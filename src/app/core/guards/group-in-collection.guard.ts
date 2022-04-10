import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { CollectionService } from '../services/collection/collection.service';
import { Collection } from '../interfaces/collection';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GroupInCollectionGuard implements CanActivate {

  constructor(private collectionService: CollectionService, private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const collectionId = +next.params.collectionId;
      const groupId = +next.params.groupId;
      return this.collectionService.withId(collectionId)
        .pipe(
          map((collection: Collection) => collection && collection.subcollections.find(c => c.id === groupId) !== undefined ||
            this.router.createUrlTree(['/page-not-found']))
        );
  }

}
