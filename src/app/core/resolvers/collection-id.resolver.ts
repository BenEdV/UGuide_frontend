import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CollectionService } from '../services/collection/collection.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionIdResolver implements Resolve<any> {

  constructor(private collectionService: CollectionService) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    return this.collectionService.withId(+route.params.collectionId);
  }
}
