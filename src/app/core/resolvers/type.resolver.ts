import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { TypeService } from '../services/collection/type.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TypeResolver implements Resolve<any> {

  constructor(private typeService: TypeService) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    const types = route.data.types as string[];
    if (!types || types.length === 0) {
      return of({});
    }

    const actions = types.map(typeKey => this.typeService.get(typeKey));
    return forkJoin(actions)
      .pipe(
        map(res => {
          const result = {};
          for (let i = 0; i < res.length; i++) {
            result[types[i]] = res[i];
          }
          return result;
        })
      );
  }
}
