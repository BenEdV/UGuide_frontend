import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { ParticipantService } from '../../services/collection/participants/participant.service';

@Injectable({
  providedIn: 'root'
})
export class ParticipantIdResolver implements Resolve<any> {

  constructor(private participantService: ParticipantService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    const participantKey = (route.data.participantKeys && route.data.participantKeys[0] || 'participant')  + 'Id';
    return this.participantService.withId(+route.params[participantKey])
      .pipe(
        take(1),
        mergeMap(participant => {
          if (participant) {
            return of(participant);
          } else { // id not found
            this.router.navigate(['/page-not-found']);
            return EMPTY;
          }
        })
      );
  }
}
