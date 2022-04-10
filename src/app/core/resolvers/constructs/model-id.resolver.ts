import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { ModelService } from '../../services/collection/constructs/model.service';
import { mergeMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ModelIdResolver implements Resolve<any> {

  constructor(private modelService: ModelService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    return this.modelService.withId(+route.params.modelId)
      .pipe(
        take(1),
        mergeMap(model => {
          if (model) {
            return of(model);
          } else { // id not found
            this.router.navigate(['/page-not-found']);
            return EMPTY;
          }
        })
      );
  }
}
