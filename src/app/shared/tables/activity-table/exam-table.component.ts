import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoggingService } from '../../../core/services/logging.service';
import { ToastService } from '../../../core/services/components/toast.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@shared/pipes/date.pipe';
import { ActivityTableComponent } from './activity-table.component';
import { ExamStatic } from 'src/app/activity/exam.static';
import { Activity } from 'src/app/core/interfaces/activity';
import { AuthService } from 'src/app/core/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { GradePipe } from '@shared/pipes/grade.pipe';

@Component({
  selector: 'app-exam-table',
  templateUrl: './../base-table/base-table.component.html',
  styleUrls: ['./../base-table/base-table.component.scss']
})
export class ExamTableComponent extends ActivityTableComponent implements OnChanges {
  @Input() userId: number;
  @Input() userIds: number[];
  @Input() sliderEnabled: boolean;
  @Input() loggingSubject = 'ExamTable';

  // Override @Input() from BaseTableComponent
  allKeys = ['title', 'grade', 'usersAverage', 'average', 'end_time'];
  examHeaders = {
    grade: 'grade',
    usersAverage: 'group_average'
  };
  examValues = {
    grade: (exam: Activity) => {
      const grade = ExamStatic.getUserGrade(exam, this.userId);
      return grade && this.gradePipe.transform(grade);
    },
    usersAverage: (exam: Activity) => {
      const grade = ExamStatic.getUsersAverageGrade([exam], this.userIds);
      return grade && this.gradePipe.transform(grade);
    },
    average: (exam: Activity) => {
      const grade = exam.properties?.average && +exam.properties.average.toFixed(1);
      return grade && this.gradePipe.transform(grade);
    }
  };
  examSortValues = {
    grade: (exam: Activity) => ExamStatic.getUserGrade(exam, this.userId),
    usersAverage: (exam: Activity) => ExamStatic.getUsersAverageGrade([exam], this.userIds),
    average: (exam: Activity) => exam.properties?.average && +exam.properties.average.toFixed(1)
  };

  constructor(route: ActivatedRoute,
              datePipe: DatePipe,
              logger: LoggingService,
              toaster: ToastService,
              authService: AuthService,
              translate: TranslateService,
              private gradePipe: GradePipe) {
    super(route, datePipe, authService, translate, logger, toaster);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.sliderEnabled === null || this.sliderEnabled === undefined) {
      this.sliderEnabled = !this.minimal;
    }

    Object.assign(this.activityHeaders, this.examHeaders);
    Object.assign(this.activityValues, this.examValues);
    Object.assign(this.activitySortValues, this.examSortValues);

    if (this.sliderEnabled) {
      this.sliderKey = 'results';
      this.sliderMax = 10;
    }

    super.ngOnChanges(changes);
  }

}
