import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamOverviewComponent } from './exam-overview/exam-overview.component';
import { ActivityListComponent } from './activity-list/activity-list.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ExamComponent } from './exam/exam.component';
import { ExamQuestionComponent } from './exam-question/exam-question.component';
import { StudyMaterialComponent } from './study-material/study-material.component';
import { ActivityComponent } from './activity/activity.component';
import { SurveyComponent } from './survey/survey.component';
import { SurveyFormComponent } from './survey-form/survey-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ThermosResultComponent } from './thermos-result/thermos-result.component';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { SurveyFormQuestionComponent } from './survey-form-question/survey-form-question.component';


@NgModule({
  declarations: [
    ExamOverviewComponent,
    ActivityListComponent,
    ExamComponent,
    ExamQuestionComponent,
    StudyMaterialComponent,
    ActivityComponent,
    SurveyComponent,
    SurveyFormComponent,
    ThermosResultComponent,
    SurveyFormQuestionComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    PdfJsViewerModule
  ],
  exports: [
    SurveyFormQuestionComponent
  ]
})
export class ActivityModule { }
