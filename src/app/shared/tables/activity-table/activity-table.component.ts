import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Activity } from '../../../core/interfaces/activity';
import { BaseTableComponent } from './../base-table/base-table.component';
import { LoggingService } from '../../../core/services/logging.service';
import { ToastService } from '../../../core/services/components/toast.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@shared/pipes/date.pipe';
import { ActivityStatic } from '../../../activity//activity.static';
import { AuthService } from 'src/app/core/services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-activity-table',
  templateUrl: './../base-table/base-table.component.html',
  styleUrls: ['./../base-table/base-table.component.scss']
})
export class ActivityTableComponent extends BaseTableComponent implements OnChanges {
  @Input() activities: Activity[];
  @Input() showVisibility = false;
  @Input() loggingSubject = 'ActivityTable';

  allKeys = ['title', 'relation_type', 'start_time', 'end_time'];
  activityHeaders = {
    start_time: 'start',
    end_time: 'end',
    relation_type: 'relation',
  };
  activityValues = {
    start_time: (activity => this.datePipe.transform(activity.start_time)),
    end_time: (activity => this.datePipe.transform(activity.end_time)),
    visibility: (exam: Activity) => this.activityTranslate.instant('admin.exam.visibility.' + exam.visible.toLowerCase())
  };
  activitySortValues = {
    title: (activity: Activity) => activity.title?.toLowerCase(),
    start_time: (activity: Activity) => activity.start_time,
    end_time: (activity: Activity) => activity.end_time,
  };
  activityLinks = {
    title: (activity: Activity) => {
      return ActivityStatic.routerLinkHelper(activity, activity.collection_id || this.activityRoute.snapshot.params.collectionId);
    }
  };
  activityIconify = {
    visibility: (activity: Activity) => activity.visible === 'T' ? 'table.icons.visible-icon' : 'table.icons.invisible-icon'
  };
  activityActions = [];

  // Override @Input() from BaseTableComponent
  data; sliderKey; childKey;

  constructor(private activityRoute: ActivatedRoute,
              private datePipe: DatePipe,
              private activityAuthService: AuthService,
              private activityTranslate: TranslateService,
              logger: LoggingService,
              toaster: ToastService) {
    super(logger, toaster);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.keys && this.activities) {
      this.keys = [];
      for (const key of this.allKeys) {
        const hasKey = this.activityValues[key] || (activity => activity[key]);
        if (this.activities.some(activity => {
          const result = hasKey(activity);
          return result !== undefined && result !== null;
        })) {
          this.keys.push(key);
        }
      }

      if (this.keys.length === 0) {
        this.keys = undefined;
      }
    }

    if (this.showVisibility && this.keys?.indexOf('visibility') === -1 &&
        this.activityAuthService.checkPermissions(['see_invisible_activities'], this.activityRoute.snapshot.data.collection)) {
      this.keys.push('visibility');
    }

    this.injectDefaults(this.headerOverrides, this.activityHeaders);
    this.injectDefaults(this.valueOverrides, this.activityValues);
    this.injectDefaults(this.sortValueOverrides, this.activitySortValues);
    this.injectDefaults(this.iconify, this.activityIconify);
    this.injectDefaults(this.routerLinks, this.activityLinks);

    if (this.actions.length === 0) {
      this.actions = this.activityActions;
    }
    this.data = this.activities;
    super.ngOnChanges(changes);
  }

}
