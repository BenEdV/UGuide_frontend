import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupListComponent } from './group-list/group-list.component';
import { StudentListComponent } from './student-list/student-list.component';
import { GroupComponent } from './group/group.component';
import { StudentComponent } from './student/student.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { StudentOverviewComponent } from './student-overview/student-overview.component';
import { GroupOverviewComponent } from './group-overview/group-overview.component';
import { StudentSetComponent } from './student-set/student-set.component';


@NgModule({
  declarations: [
    GroupListComponent,
    StudentListComponent,
    GroupComponent,
    StudentComponent,
    StudentOverviewComponent,
    GroupOverviewComponent,
    StudentSetComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ]
})
export class ParticipantsModule { }
