import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { AddResult, CollectionDataService } from './collection-data.service';
import { RouteParamsService } from '../route-params.service';
import { shareReplay, switchMap } from 'rxjs/operators';
import { CourseInstance, Period, Course } from '../../interfaces/course';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService extends CollectionDataService {
  private periodCache$: Observable<Period[]>;

  constructor(private api: ApiService, private routeParamService: RouteParamsService, private authService: AuthService) {
    super(api, routeParamService, authService);
    this.resource = 'course_ins';
  }

  get collectionId(): number { // collectionId is irrelevant for course.
    return 0;                  // so just always provide 0 to make sure the cache can be used.
  }

  get resourceURL(): string {
    return `${this.resource}/`; // omit the collectionId from the resource URL
  }

  add(collectionId: number, periodId: number, courseId: number): Observable<AddResult<CourseInstance>> {
    const payload = {
      course_id: courseId,
      collection_id: collectionId,
      period_id: periodId
    };

    return super.addData(payload);
  }

  addCourse(name: string, code: string): Observable<Course[]> {
    // Use CollectionService.addCourse to create a collection, course and link them.
    const payload = {
      name,
      code
    };

    return this.api.post('course/', payload) as unknown as Observable<Course[]>;
  }

  getPeriods(): Observable<Period[]> {
    if (!this.periodCache$) {
      this.periodCache$ = this.api.get(`periods/`).pipe(
        shareReplay()
      ) as Observable<Period[]>;
    }

    return this.periodCache$;
  }

  reset() {
    super.reset();
    this.periodCache$ = null;
  }

}
