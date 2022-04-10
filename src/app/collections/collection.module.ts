import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionRoutingModule } from './collection-routing.module';
import { CollectionListComponent } from './collection-list/collection-list.component';
import { CollectionOverviewComponent } from './collection-overview/collection-overview.component';
import { SharedModule } from '../shared/shared.module';
import { TestModule } from '../test/test.module';
import { ModelsModule } from '../models/models.module';
import { AdministrationModule } from '../administration/administration.module';
import { ConstructsModule } from '../constructs/constructs.module';
import { CourseListComponent } from './course-list/course-list.component';
import { GlobalActivitiesListComponent } from './global-activities-list/global-activities-list.component';
import { ActivityModule } from '../activity/activity.module';
import { PrivacyOverviewComponent } from './privacy-overview/privacy-overview.component';
import { ParticipantsModule } from '../participants/participants.module';
import { CollectionStudentOverviewComponent } from './collection-student-overview/collection-student-overview.component';


@NgModule({
  declarations: [
    CollectionListComponent,
    CollectionOverviewComponent,
    CourseListComponent,
    GlobalActivitiesListComponent,
    PrivacyOverviewComponent,
    CollectionStudentOverviewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ModelsModule,
    ConstructsModule,
    AdministrationModule,
    ParticipantsModule,
    TestModule,
    CollectionRoutingModule,
    ActivityModule
  ]
})
export class CollectionModule { }
