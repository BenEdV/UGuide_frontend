import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { ActivityService } from '../../services/collection/activity.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ActivityResolver implements Resolve<any> {

  constructor(private activityService: ActivityService) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    const activityKeys: string[] = route.data.activityKeys;
    if (!activityKeys || activityKeys.length === 0) {
      return this.activityService.all();
    }

    const actions = [];
    for (const activityKey of activityKeys) {
      switch (activityKey) {
        case 'exam':
          actions.push(this.activityService.exams());
          break;
        case 'survey':
          actions.push(this.activityService.surveys());
          break;
        case 'question':
          actions.push(this.activityService.questions());
          break;
        case 'studyMaterial':
          actions.push(this.activityService.studyMaterial());
          break;
        default:
          actions.push(this.activityService.withType(activityKey));
      }
    }

    return forkJoin(actions).pipe(
      map(res => {
        const result = {};
        for (let i = 0; i < res.length; i++) {
          result[activityKeys[i] + 'List'] = res[i];
        }
        return result;
      })
    );
  }
}
