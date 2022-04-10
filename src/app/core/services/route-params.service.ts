import { Injectable } from '@angular/core';
import { Router, ActivationEnd, ActivationStart, ActivatedRouteSnapshot } from '@angular/router';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RouteParamsService {
  params = {}; // for subscriptions to an individual parameter
  data = {}; // for subscriptions to individual route data

  private lastRoutePath = ''; // keep track of the last route snapshot path to prevent .next() on same state changes
  private currentRouteSubject = new ReplaySubject<ActivatedRouteSnapshot>();
  routeSnapshot = this.currentRouteSubject.asObservable();

  private activationStartEvent: ActivationStart; // save the start event so we can emit its data when activation has ended

  constructor(private router: Router, private authService: AuthService) {
    this.authService.user$.subscribe(user => {
      if (!user) { // reset service on logout
        this.reset();
      }
    });

    this.router.events.subscribe(event => {
      if (event instanceof ActivationStart) {
        this.activationStartEvent = event;
      }

      if (event instanceof ActivationEnd) {
        for (const key of Object.keys(event.snapshot.params)) {
          this.updateParam(key, event);
        }

        if (event.snapshot.component && this.lastRoutePath !== this.router.url) {
          this.lastRoutePath = this.router.url;
          this.currentRouteSubject.next(event.snapshot);
        }

        for (const key of Object.keys(this.data)) {
          this.updateData(key, this.activationStartEvent);
        }
      }
    });
  }

  get currentRoute() { return this.activationStartEvent; }

  private updateParam(key: string, event: ActivationEnd) {
    if (this.params[key] && this.params[key].value !== event.snapshot.params[key]) {
      this.params[key].next(event.snapshot.params[key]);
    }
  }

  paramAsObservable(param: string) {
    if (!this.params[param]) {
      this.params[param] = new BehaviorSubject(null);
    }

    return this.params[param].asObservable();
  }

  private updateData(key: string, event: ActivationStart) {
    if (this.data[key].value !== event.snapshot.data[key]) {
      this.data[key].next(event.snapshot.data[key]);
    }
  }

  dataAsObservable(data: string) {
    if (!this.data[data]) {
      this.data[data] = new BehaviorSubject(null);
    }

    return this.data[data].asObservable();
  }

  reset() {
    for (const key of Object.keys(this.params)) {
      this.params[key].next(null);
    }

    for (const key of Object.keys(this.data)) {
      this.data[key].next(null);
    }
  }

}
