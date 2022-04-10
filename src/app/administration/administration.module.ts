import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministrationModelComponent } from './administration-model/administration-model.component';
import { AdministrationCourseComponent } from './administration-course/administration-course.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { AdministrationConstructComponent } from './administration-construct/administration-construct.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BaseAdministrationComponent } from './base-administration/base-administration.component';
import { DeleteModalComponent } from './delete-modal/delete-modal.component';
import { AdministrationStudyMaterialComponent } from './administration-study-material/administration-study-material.component';
import { AdministrationConnectorComponent } from './administration-connector/administration-connector.component';
import { AdministrationExamComponent } from './administration-exam/administration-exam.component';
import { AdministrationMappingComponent } from './administration-mapping/administration-mapping.component';
import { AdministrationGroupComponent } from './administration-group/administration-group.component';
import { AdministrationSurveyComponent } from './administration-survey/administration-survey.component';
import { AdministrationSurveyFormComponent } from './administration-survey-form/administration-survey-form.component';
import { ActivityModule } from '../activity/activity.module';
import { AdministrationCollectionComponent } from './administration-collection/administration-collection.component';


@NgModule({
  declarations: [
    AdministrationModelComponent,
    AdministrationCourseComponent,
    AdministrationConstructComponent,
    BaseAdministrationComponent,
    DeleteModalComponent,
    AdministrationStudyMaterialComponent,
    AdministrationConnectorComponent,
    AdministrationExamComponent,
    AdministrationMappingComponent,
    AdministrationGroupComponent,
    AdministrationSurveyComponent,
    AdministrationSurveyFormComponent,
    AdministrationCollectionComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    NgSelectModule,
    ActivityModule
  ],
  exports: []
})
export class AdministrationModule { }
