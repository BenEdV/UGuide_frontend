import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity } from 'src/app/core/interfaces/activity';
import { Collection } from '../../interfaces/collection';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  collections: Collection[];
  universityCollection: Collection;
  courses: Collection[];
  surveys: Activity[];
  maxCardLength = 5;
  canCreateCourse = false;
  canCreateSurvey = false;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private authService: AuthService) { }

  ngOnInit() {
    this.collections = this.route.snapshot.data.collections;
    this.courses = this.collections.filter(collection => collection.course_instance);
    this.surveys = this.route.snapshot.data.activities.filter(activity => activity.type === 'survey');

    // if (this.courses.length === 1 && this.surveys.length === 0) {
    //   this.router.navigate(['/', 'collections', this.courses[0].collection_id]);
    // } else if (this.courses.length === 0 && this.surveys.length === 1) {
    //   this.router.navigate(ActivityStatic.routerLinkHelper(this.surveys[0], this.surveys[0].collection_id));
    // } else if (this.collections.length === 1 && this.courses.length === 0 && this.surveys.length === 0) {
    //   this.router.navigate(['/', 'collections', this.collections[0].id]);
    // }

    // TODO: Find way to create a course and append it to other collections
    this.universityCollection = this.collections.find(collection => collection.id === 1);
    if (this.universityCollection) {
      this.canCreateCourse = this.authService.checkPermissions(['manage_collection'], this.universityCollection);
      this.canCreateSurvey = this.authService.checkPermissions(['manage_collection', 'manage_activities'], this.universityCollection);
    }
  }

  gotoCourses() {
    this.router.navigate(['/', 'courses']);
  }

  gotoActivities() {
    this.router.navigate(['/', 'activities']);
  }

  gotoCreateCourse() {
    if (this.universityCollection && this.canCreateCourse) {
      this.router.navigate(['/', 'collections', this.universityCollection.id, 'administration', 'collections']);
    } else {
      console.error(`Cannot go to administration for collection ${this.universityCollection}. User does not have permission.`);
    }
  }

  gotoCreateSurvey() {
    if (this.universityCollection && this.canCreateSurvey) {
      this.router.navigate(['/', 'collections', this.universityCollection.id, 'administration', 'surveys']);
    } else {
      console.error(`Cannot go to administration for collection ${this.universityCollection}. User does not have permission.`);
    }
  }

}
