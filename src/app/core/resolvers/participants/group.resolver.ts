import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { GroupService } from '../../services/collection/participants/group.service';


@Injectable({
  providedIn: 'root'
})
export class GroupResolver implements Resolve<any> {

  constructor(private groupService: GroupService) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    return this.groupService.all();
  }
}
