import { Injectable } from '@angular/core';
import { AddResult, CollectionDataService } from './collection-data.service';
import { ApiService } from '../api.service';
import { map, shareReplay, mergeMap, tap } from 'rxjs/operators';
import { Activity, ActivityAttachment, ActivityResult } from '../../interfaces/activity';
import { RouteParamsService } from '../route-params.service';
import { AuthService } from '../auth.service';
import { forkJoin, of, Observable } from 'rxjs';
import { Score } from '../../interfaces/score';
import { ActivityStatic } from '../../../activity/activity.static';
import { ScoreService } from './constructs/score.service';
import * as moment from 'moment';
import { DatePipe } from '@shared/pipes/date.pipe';
import { ConstructService } from './constructs/construct.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ActivityService extends CollectionDataService {
  private globalActivityCache$;
  public constructService: ConstructService;

  constructor(private api: ApiService,
              private routeParamsService: RouteParamsService,
              private datePipe: DatePipe,
              private authService: AuthService,
              private scoreService: ScoreService,
              private translate: TranslateService) {
    super(api, routeParamsService, authService);
    this.resource = 'activities';
  }

  all(): Observable<Activity[]> {
    if (!this.cache[this.collectionId]) {
      this.cache[this.collectionId] = this.getData().pipe(
        map((activities: Activity[]) => this.resolveActivities(activities)),
        shareReplay()
      );
    }

    return this.cache[this.collectionId];
  }

  withId(id: number): Observable<Activity> {
    const actions = [
      super.withId(id),
      this.scoreService.get([this.authService.user.id], [this.collectionId], null, 'all')
    ];

    return forkJoin(actions)
      .pipe(
        map(res => this.setActivityConstructScores(res[0] as Activity, res[1] as Score[]))
      );
  }

  withParentType(type: string): Observable<Activity[]> {
    return this.all()
      .pipe(
        map(activities => (activities as Activity[]).filter(activity => ActivityStatic.isActivityOfType(activity, type)))
      );
  }

  withType(type: string): Observable<Activity[]> {
    return this.all()
      .pipe(
        map(activities => (activities as Activity[]).filter(activity => activity.type === type))
      );
  }

  private resolveActivities(activities: Activity[]): Activity[] {
    for (const activity of activities) {
      this.setComputedProperties(activity); // set additional properties before resolving
    }

    for (const activity of activities) {
      activity.head_activities.map(
        headActivity => this.replaceSimpleWithFull((activities as Activity[]), headActivity)
      );
      activity.tail_activities.map(
        tailActivity => this.replaceSimpleWithFull((activities as Activity[]), tailActivity)
      );
    }

    return activities;
  }

  global(): Observable<Activity[]> { // gets all activities for all collections
    if (!this.globalActivityCache$) {
      this.globalActivityCache$ = this.api.get('home/activities/').pipe(
        map((activities: Activity[]) => this.resolveActivities(activities)),
        shareReplay()
      );
    }

    return this.globalActivityCache$;
  }

  exams(): Observable<Activity[]> {
    return this.withType('exam');
  }

  surveys(): Observable<Activity[]> {
    return this.withType('survey');
  }

  questions(): Observable<Activity[]> {
    return this.withParentType('question');
  }

  studyMaterial(): Observable<Activity[]> {
    return this.withParentType('material');
  }

  voidResult(activityId: number, statementId: string): Observable<Activity> {
    const actions = [
      this.withId(activityId),
      this.api.post(`${this.collectionId}/activities/${activityId}/void/${statementId}`)
    ];

    return forkJoin(actions).pipe(
      map(res => {
        const activity = res[0] as Activity;
        activity.my_results = activity.my_results.filter(result => result.id !== statementId);
        if (activity.results) {
          activity.results = activity.results.filter(result => result.id !== statementId);
        }
        return this.setComputedProperties(activity);
      })
    );
  }

  markAsStarted(id: number) {
    const context = {
      language: this.translate.currentLang
    };
    return this.markActivity(id, 'mark_started', context);
  }

  markAsComplete(id: number) {
    const context = {
      language: this.translate.currentLang
    };
    return this.markActivity(id, 'mark_completed', context);
  }

  markActivity(id: number, markType: string, context: object = null) {
    const actions: any = [
      this.withId(id),
      this.api.post(`${this.collectionId}/activities/${id}/${markType}`, context)
    ];

    return forkJoin(actions).pipe(
      map(res => {
        const activity = res[0] as Activity;
        const markResult = res[1] as ActivityResult;

        if (markResult) {
          if (!activity.my_results) {
            activity.my_results = [];
          }

          activity.my_results.unshift({
            id: markResult.id,
            verb: markResult.verb,
            timestamp: markResult.timestamp,
            result: markResult.result
          });

          if (activity.results) {
            activity.results.unshift({
              id: markResult.id,
              user_id: markResult.user_id,
              verb: markResult.verb,
              timestamp: markResult.timestamp,
              result: markResult.result
            });
          }
        }

        return this.setComputedProperties(activity);
      })
    );
  }

  addAttachment(id: number, attachments: FileList) {
    const actions = [
      this.api.upload(`${this.collectionId}/${this.resource}/${id}/attachments`, attachments),
      this.withId(id)
    ];

    return forkJoin(actions)
      .pipe(
        map(res => {
          const attachmentResult = res[0] as unknown as ActivityAttachment[];
          const activity = res[1] as Activity;

          activity.attachments.push(...attachmentResult);
          return activity;
        })
      );
  }

  getAttachment(id: string) {
    return this.api.get(`${this.collectionId}/activities/attachment/${id}`);
  }

  deleteAttachment(activityId: number, attachmentId: number) {
    const actions = [
      this.api.delete(`${this.collectionId}/activities/attachment/${attachmentId}`),
      this.withId(activityId)
    ];

    return forkJoin(actions)
      .pipe(
        map(res => {
          const activity = res[1] as Activity;
          const attachmentIdx = activity.attachments.findIndex(attachment => attachment.id === attachmentId);
          if (attachmentIdx !== -1) {
            activity.attachments.splice(attachmentIdx, 1);
          }
          return activity;
        })
      );
  }

  addResult(results: any[], ignoreLoadingBar: boolean = false) {
    if (results.length === 0) {
      return of([]);
    }

    const actions = [
      this.withIds(results.map(result => result.activity_id)),
      this.api.post(`${this.collectionId}/activities/give_response`, results, ignoreLoadingBar, ignoreLoadingBar)
    ];

    return forkJoin(actions).pipe(
      map(res => {
        const activities = res[0] as Activity[];
        const responseResult = res[1] as any;

        for (let i = 0; i < activities.length; i++) {
          activities[i].my_results.unshift(responseResult[i]);
          this.setComputedProperties(activities[i]);
        }

        return activities;
      })
    );
  }

  getRir(activityIds: number[]) {
    return this.api.post(`${this.collectionId}/activities/rir`, activityIds);
  }

  getCorrelation(activityIds: number[]) {
    return this.api.post(`${this.collectionId}/activities/correlation`, activityIds);
  }

  private setActivityConstructScores(activity: Activity, scores: Score[]) {
    if (activity) {
      activity.constructs.map(
        construct => this.scoreService.resolveScores(construct, scores, this.authService.user.id, this.collectionId)
      );
    }

    return activity;
  }

  private setComputedProperties(activity: Activity) {
    activity.my_latest_result = activity.my_results[0]; // my_results will already be in descending order (sorted in backend)

    const latestUserResults: {[key: number]: ActivityResult} = {};
    for (const result of activity.results) {
      if (!latestUserResults[result.user_id] || latestUserResults[result.user_id].timestamp.localeCompare(result.timestamp) < 0) {
        latestUserResults[result.user_id] = result;
      }
    }
    activity.latest_results = Object.values(latestUserResults);

    if (ActivityStatic.isActivityOfType(activity, 'question')) {
      activity.properties.null_responses = 0;
      for (const result of activity.latest_results) {
        if (result.result.response === '') {
          activity.properties.null_responses += 1;
        }
      }

      activity.properties.avg_time = 0;
      for (const result of activity.latest_results) {
        if (result.result.duration !== '') {
          const durationSeconds = moment.duration(result.result.duration).as('seconds');
          activity.properties.avg_time += durationSeconds / activity.latest_results.length;
        }
      }
    }

    switch (activity.type) {
      case 'question.multiple_choice':
        if (activity.latest_results && activity.latest_results.length > 0) {
          if (activity.properties.answers.length > 0) {
            for (const answer of activity.properties.answers) {
              answer.count = 0;
            }
            for (const result of activity.latest_results) {
              for (const answer of activity.properties.answers) {
                if (answer.id === result.result.response) {
                  answer.count += 1;
                }
              }
            }
          }
        }
        break;
      case 'question.multiple_selection':
        if (activity.latest_results && activity.latest_results.length > 0) {
          for (const answer of activity.properties.answers) {
            answer.count = 0;
          }
          for (const result of activity.latest_results) {
            const responses = result.result.response.split(',');
            for (const answer of activity.properties.answers) {
              if (responses.includes(answer.id)) {
                answer.count += 1;
              }
            }
          }
        }
        break;
    }
    return activity;
  }

  updateScores(id: number, updateConstructSerivce: boolean = true): Observable<Activity> {
    if (!this.cache[this.collectionId]) {
      return of(null);
    }

    const actions = [
      super.withId(id),
      this.scoreService.get([this.authService.user.id], [this.collectionId], null, 'all', true)
    ];

    if (this.constructService && updateConstructSerivce) {
      this.constructService.updateScores();
    }

    return forkJoin(actions)
      .pipe(
        map(res => this.setActivityConstructScores(res[0] as Activity, res[1] as Score[]))
      );
  }

  addMaterial(title: string, description: string, typeId: number, visibility: string,
              startTime?: string, properties?: any, attachments?: FileList): Observable<AddResult<Activity>> {
    const payload = {
      title,
      description,
      type_id: typeId,
      start_time: startTime,
      properties,
      visibility
    };

    if (attachments) {
      return super.uploadData(payload, attachments);
    }

    return super.addData(payload);
  }

  editMaterial(id: number, title: string, description: string, typeId: number, visibility: string,
               startTime?: string, properties?: any, attachments?: FileList) {
    const payload = {
      title,
      description,
      type_id: typeId,
      start_time: startTime,
      properties,
      visibility
    };

    if (attachments) {
      return super.editData(id, payload)
        .pipe(
          mergeMap((res: Activity) => this.addAttachment(res.id, attachments))
        );
    }

    return super.editData(id, payload);
  }

  addSurvey(title: string, description: string, typeId: number, visibility: string, properties?: any) {
    const payload = {
      title,
      description,
      type_id: typeId,
      visibility,
      properties
    };

    return super.addData(payload);
  }

  editSurvey(id: number, title: string, description: string, typeId: number, visibility: string,
             properties?: any) {
    const payload = {
      title,
      description,
      type_id: typeId,
      visibility,
      properties
    };

    return super.editData(id, payload);
  }

  addSurveyQuestion(surveyId: number, body: string, questionTypeId: number, relationTypeId: number,
                    answers: {id: number, body: string}[], visibility: string, required: boolean, questionNumber: number,
                    title?: string): Observable<AddResult<Activity>> {
    const payload = {
      title: title || `Survey ${surveyId} question ${questionNumber}`,
      type_id: questionTypeId,
      visibility,
      properties: {
        body,
        required,
        answers
      }
    };

    return super.addData(payload).pipe(
      mergeMap(res => forkJoin([of(res), this.linkActivity(res.added[0].id, surveyId, relationTypeId, {number: questionNumber})])),
      map(res => res[0] as AddResult<Activity>)
    );
  }

  linkActivity(headActivityId: number, tailActivityId: number, typeId: number, properties?: any) {
    const actions = [
      this.api.post(`${this.collectionId}/activities/connect/${headActivityId}/${tailActivityId}`, {type_id: typeId, properties}),
      this.all(),
      this.withId(headActivityId),
      this.withId(tailActivityId)
    ];

    return forkJoin(actions).pipe(
      map(res => {
        const result = res[0] as any;
        const activities = res[1] as Activity[];
        const headActivity = res[2] as Activity;
        const tailActivity = res[3] as Activity;

        if (result) {
          const tailResult = this.replaceSimpleWithFull(activities, result.tail_activity);
          const headResult = this.replaceSimpleWithFull(activities, result.head_activity);

          tailActivity.head_activities.push(headResult);
          headActivity.tail_activities.push(tailResult);
        }

        return [headActivity, tailActivity];
      })
    );
  }

  delete(id: number) {
    this.scoreService.reset();
    return super.delete(id)
      .pipe(
        tap(res => {
          if (!this.constructService) {
            console.error('Could not remove constructs related to the activity, because ' +
                          `ConstructService is ${this.constructService}. Please add ConstructService to the constructor.`);
          } else {
            this.constructService.removeActivityFromConstructs(id);
          }
        })
      );
  }

  import() {
    console.warn('TODO: Implement'); // TODO: Implement
  }

  getRemoteNames(remoteCode: string) {
    return this.api.get(`external/${remoteCode}/exams/minimal`);
  }

  getRemoteMoments(remoteCode: string, recipeId: number) {
    return this.api.get(`external/${remoteCode}/recipe/${recipeId}/moments`)
      .pipe(
        map((res: any[]) => {
          for (const r of res) {
            r.display_time = this.datePipe.transform(r.time_start) + ' - ' + this.datePipe.transform(r.time_end);
          }
          return res;
        })
      );
  }

  importExam(remoteCode: string, recipeId: number, title?: string, visibility?: string, moments?: number[], properties?: any) {
    const payload = {
      title,
      visibility,
      moments,
      properties
    };

    const actions = [
      this.api.post(`external/${remoteCode}/${this.collectionId}/loadexam/${recipeId}`, payload),
      this.all()
    ];

    return forkJoin(actions)
    .pipe(
      map(res => [this.resolveActivities(res[0] as Activity[]), res[1] as Activity[]]),
      map(res => this.addItemsToAll(res[0] as Activity[], res[1] as Activity[]))
    );
  }

  loadExamResults(id: number) {
    return this.api.post(`${this.collectionId}/activities/${id}/loadresults`);
  }

  editExam(id: number, title: string, description: string, visibility: string) {
    const payload = {
      title,
      description,
      visibility
    };

    return super.editData(id, payload);
  }

  removeConstructFromActivities(constructId: number) {
    for (const cacheCollectionId of Object.keys(this.cache)) {
      this.cache[cacheCollectionId].subscribe((activities: Activity[]) => {
        for (const activity of activities) {
          const idx = activity.constructs.findIndex(c => c.id === constructId);
          activity.constructs.splice(idx, 1);
        }
      });
    }
  }

  reset() {
    super.reset();
    this.globalActivityCache$ = null;
  }

}
