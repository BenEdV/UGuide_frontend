import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ScoreService } from '../../services/collection/constructs/score.service';

@Injectable({
  providedIn: 'root'
})
export class ScoreResolver implements Resolve<any> {

  constructor(private scoreService: ScoreService) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    const userIds = this.fixParams(route.params.participantId);
    const collectionIds = this.fixParams(route.params.collectionId);
    const activityIds = this.fixParams(route.params.activityId);
    const constructIds = this.fixParams(route.params.constructId);

    return this.scoreService.get(userIds, collectionIds, activityIds, constructIds, false);
  }

  fixParams(param) {
    return param ? [param] : null;
  }

}
