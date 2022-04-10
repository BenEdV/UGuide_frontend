import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ModelService } from '../../services/collection/constructs/model.service';

@Injectable({
  providedIn: 'root'
})
export class ModelResolver implements Resolve<any> {

  constructor(private modelService: ModelService) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    return this.modelService.all();
  }
}
