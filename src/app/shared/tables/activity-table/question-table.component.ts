import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoggingService } from '../../../core/services/logging.service';
import { ToastService } from '../../../core/services/components/toast.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@shared/pipes/date.pipe';
import { ActivityTableComponent } from './activity-table.component';
import { ActivityStatic } from '../../../activity//activity.static';
import { TranslateService } from '@ngx-translate/core';
import { ExamQuestionComponent } from 'src/app/activity/exam-question/exam-question.component';
import { PercentPipe } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-question-table',
  templateUrl: './../base-table/base-table.component.html',
  styleUrls: ['./../base-table/base-table.component.scss']
})
export class QuestionTableComponent extends ActivityTableComponent implements OnChanges {
  @Input() showExam = false;
  @Input() loggingSubject = 'QuestionTable';

  // Override @Input() from BaseTableComponent
  questionKeys = ['number', 'title', 'type', 'correct', 'percent_correct'];
  questionValues = {
    exam: (activity => ExamQuestionComponent.getExam(activity)?.title),
    correct: (activity => activity.my_latest_result?.result?.success),
    percent_correct: (activity => {
      const amountSuccess = ActivityStatic.amountSuccess(activity);
      return amountSuccess ? this.percentPipe.transform(amountSuccess) : undefined;
    }),
    number: (activity => ExamQuestionComponent.getQuestionNumber(activity))
  };
  questionSortValues = {
    percent_correct: (activity => ActivityStatic.amountSuccess(activity)),
  };
  questionHeaders = {
    title: 'question'
  };
  questionIconify = {
    correct: activity => this.questionValues.correct(activity) ? 'true-icon' : 'false-icon'
  };
  questionLinks = {
    exam: (activity => ActivityStatic.routerLinkHelper(
      ExamQuestionComponent.getExam(activity),
      this.route.snapshot.params.collectionId)
    )
  };

  constructor(private route: ActivatedRoute,
              datePipe: DatePipe,
              logger: LoggingService,
              toaster: ToastService,
              private authService: AuthService,
              private percentPipe: PercentPipe,
              private translate: TranslateService) {
    super(route, datePipe, authService, translate, logger, toaster);
    Object.assign(this.questionValues, { type: (activity => activity.type && this.translate.instant(activity.type)) });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.authService.checkPermissions(['see_user_results'], this.route.snapshot.data.collection)) {
      this.questionKeys = ['number', 'title', 'type', 'percent_correct'];
    } else {
      this.questionKeys = ['number', 'title', 'type', 'correct'];
    }

    this.allKeys = this.showExam ? ['exam', ...this.questionKeys] : this.questionKeys;

    Object.assign(this.activityValues, this.questionValues);
    Object.assign(this.activitySortValues, this.questionSortValues);
    Object.assign(this.activityHeaders, this.questionHeaders);
    Object.assign(this.activityIconify, this.questionIconify);
    Object.assign(this.activityLinks, this.questionLinks);

    super.ngOnChanges(changes);
  }

}
