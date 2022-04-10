import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { RouteParamsService } from './route-params.service';
import { CollectionService } from './collection/collection.service';
import { Collection } from '../interfaces/collection';
import { Params } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  resource = 'logging';
  currentPath: string;
  currentParams: Params;
  currentQueryParams: Params;
  activeCollection: Collection;
  subsessionKey = 'subsession';


  constructor(private routeParams: RouteParamsService,
              private api: ApiService,
              private collectionService: CollectionService,
              private authService: AuthService) {
    this.collectionService.activeCollection.subscribe(collection => this.activeCollection = collection);

    this.routeParams.routeSnapshot.subscribe(snapshot => {
      this.currentPath = window.location.pathname;
      this.currentParams = snapshot.params;
      this.currentQueryParams = snapshot.queryParams;
      this.state();
    });
  }

  get loggingEnabled(): boolean {
    return this.activeCollection?.settings?.logging;
  }

  state() {
    if (!this.loggingEnabled || !this.authService.user) {
      return;
    }

    const payload = {
      subject: 'State',
      event: 'StateChange',
      url: this.currentPath,
      parameters: this.currentParams,
      queryParameters: this.currentQueryParams,
      timestamp: this.currentTimestamp(),
      subsession: Number(sessionStorage.getItem(this.subsessionKey))
    };

    return this.api.post(`${this.resource}/state`, payload, false, true).subscribe();
  }

  event(subject: string, event: string, details: object | string) {
    if (!this.loggingEnabled || !this.authService.user) {
      return;
    }

    const payload = {
      subject,
      event,
      details,
      url: this.currentPath,
      parameters: this.currentParams,
      timestamp: this.currentTimestamp(),
      subsession: Number(sessionStorage.getItem(this.subsessionKey))
    };

    return this.api.post(`${this.resource}/state`, payload, false, true).subscribe();
  }

  currentTimestamp() {
    return new Date().toISOString();
  }
}
