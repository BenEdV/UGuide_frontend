import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoggingService } from '../../../core/services/logging.service';
import { ToastService } from '../../../core/services/components/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@shared/pipes/date.pipe';
import { ActivityTableComponent } from './activity-table.component';
import { TableAction } from 'src/app/core/interfaces/table-action';
import { ActivityStatic } from 'src/app/activity/activity.static';
import { Activity } from 'src/app/core/interfaces/activity';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { SurveyComponent } from 'src/app/activity/survey/survey.component';


@Component({
  selector: 'app-survey-table',
  templateUrl: './../base-table/base-table.component.html',
  styleUrls: ['./../base-table/base-table.component.scss']
})
export class SurveyTableComponent extends ActivityTableComponent implements OnChanges {
  @Input() loggingSubject = 'SurveyTable';
  @Input() userId: number;

  // Override @Input() from BaseTableComponent
  allKeys = ['title', 'status', 'questions'];
  surveyIconify = {
    status: (survey: Activity) => {
      if (ActivityStatic.isCompleted(survey, this.userId)) {
        return 'table.icons.true-icon';
      } else if (ActivityStatic.isInitialized(survey, this.userId)) {
        return 'table.icons.seen-icon';
      } else {
        return 'table.icons.unseen-icon';
      }
    }
  };
  surveyValues = {
    status: (survey: Activity) => {
      if (ActivityStatic.isCompleted(survey, this.userId)) {
        return 'completed';
      } else if (ActivityStatic.isInitialized(survey, this.userId)) {
        return 'seen';
      } else {
        return 'unseen';
      }
    },
    questions: (survey: Activity) => SurveyComponent.getQuestions(survey).length
  };
  surveyActions: TableAction[] = [
    {
      name: 'Retake',
      icon: 'redo-icon',
      condition: (survey: Activity) => {
        if (ActivityStatic.isCompleted(survey)) {
          return survey.properties.retake;
        }

        return false;
      },
      callback: (survey: Activity) => {
        this.router.navigate(
          ActivityStatic.routerLinkHelper(
            survey,
            survey.collection_id || this.route.snapshot.params.collectionId,
            false,
            {force_questions: true}
          )
        );
      }
    }
  ];

  constructor(private route: ActivatedRoute,
              private router: Router,
              translate: TranslateService,
              authService: AuthService,
              datePipe: DatePipe,
              logger: LoggingService,
              toaster: ToastService) {
    super(route, datePipe, authService, translate, logger, toaster);
  }

  ngOnChanges(changes: SimpleChanges) {
    Object.assign(this.activityIconify, this.surveyIconify);
    Object.assign(this.activityValues, this.surveyValues);
    this.activityActions = this.surveyActions;

    super.ngOnChanges(changes);
  }

}
