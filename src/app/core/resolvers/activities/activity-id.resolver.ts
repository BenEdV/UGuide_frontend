import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import {EMPTY, Observable, of} from 'rxjs';
import { ActivityService } from '../../services/collection/activity.service';
import { mergeMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ActivityIdResolver implements Resolve<any> {

  constructor(private activityService: ActivityService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    const activityKey = (route.data.activityKeys && route.data.activityKeys[0] || 'activity')  + 'Id';
    return this.activityService.withId(+route.params[activityKey])
      .pipe(
        take(1),
        mergeMap(activity => {
          if (activity) {
            return of(activity);
          } else { // id not found
            this.router.navigate(['/page-not-found']);
            return EMPTY;
          }
        })
      );
  }
}
