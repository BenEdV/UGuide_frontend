import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoggingService } from '../../../core/services/logging.service';
import { ToastService } from '../../../core/services/components/toast.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@shared/pipes/date.pipe';
import { ActivityTableComponent } from './activity-table.component';
import { ActivityStatic } from 'src/app/activity/activity.static';
import { Activity, ActivityResult } from 'src/app/core/interfaces/activity';
import { AuthService } from 'src/app/core/services/auth.service';
import { PercentPipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-study-material-table',
  templateUrl: './../base-table/base-table.component.html',
  styleUrls: ['./../base-table/base-table.component.scss']
})
export class StudyMaterialTableComponent extends ActivityTableComponent implements OnChanges {
  @Input() hierarchical = false;
  @Input() hideInvisible = false;
  @Input() userId: number;
  @Input() loggingSubject = 'StudyMaterialTable';

  // Override @Input() from BaseTableComponent
  studyMaterialKeys = [];
  studyMaterialIconify = {
    type: studyMaterial => 'admin.study_material.' + studyMaterial.type,
    status: (studyMaterial: Activity) => {
      if (ActivityStatic.isCompleted(studyMaterial, this.userId)) {
        return 'table.icons.true-icon';
      } else if (ActivityStatic.isInitialized(studyMaterial, this.userId)) {
        return 'table.icons.seen-icon';
      } else {
        return 'table.icons.unseen-icon';
      }
    }
  };
  studyMaterialValues = {
    status: (studyMaterial: Activity) => {
      if (ActivityStatic.isCompleted(studyMaterial, this.userId)) {
        return 'completed';
      } else if (ActivityStatic.isInitialized(studyMaterial, this.userId)) {
        return 'seen';
      } else {
        return 'unseen';
      }
    },
    seen: (studyMaterial: Activity) => {
      const seenCount = this.getStatusCount(studyMaterial, ActivityStatic.indexOfInitialized);
      return this.percentPipe.transform(seenCount / this.route.snapshot.data.collection.member_count || 0);
    },
    completed: (studyMaterial: Activity) => {
      const completedCount = this.getStatusCount(studyMaterial, ActivityStatic.indexOfCompleted);
      return this.percentPipe.transform(completedCount / this.route.snapshot.data.collection.member_count || 0);
    }
  };
  studyMaterialSortValues = {
    seen: (studyMaterial: Activity) => this.getStatusCount(studyMaterial, ActivityStatic.indexOfInitialized),
    completed: (studyMaterial: Activity) => this.getStatusCount(studyMaterial, ActivityStatic.indexOfCompleted)
  };
  studyMaterialHeaderValues = {
    start_time: 'covered_on'
  };

  constructor(private route: ActivatedRoute,
              datePipe: DatePipe,
              logger: LoggingService,
              toaster: ToastService,
              translate: TranslateService,
              private percentPipe: PercentPipe,
              private authService: AuthService) {
    super(route, datePipe, authService, translate, logger, toaster);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.userId || this.authService.checkRoles(['student'], this.route.snapshot.data.collection)) {
      this.studyMaterialKeys = ['title', 'type', 'status', 'start_time'];
    } else {
      this.studyMaterialKeys = ['title', 'type', 'seen', 'completed', 'start_time'];
    }

    this.allKeys = this.studyMaterialKeys;

    Object.assign(this.activityValues, this.studyMaterialValues);
    Object.assign(this.activityIconify, this.studyMaterialIconify);
    Object.assign(this.activitySortValues, this.studyMaterialSortValues);
    Object.assign(this.activityHeaders, this.studyMaterialHeaderValues);

    let filteredActivities = this.activities;
    if (this.hierarchical) {
      this.childKey = 'head_activities';

      const childMaterialIds = [];
      for (const material of this.activities) {
        for (const childMaterial of material[this.childKey]) {
          childMaterialIds.push(childMaterial.id);
        }
      }

      // filter out child activities
      filteredActivities = filteredActivities.filter(activity => childMaterialIds.indexOf(activity.id) === -1);
    }

    if (this.hideInvisible) {
      filteredActivities = filteredActivities.filter(activity => activity.visible !== 'F');
    }

    this.activities = filteredActivities;
    super.ngOnChanges(changes);
  }

  getStatusCount(studyMaterial: Activity, indexOfStatusFn: (results: ActivityResult[]) => number): number {
    let statusCount = 0;
    for (const result of studyMaterial.latest_results) {
      if (indexOfStatusFn([result]) !== -1) {
        statusCount++;
      }
    }

    return statusCount;
  }

}
