import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { ParticipantService } from '../../services/collection/participants/participant.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ParticipantResolver implements Resolve<any> {

  constructor(private participantService: ParticipantService) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    const participantKeys: string[] = route.data.participantKeys;
    if (!participantKeys || participantKeys.length === 0) {
      return this.participantService.all();
    }

    const actions = [];
    for (const participantKey of participantKeys) {
      switch (participantKey) {
        case 'student':
          actions.push(this.participantService.students());
          break;
        default:
          actions.push(this.participantService.getUsers(null, participantKey));
      }
    }

    return forkJoin(actions).pipe(
      map(res => {
        const result = {};
        for (let i = 0; i < res.length; i++) {
          result[participantKeys[i] + 'List'] = res[i];
        }
        return result;
      })
    );
  }
}
