import { Injectable } from '@angular/core';
import { CollectionDataService } from './collection-data.service';
import { ApiService } from '../api.service';
import { Connector } from '../../interfaces/connector';
import { RouteParamsService } from '../route-params.service';
import { AuthService } from '../auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConnectorService extends CollectionDataService {

  constructor(private api: ApiService,
              private routeParamsService: RouteParamsService,
              private authService: AuthService) {
    super(api, routeParamsService, authService);
    this.resource = 'connector';
  }

  callbackURL(connector: Connector) {
    return `${environment.api_url}external/${connector.code}`;
  }

  add(title: string, implementation: string, remindo: any) {
    const payload = {
      title,
      implementation,
      remindo
    };

    return super.addData(payload);
  }

  edit(id: number, title: string, settings?: any) {
    const payload = {
      title,
      settings
    };

    return super.editData(id, payload);
  }

  delete(id: number) {
    return super.delete(id);
  }

}
