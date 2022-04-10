import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseTableComponent } from './base-table/base-table.component';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';
import { ActivatedRoute } from '@angular/router';
import { Participant } from 'src/app/core/interfaces/participant';
import { Activity } from 'src/app/core/interfaces/activity';
import { Construct } from 'src/app/core/interfaces/construct';
import { ConstructStatic } from 'src/app/constructs/construct.static';
import { ExamStatic } from 'src/app/activity/exam.static';
import { GradePipe } from '@shared/pipes/grade.pipe';
import { PercentPipe } from '@angular/common';

@Component({
  selector: 'app-participant-table',
  templateUrl: './base-table/base-table.component.html',
  styleUrls: ['./base-table/base-table.component.scss']
})
export class ParticipantTableComponent extends BaseTableComponent implements OnChanges {
  @Input() participants: Participant[];
  @Input() exams: Activity[];
  @Input() constructs: Construct[];
  @Input() examIds: number[];       // create additional columns showing the grades of these exams
  @Input() constructIds: number[];  // create additional columns showing the scores of these constructs
  @Input() loggingSubject = 'ParticipantTable';

  participantLinks = {};
  participantHeaders = {
    institution_id: 'student_number',
  };
  participantValues = {
    average_grade: (participant: Participant) => this.gradePipe.transform(ExamStatic.getUsersAverageGrade(this.exams, [participant.id])),
    construct_average: (participant: Participant) => {
      const positiveLeafConstructs = ConstructStatic.getPositiveLeafs(this.constructs);
      return this.percentPipe.transform(ConstructStatic.getLatestUsersAverage(positiveLeafConstructs, [participant.id]));
    },
    misconstruct_average: (participant: Participant) => {
      const negativeLeafConstructs = ConstructStatic.getNegativeLeafs(this.constructs);
      return this.percentPipe.transform(ConstructStatic.getLatestUsersAverage(negativeLeafConstructs, [participant.id]));
    }
  };
  participantSortValues = {
    construct_average: (participant: Participant) => {
      const positiveLeafConstructs = ConstructStatic.getPositiveLeafs(this.constructs);
      return ConstructStatic.getLatestUsersAverage(positiveLeafConstructs, [participant.id]) || 0;
    },
    misconstruct_average: (participant: Participant) => {
      const negativeLeafConstructs = ConstructStatic.getNegativeLeafs(this.constructs);
      return ConstructStatic.getLatestUsersAverage(negativeLeafConstructs, [participant.id]) || 0;
    }
  };

  // Override @Input() from BaseTableComponent
  data; sliderKey; childKey; sliderMin; sliderMax;

  constructor(private route: ActivatedRoute,
              logger: LoggingService,
              toaster: ToastService,
              private gradePipe: GradePipe,
              private percentPipe: PercentPipe) {
    super(logger, toaster);
    Object.assign(this.participantLinks, {
      first_name: (student => ['/', 'collections', this.route.snapshot.params.collectionId, 'students', student.id])
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.keys) {
      this.keys = ['first_name', 'last_name', 'institution_id'];
      if (this.exams && this.exams.length > 0) {
        this.keys.push('average_grade');

        if (this.examIds && this.examIds.length > 0) {
          const exams = this.exams.filter(exam => this.examIds.indexOf(exam.id) !== -1);
          for (let i = 0; i < exams.length; i++) {
            this.addColumn(
              `exam_${i}`,
              'no_translation',
              {text: exams[i].title},
              (participant: Participant) => this.gradePipe.transform(ExamStatic.getUserGrade(exams[i], participant.id)),
              (participant: Participant) => ExamStatic.getUserGrade(exams[i], participant.id)
            );
          }
        }
      }

      if (this.constructs && this.constructs.length > 0) {
        const positiveConstructs = this.constructs.filter(construct => ConstructStatic.isConstructPositive(construct));
        if (positiveConstructs.length > 0) {
          this.keys.push('construct_average');
        }
        if (this.constructs.length - positiveConstructs.length > 0) {
          this.keys.push('misconstruct_average');
        }

        if (this.constructIds && this.constructIds.length > 0) {
          const constructs = this.constructs.filter(construct => this.constructIds.indexOf(construct.id) !== -1);
          for (let i = 0; i < constructs.length; i++) {
            this.addColumn(
              `construct_${i}`,
              'no_translation',
              {text: constructs[i].name},
              (participant: Participant) => this.percentPipe.transform(
                ConstructStatic.getLatestUserScore(constructs[i], participant.id)
              ),
              (participant: Participant) => ConstructStatic.getLatestUserScore(constructs[i], participant.id),
            );
          }
        }
      }
    }

    this.injectDefaults(this.routerLinks, this.participantLinks);
    this.injectDefaults(this.headerOverrides, this.participantHeaders);
    this.injectDefaults(this.valueOverrides, this.participantValues);
    this.injectDefaults(this.sortValueOverrides, this.participantSortValues);
    this.data = this.participants;

    super.ngOnChanges(changes);
  }

}
