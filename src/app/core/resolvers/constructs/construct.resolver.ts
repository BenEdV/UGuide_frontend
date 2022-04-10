import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ConstructService } from '../../services/collection/constructs/construct.service';

@Injectable({
  providedIn: 'root'
})
export class ConstructResolver implements Resolve<any> {

  constructor(private constructService: ConstructService) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    return this.constructService.all();
  }
}
