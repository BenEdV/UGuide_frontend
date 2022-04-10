import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { RouteParamsService } from '../route-params.service';
import { AuthService } from '../auth.service';
import { forkJoin, Observable } from 'rxjs';

export interface AddResult<Type> {
  all: Type[];
  added: Type[];
}

@Injectable({
  providedIn: 'root'
})
export class CollectionDataService {
  protected cache: {[key: string]: Observable<any>} = {};
  protected resource: string;

  constructor(private dataApi: ApiService, private dataRouteParams: RouteParamsService, private dataAuthService: AuthService) {
    this.dataAuthService.user$.subscribe(user => {
      if (!user) { // reset service on logout
        this.reset();
      }
    });
  }

  get collectionId(): number {
    return this.dataRouteParams.currentRoute && +this.dataRouteParams.currentRoute.snapshot.params.collectionId;
  }

  get resourceURL(): string {
    return `${this.collectionId}/${this.resource}/`;
  }

  all(): Observable<any[]> {
    if (!this.cache[this.collectionId]) {
      this.cache[this.collectionId] = this.getData().pipe(
        shareReplay()
      );
    }

    return this.cache[this.collectionId];
  }

  withId(id: number): Observable<any>  {
    return this.all().pipe(
      map(all => (all as any[]).find(val => val.id === id))
    );
  }

  withIds(ids: number[]): Observable<any[]> {
    const actions = ids.map(id => this.withId(id)); // use withId, since it may be overriden to resolve properties
    return forkJoin(actions);
  }

  protected getData() {
    return this.dataApi.get(this.resourceURL);
  }

  protected replaceSimpleWithFull(list, simple) {
    const full = list.find(obj => obj.id === simple.id);
    return Object.assign(simple, full);
  }

  protected addData(payload): Observable<AddResult<any>> {
    const actions = [
      this.dataApi.post(this.resourceURL, payload),
      this.all()
    ];

    return forkJoin(actions)
      .pipe(
        map((res: any[][]) => this.addItemsToAll(res[0], res[1]))
      );
  }

  protected uploadData(payload, files): Observable<AddResult<any>> {
    const actions = [
      this.dataApi.upload(this.resourceURL, files, payload),
      this.all()
    ];

    return forkJoin(actions)
      .pipe(
        map((res: any[][]) => this.addItemsToAll(res[0], res[1]))
      );
  }

  protected addItemsToAll(result: any[], all: any[]): AddResult<any> {
    if (result) {
      all.push(...result);  // use push instead of concat to edit the original array (by reference)
    }

    return {
      all: [...all],        // create copy to trigger change detections
      added: result         // for quick access
    };
  }

  editData(id: number, payload: object) {
    const actions = [
      this.dataApi.put(`${this.resourceURL}${id}`, payload),
      this.withId(id)
    ];

    return forkJoin(actions)
      .pipe(
        map(res => {
          const result = res[0];
          const item = res[1];
          if (result) {
            Object.assign(item, result);
          }

          return item;
        })
      );
  }

  delete(id: number) {
    return this.dataApi.delete(`${this.resourceURL}${id}`)
      .pipe(
        map(() => this.reset()),
        switchMap(() => this.all())
      );
  }

  resetId(id: number): Observable<any> {
    const actions = [
      this.withId(id),
      this.dataApi.get(`${this.resourceURL}${id}`)
    ];

    return forkJoin(actions).pipe(
      map(res => {
        const oldObj = res[0];
        const newObj = res[1];
        return Object.assign(oldObj, newObj);
      })
    );
  }

  reset() {
    this.cache = {};
  }
}
