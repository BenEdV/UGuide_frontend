import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';
import { AuthService } from '../../auth.service';
import { shareReplay } from 'rxjs/operators';
import { RouteParamsService } from '../../route-params.service';
import { Score } from 'src/app/core/interfaces/score';
import { Observable } from 'rxjs';
import { ActivityConstruct } from 'src/app/core/interfaces/activity';
import { Construct } from 'src/app/core/interfaces/construct';

type ScoreParamId = 'all' | number[] | string[];
type ScoreParam = 'all' | number[];

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private cache: {[cacheIdx: string]: Observable<Score[]>} = {};
  private resource = 'scores';
  private allIdentifier: ScoreParam = 'all'; // used to indicate that all of a certain resource should be used

  constructor(private api: ApiService, private routeParamsService: RouteParamsService, private authService: AuthService) {
    this.authService.user$.subscribe(user => {
      if (!user) { // reset service on logout
        this.reset();
      }
    });
  }

  get collectionId(): number {
    return this.routeParamsService.currentRoute && +this.routeParamsService.currentRoute.snapshot.params.collectionId || undefined;
  }

  get(userIds: ScoreParamId, collectionIds: ScoreParam, activityIds?: ScoreParam,
      constructIds?: ScoreParam, refetch: boolean = false, notifyOnError: boolean = true): Observable<Score[]> {
    if (!userIds && !collectionIds) {
      return null;
    }

    activityIds = activityIds || this.allIdentifier;
    constructIds = constructIds || this.allIdentifier;

    let cachedScores = this.readCache(userIds, collectionIds, activityIds, constructIds);

    if (!cachedScores || refetch) {
      cachedScores = this.writeCache(userIds, collectionIds, activityIds, constructIds, notifyOnError);
    }

    return cachedScores;
  }

  private getCacheIndex(userIds, collectionIds, activityIds, constructIds): string {
    return this.collectionId + '_' +
           (userIds && userIds.toString()) + '_' +
           (collectionIds && collectionIds.toString()) + '_' +
           activityIds.toString() + '_' +
           constructIds.toString();
  }

  private readCache(userIds, collectionIds, activityIds, constructIds): Observable<Score[]> {
    const cacheIndex = this.getCacheIndex(userIds, collectionIds, activityIds, constructIds);
    return this.cache[cacheIndex];
  }

  private writeCache(userIds, collectionIds, activityIds?, constructIds?, notifyOnError: boolean = true): Observable<Score[]> {
    const cacheIndex = this.getCacheIndex(userIds, collectionIds, activityIds, constructIds);

    return this.cache[cacheIndex] = this.getData(userIds, collectionIds, activityIds, constructIds, notifyOnError)
      .pipe(
        shareReplay()
      ) as Observable<Score[]>;
  }

  private getData(userIds, collectionIds, activityIds, constructIds, notifyOnError: boolean = true) {
    const payload = {
      construct_ids: constructIds,
      user_ids: userIds || [],
      collection_ids: collectionIds || []
    };

    if (activityIds !== this.allIdentifier) {
      Object.assign(payload, {activityIds});
    }

    return this.api.post(`${this.collectionId}/${this.resource}/`, payload, notifyOnError);
  }

  resolveScores(construct: Construct | ActivityConstruct, scores: Score[], userId: number, collectionId: number) {
    construct.user_scores = scores.filter(
      score => score.construct_id === construct.id && score.hasOwnProperty('user_id')
    );

    const latestUserScores: {[key: number]: Score} = {};
    for (const score of construct.user_scores) {
      if (!latestUserScores[score.user_id] || latestUserScores[score.user_id].timestamp.localeCompare(score.timestamp) < 0) {
        latestUserScores[score.user_id] = score;
      }
    }
    construct.latest_user_scores = Object.values(latestUserScores);

    construct.my_scores = construct.user_scores.filter(
      score => score.user_id === userId
    ).sort(this.sortScoresOnTimestamp);
    construct.my_latest_score = construct.my_scores[0];
    construct.average_scores = scores.filter(
      score => score.construct_id === construct.id && score.collection_id === collectionId
    ).sort(this.sortScoresOnTimestamp);
    construct.latest_average_score = construct.average_scores[0];
  }

  private sortScoresOnTimestamp(a: Score, b: Score): number {
    return new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1; // sort descending
  }

  reset() {
    this.cache = {};
  }
}
