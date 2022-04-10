import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseTableComponent } from './base-table/base-table.component';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';
import { ActivatedRoute } from '@angular/router';
import { ExamStatic } from 'src/app/activity/exam.static';
import { ConstructStatic } from 'src/app/constructs/construct.static';
import { Activity } from 'src/app/core/interfaces/activity';
import { Construct } from 'src/app/core/interfaces/construct';
import { Group } from 'src/app/core/interfaces/group';
import { GradePipe } from '@shared/pipes/grade.pipe';
import { PercentPipe } from '@angular/common';

@Component({
  selector: 'app-group-table',
  templateUrl: './base-table/base-table.component.html',
  styleUrls: ['./base-table/base-table.component.scss']
})
export class GroupTableComponent extends BaseTableComponent implements OnChanges {
  @Input() groups: Group[];
  @Input() exams: Activity[];
  @Input() constructs: Construct[];
  @Input() loggingSubject = 'GroupTable';

  groupHeaders = {
    student_count: 'students'
  };
  groupValues = {
    average_grade: (group: Group) => this.gradePipe.transform(ExamStatic.getUsersAverageGrade(this.exams, this.getStudentIds(group))),
    student_count: (group: Group) => group.students?.length || group.member_count || 0,
    construct_average: (group: Group) => {
      const positiveLeafConstructs = ConstructStatic.getPositiveLeafs(this.constructs);
      return this.percentPipe.transform(ConstructStatic.getLatestUsersAverage(positiveLeafConstructs, this.getStudentIds(group)));
    },
    misconstruct_average: (group: Group) => {
      const negativeLeafConstructs = ConstructStatic.getNegativeLeafs(this.constructs);
      return this.percentPipe.transform(ConstructStatic.getLatestUsersAverage(negativeLeafConstructs, this.getStudentIds(group)));
    }
  };
  groupSortValues = {
    construct_average: (group: Group) => {
      const positiveLeafConstructs = ConstructStatic.getPositiveLeafs(this.constructs);
      return ConstructStatic.getLatestUsersAverage(positiveLeafConstructs, this.getStudentIds(group)) || 0;
    },
    misconstruct_average: (group: Group) => {
      const negativeLeafConstructs = ConstructStatic.getNegativeLeafs(this.constructs);
      return ConstructStatic.getLatestUsersAverage(negativeLeafConstructs, this.getStudentIds(group)) || 0;
    }
  };
  groupLinks = {};

  // Override @Input() from BaseTableComponent
  data; sliderKey; childKey; sliderMin; sliderMax;

  constructor(private route: ActivatedRoute,
              logger: LoggingService,
              toaster: ToastService,
              private gradePipe: GradePipe,
              private percentPipe: PercentPipe) {
    super(logger, toaster);
    Object.assign(this.groupLinks, {
      name: (group => ['/', 'collections', this.route.snapshot.params.collectionId, 'groups', group.id])
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.keys) {
      this.keys = ['name', 'student_count'];
      if (this.exams && this.exams.length > 0) {
        this.keys.push('average_grade');
      }

      if (this.constructs && this.constructs.length > 0) {
        const positiveConstructs = this.constructs.filter(construct => ConstructStatic.isConstructPositive(construct));
        if (positiveConstructs.length > 0) {
          this.keys.push('construct_average');
        }
        const negativeConstructs = this.constructs.filter(construct => ConstructStatic.isConstructNegative(construct));
        if (negativeConstructs.length > 0) {
          this.keys.push('misconstruct_average');
        }
      }
    }

    this.injectDefaults(this.headerOverrides, this.groupHeaders);
    this.injectDefaults(this.routerLinks, this.groupLinks);
    this.injectDefaults(this.valueOverrides, this.groupValues);
    this.injectDefaults(this.sortValueOverrides, this.groupSortValues);
    this.data = this.groups;

    super.ngOnChanges(changes);
  }

  getStudentIds(group: Group): number[] {
    return group.students?.map(student => student.id) || [];
  }

}
