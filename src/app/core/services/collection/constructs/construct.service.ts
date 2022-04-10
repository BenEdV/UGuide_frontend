import { Injectable } from '@angular/core';
import { AddResult, CollectionDataService } from './../collection-data.service';
import { ApiService } from '../../api.service';
import { RouteParamsService } from '../../route-params.service';
import { AuthService } from '../../auth.service';
import { shareReplay, map, tap, switchMap } from 'rxjs/operators';
import { Construct } from '../../../interfaces/construct';
import { forkJoin, of, Observable } from 'rxjs';
import { ScoreService } from './score.service';
import { Score } from '../../../interfaces/score';
import { ActivityService } from './../activity.service';
import { Activity } from '../../../interfaces/activity';
import { ActivityStatic } from 'src/app/activity/activity.static';
import { ModelService } from './model.service';
import { CollectionService } from './../collection.service';

@Injectable({
  providedIn: 'root'
})
export class ConstructService extends CollectionDataService {

  constructor(private api: ApiService,
              private routeParamService: RouteParamsService,
              private collectionService: CollectionService,
              private authService: AuthService,
              private scoreService: ScoreService,
              private activityService: ActivityService,
              private modelService: ModelService) {
    super(api, routeParamService, authService);
    this.resource = 'models/constructs';
    // Manually inject construct service in other services to avoid circular dependency
    this.activityService.constructService = this;
    this.modelService.constructService = this;
  }

  all(): Observable<Construct[]> {
    if (!this.cache[this.collectionId]) {
      this.cache[this.collectionId] = forkJoin([
        this.getData(),
        this.getConstructScores()
      ]).pipe(
        map(res => {
          const constructs = res[0] as Construct[];
          const scores = res[1] as Score[];

          this.setConstructScores(constructs, scores);
          return this.resolveConstructs(constructs);
        }),
        shareReplay()
      );
    }

    return this.cache[this.collectionId];
  }

  withId(id: number): Observable<Construct> {
    const actions = [
      super.withId(id),
      this.activityService.all()
    ];

    return forkJoin(actions).pipe(
      map(res => {
        const construct = res[0] as Construct;
        const activities = res[1] as Activity[];

        if (construct) {
          for (const activity of construct.activities) {
            this.replaceSimpleWithFull(activities, activity);
          }
        }

        return construct;
      })
    );
  }

  private getConstructScores(refetch: boolean = false): Observable<Score[]> {
    return this.collectionService.withId(this.collectionId).pipe(
      switchMap(collection => {
        return this.scoreService.get(
          this.authService.checkPermissions(['see_anonymized_user_results'], collection) ? 'all' : [this.authService.user.id],
          [this.collectionId], null, 'all', refetch
        );
      })
    );
  }

  private setConstructScores(constructs: Construct[], scores: Score[]): Construct[] {
    if (constructs) {
      constructs.map(
        construct => this.scoreService.resolveScores(construct, scores, this.authService.user.id, this.collectionId)
      );
    }

    return constructs;
  }

  private resolveConstructs(constructs: Construct[]): Construct[] {
    for (const construct of constructs) {
      construct.head_constructs.map(headConstruct => this.replaceSimpleWithFull(constructs, headConstruct));
      construct.tail_constructs.map(tailConstruct => this.replaceSimpleWithFull(constructs, tailConstruct));
    }

    return constructs;
  }

  updateScores(): Observable<Construct[]> {
    if (!this.cache[this.collectionId]) {
      return of(null); // only update scores if they are already cached
    }

    const actions = [
      super.all(),
      this.scoreService.get([this.authService.user.id], [this.collectionId], null, 'all', true)
    ];

    return forkJoin(actions).pipe(
      map(res => this.setConstructScores(res[0] as Construct[], res[1] as Score[]))
    );
  }

  add(name: string, description: string, modelId: number, typeId: number): Observable<AddResult<Construct>> {
    const payload = {
      name,
      description,
      model_id: modelId,
      type_id: typeId
    };

    return super.addData(payload)
      .pipe(
        tap(res => this.modelService.addConstructToModel(modelId, res.added[0]))
      );
  }

  edit(id: number, name: string, description: string, modelId: number, typeId: number): Observable<Construct> {
    const payload = {
      name,
      description,
      model_id: modelId,
      type_id: typeId
    };

    return this.editData(id, payload);
  }

  linkConstruct(headConstructId: number, tailConstructId: number, typeId: number): Observable<Construct[]> {
    const payload = {
      type_id: typeId,
      properties: null
    };

    const actions = [
      this.api.post(`${this.collectionId}/models/constructs/${headConstructId}/map_construct/${tailConstructId}`, payload),
      this.all(),
      this.withId(headConstructId),
      this.withId(tailConstructId)
    ];

    return forkJoin(actions).pipe(
      switchMap(res => forkJoin([of(res[0]), of(res[1]), of(res[2]), of(res[3]), this.getConstructScores(true)])),
      map(res => {
        const result = res[0] as any;
        const constructs = res[1] as Construct[];
        const headConstruct = res[2] as Construct;
        const tailConstruct = res[3] as Construct;
        const scores = res[4] as Score[];

        if (result) {
          const tailResult = this.replaceSimpleWithFull(constructs, result.tail_construct);
          const headResult = this.replaceSimpleWithFull(constructs, result.head_construct);

          tailConstruct.head_constructs.push(headResult);
          headConstruct.tail_constructs.push(tailResult);
        }

        this.setConstructScores(constructs, scores);

        return [headConstruct, tailConstruct];
      })
    );
  }

  deleteConstructLink(aConstructId: number, bConstructId: number): Observable<Construct[]> {
    const actions = [
      this.api.delete(`${this.collectionId}/models/constructs/${aConstructId}/map_construct/${bConstructId}`),
      this.all(),
      this.withId(aConstructId),
      this.withId(bConstructId)
    ];

    return forkJoin(actions).pipe(
      switchMap(res => forkJoin([of(res[0]), of(res[1]), of(res[2]), of(res[3]), this.getConstructScores(true)])),
      map(res => {
        const constructs = res[1] as Construct[];
        const aConstruct = res[2] as Construct;
        const bConstruct = res[3] as Construct;
        const scores = res[4] as Score[];

        let aConstructRelationIdx = aConstruct.tail_constructs.map(tc => tc.id).indexOf(bConstructId);
        if (aConstructRelationIdx !== -1) {
          aConstruct.tail_constructs.splice(aConstructRelationIdx, 1);
        } else {
          aConstructRelationIdx = aConstruct.head_constructs.map(tc => tc.id).indexOf(bConstructId);
          if (aConstructRelationIdx !== -1) {
            aConstruct.head_constructs.splice(aConstructRelationIdx, 1);
          }
        }

        let bConstructRelationIdx = bConstruct.tail_constructs.map(tc => tc.id).indexOf(aConstructId);
        if (bConstructRelationIdx !== -1) {
          bConstruct.tail_constructs.splice(bConstructRelationIdx, 1);
        } else {
          bConstructRelationIdx = bConstruct.head_constructs.map(tc => tc.id).indexOf(aConstructId);
          if (bConstructRelationIdx !== -1) {
            bConstruct.head_constructs.splice(bConstructRelationIdx, 1);
          }
        }

        this.setConstructScores(constructs, scores);

        return [aConstruct, bConstruct];
      })
    );
  }

  linkActivity(constructId: number, activityId: number, typeId: number, properties?: any) {
    const payload = {
      type_id: typeId,
      properties
    };

    const actions = [
      this.api.post(`${this.collectionId}/models/constructs/${constructId}/map_activity/${activityId}`, payload),
      this.all(),
      this.withId(constructId),
      this.activityService.withId(activityId)
    ];

    return forkJoin(actions).pipe(
      switchMap(res => forkJoin([of(res[0]), of(res[1]), of(res[2]), of(res[3]), this.getConstructScores(true)])),
      map(res => {
        const result = res[0] as any;
        const constructs = res[1] as Construct[];
        const construct = res[2] as Construct;
        const activity = res[3] as Activity;
        const scores = res[4] as Score[];

        if (!ActivityStatic.isActivityOfType(activity, 'material')) {
          this.scoreService.reset(); // study material doesn't influence scores, so no need to reset the scoreService
        }

        construct.activities.push(result.activity);
        activity.constructs.push(result.construct);

        this.setConstructScores(constructs, scores);

        return [construct, activity];
      })
    );
  }

  deleteActivityLink(constructId: number, activityId: number) {
    const actions = [
      this.api.delete(`${this.collectionId}/models/constructs/${constructId}/map_activity/${activityId}`),
      this.all(),
      this.withId(constructId),
      this.activityService.withId(activityId)
    ];

    return forkJoin(actions).pipe(
      switchMap(res => forkJoin([of(res[0]), of(res[1]), of(res[2]), of(res[3]), this.getConstructScores(true)])),
      map(res => {
        const constructs = res[1] as Construct[];
        const construct = res[2] as Construct;
        const activity = res[3] as Activity;
        const scores = res[4] as Score[];

        const activityIdx = construct.activities.map(a => a.id).indexOf(activity.id);
        if (activityIdx !== -1) {
          construct.activities.splice(activityIdx, 1);
        }

        const constructIdx = activity.constructs.map(c => c.id).indexOf(construct.id);
        if (constructIdx !== -1) {
          activity.constructs.splice(constructIdx, 1);
        }

        this.setConstructScores(constructs, scores);

        return [construct, activity];
      })
    );
  }

  removeActivityFromConstructs(activityId: number) {
    for (const cacheCollectionId of Object.keys(this.cache)) {
      this.cache[cacheCollectionId].subscribe((constructs: Construct[]) => {
        for (const construct of constructs) {
          const idx = construct.activities.findIndex(a => a.id === activityId);
          construct.activities.splice(idx, 1);
        }
      });
    }
  }

  deleteAllConstructsOfModel(modelId: number) {
    for (const cacheCollectionId of Object.keys(this.cache)) {
      this.cache[cacheCollectionId].subscribe((constructs: Construct[]) => {
        const toRemoveIdx = []; // find indexes of items to remove
        for (let i = 0; i < constructs.length; i++) {
          if (constructs[i].model_id === modelId) {
            toRemoveIdx.push(i);
          }
        }

        toRemoveIdx.reverse(); // do in reverse order to make sure the indexes in toRemoveIdx stay correct
        for (const idx of toRemoveIdx) {
          this.activityService.removeConstructFromActivities(constructs[idx].id);
          constructs.splice(idx, 1);
        }
      });
    }
  }

  editData(id: number, payload): Observable<Construct> {
    const actions = [
      super.editData(id, payload),
      this.all()
    ];

    return forkJoin(actions).pipe(
      switchMap(res => forkJoin([of(res[0]), of(res[1]), this.getConstructScores(true)])),
      map(res => {
        const construct = res[0] as Construct;
        const constructs = res[1] as Construct[];
        const scores = res[2] as Score[];
        this.setConstructScores(constructs, scores);  // update scores since the edit may have affected them
        this.resolveConstructs(constructs);           // update invalid data in already resolved links
        return construct;
      })
    );
  }

  delete(id: number) {
    this.scoreService.reset();
    return super.delete(id).pipe(
      tap(res => {
        this.modelService.removeConstructFromModels(id);
        this.activityService.removeConstructFromActivities(id);
      })
    );
  }

}
