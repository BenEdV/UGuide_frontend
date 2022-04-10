import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { shareReplay, switchMap, map, tap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { RouteParamsService } from '../route-params.service';
import { AuthService } from '../auth.service';
import { CourseService } from './course.service';
import { Course, CourseInstance } from '../../interfaces/course';
import { Collection } from '../../interfaces/collection';
import { AddResult, CollectionDataService } from './collection-data.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionService extends CollectionDataService {
  private activeCollectionSubject = new BehaviorSubject(null);
  activeCollection = this.activeCollectionSubject.asObservable();

  constructor(private api: ApiService,
              private routeParams: RouteParamsService,
              private authService: AuthService,
              private courseService: CourseService) {
    super(api, routeParams, authService);
    this.resource = 'authorization/collection';

    this.routeParams.paramAsObservable('collectionId').pipe(
      switchMap(collectionId => collectionId ? this.withId(+collectionId) : of(null))
    ).subscribe(collection => {
      if (collection) {
        this.activeCollectionSubject.next(collection);
      }
    });
  }

  get collectionId(): number { // collectionId is irrelevant for course.
    return 0;                  // so just always provide 0 to make sure the cache can be used.
  }

  get resourceURL(): string {
    return `${this.resource}/`; // omit the collectionId from the resource URL
  }

  get currentCollection() {
    return this.activeCollectionSubject.value;
  }

  all(): Observable<Collection[]> {
    if (!this.cache[this.collectionId]) {
      const actions = [
        this.getData(),           // get the collections
        this.courseService.all()  // get the course_instances, so they can be added to the collections
      ];

      this.cache[this.collectionId] = forkJoin(actions).pipe(
        map(res => {
          const collections = res[0] as Collection[];
          const courseInstances = res[1] as CourseInstance[];

          for (const collection of collections) {
            collection.subcollections.map(subcollection => this.replaceSimpleWithFull(collections, subcollection));
            collection.course_instance = courseInstances.find(courseInstance => courseInstance.id === collection.course_instance_id);
            if (collection.parent) {
              this.replaceSimpleWithFull(collections, collection.parent);
            }
          }

          return collections;
        }),
        shareReplay()
      );
    }

    return this.cache[this.collectionId];
  }

  add(name: string, parentId: number): Observable<AddResult<Collection>> {
    const payload = {
      name,
      parent_id: parentId
    };

    const actions = [
      super.addData(payload),
      this.withId(parentId)
    ];

    return forkJoin(actions).pipe(
      map(res => {
        const addResult = res[0] as AddResult<Collection>;
        const parentCollection = res[1] as Collection;

        for (const collection of addResult.added) {
          Object.assign(collection.parent, parentCollection);
          parentCollection.subcollections.push(collection);
        }

        return addResult;
      })
    );
  }

  addCourse(parentId: number, periodId: number, name: string, code: string): Observable<AddResult<Collection>> {
    const actions = [
      this.add(name, parentId),                 // create collection for the course
      this.courseService.addCourse(name, code)  // create the course object
    ];

    return forkJoin(actions).pipe(
      switchMap(res => {
        const collectionAddResult = res[0] as AddResult<Collection>;
        const addedCourse = res[1][0] as Course;
        const courseInstanceAddResult = this.courseService.add(collectionAddResult.added[0].id, periodId, addedCourse.id);
        return forkJoin([of(collectionAddResult), courseInstanceAddResult]);
      }),
      switchMap(res => {
        const collectionResult = res[0] as AddResult<Collection>;
        const courseInstanceResult = res[1] as AddResult<CourseInstance>;
        // we need to refetch collection after course_instance and user_role have been added
        return forkJoin([
          of(collectionResult),
          of(courseInstanceResult),
          this.withId(parentId),
          this.resetId(collectionResult.added[0].id)
        ]);
      }),
      map(res => {
        const collectionResult = res[0] as AddResult<Collection>;
        const courseInstanceResult = res[1] as AddResult<CourseInstance>;
        const parentCollection = res[2] as Collection;
        const newCollection = res[3] as Collection;

        newCollection.course_instance = courseInstanceResult.added[0];
        newCollection.parent = parentCollection;
        collectionResult.added[0] = newCollection;

        return collectionResult;
      })
    );
  }

  edit(id: number, settings: any): Observable<Collection> {
    const payload = {
      settings
    };

    const actions = [
      this.withId(id),
      this.api.put(`${this.resource}/${id}`, payload)
    ];

    return forkJoin(actions).pipe(
      map(res => {
        const collection = res[0] as Collection;
        const updatedCollection = res[1] as Collection;
        return Object.assign(collection, updatedCollection);
      })
    );
  }

  delete(id: number) {
    this.courseService.reset(); // TODO: find smarter way to propagate delete (if speed is a problem)?
    return super.delete(id);
  }

}
