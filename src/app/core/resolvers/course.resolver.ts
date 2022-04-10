import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { CourseService } from '../services/collection/course.service';

@Injectable({
  providedIn: 'root'
})
export class CourseResolver implements Resolve<any> {

  constructor(private courseService: CourseService) { }

  resolve(route: ActivatedRouteSnapshot, snapshot: RouterStateSnapshot): Observable<any> {
    return this.courseService.all();
  }
}
