import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ExternalService {
  constructor(private api: ApiService,
              private router: Router) { }

  getOsirisResults() {
    return this.api.get('external/osiris/loadresults')
      .pipe(
        shareReplay()
      );
  }
}
