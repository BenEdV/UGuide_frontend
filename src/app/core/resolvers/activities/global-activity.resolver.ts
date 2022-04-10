import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ActivityService } from '../../services/collection/activity.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalActivityResolver implements Resolve<any> {

  constructor(private activityService: ActivityService) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    return this.activityService.global();
  }
}
