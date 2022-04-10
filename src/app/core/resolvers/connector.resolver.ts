import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ConnectorService } from '../services/collection/connector.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectorResolver implements Resolve<any> {

  constructor(private connectorService: ConnectorService) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    return this.connectorService.all();
  }
}
