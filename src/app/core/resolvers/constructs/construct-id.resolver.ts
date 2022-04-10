import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { ConstructService } from '../../services/collection/constructs/construct.service';
import { mergeMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConstructIdResolver implements Resolve<any> {

  constructor(private constructService: ConstructService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    return this.constructService.withId(+route.params.constructId)
      .pipe(
        take(1),
        mergeMap(construct => {
          if (construct) {
            return of(construct);
          } else { // id not found
            this.router.navigate(['/page-not-found']);
            return EMPTY;
          }
        })
      );
  }
}
