import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { shareReplay } from 'rxjs/operators';
import { CollectionDataService } from './collection-data.service';
import { RouteParamsService } from '../route-params.service';

@Injectable({
  providedIn: 'root'
})
export class TypeService extends CollectionDataService {

  constructor(private api: ApiService, private routeParams: RouteParamsService, private authService: AuthService) {
    super(api, routeParams, authService);
  }

  get(key: string) {
    if (!this.cache[key]) {
      this.cache[key] = this.api.get(`${this.collectionId}/type/${key}`)
        .pipe(
          shareReplay()
        );
    }

    return this.cache[key];
  }
}
