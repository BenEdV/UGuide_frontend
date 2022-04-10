import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { GroupService } from '../../services/collection/participants/group.service';


@Injectable({
  providedIn: 'root'
})
export class GroupIdResolver implements Resolve<any> {

  constructor(private groupService: GroupService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    return this.groupService.withId(+route.params.groupId)
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
