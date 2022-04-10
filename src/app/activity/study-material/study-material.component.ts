import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity, ActivityAttachment } from '../../core/interfaces/activity';
import { ActivityComponent } from '../activity/activity.component';
import { ActivityService } from '../../core/services/collection/activity.service';
import { LoggingService } from '../../core/services/logging.service';
import { ToolbarService } from 'src/app/core/services/components/toolbar.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Participant } from 'src/app/core/interfaces/participant';
import { ParticipantService } from 'src/app/core/services/collection/participants/participant.service';
import { StudentSetParams } from 'src/app/participants/student-set/student-set.component';
import { ActivityStatic } from '../activity.static';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@shared/pipes/date.pipe';
import { SharedStatic } from '@shared/shared.static';

type studyMaterialStatus = 'unseen' | 'seen' | 'completed';

@Component({
  selector: 'app-study-material',
  templateUrl: './study-material.component.html',
  styleUrls: ['./study-material.component.scss']
})
export class StudyMaterialComponent extends ActivityComponent implements OnInit {
  studyMaterial: Activity;
  propertyKeys: string[];

  resourceLoaded = false;
  status: studyMaterialStatus = 'unseen';
  completedTimestamp: string;

  defaultAttachments: ActivityAttachment[];
  pdfs: ActivityAttachment[];
  defaultProperties: any[];
  defaultUrls: string[];
  videoUrls: string[];

  progressDatasets: any[] = [
    {
      label: this.translate.instant('study_material.entity.progress.chart.unseen'),
      backgroundColor: [],
      data: []
    },
    {
      label: this.translate.instant('study_material.entity.progress.chart.seen'),
      backgroundColor: [],
      data: []
    },
    {
      label: this.translate.instant('study_material.entity.progress.chart.completed'),
      backgroundColor: [],
      data: []
    }
  ];
  progressOptions = {
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => null,
        label: (tooltipItem, data) => {
          let translateString;
          if (tooltipItem.datasetIndex === 0) {
            translateString = 'study_material.entity.progress.chart.callback.unseen';
          } else if (tooltipItem.datasetIndex === 1) {
            translateString = 'study_material.entity.progress.chart.callback.seen';
          } else if (tooltipItem.datasetIndex === 2) {
            translateString = 'study_material.entity.progress.chart.callback.completed';
          }
          if (tooltipItem.yLabel === 1) {
            translateString += '_sing';
          }
          return this.translate.instant(translateString, {
            date: this.datePipe.transform(tooltipItem.xLabel),
            num_students: tooltipItem.yLabel
          });
        }
      }
    }
  };
  handlingProgressChartClick = false;

  isCompleted = ActivityStatic.isCompleted;
  isInitialized = ActivityStatic.isInitialized;

  constructor(private route: ActivatedRoute,
              toolbarService: ToolbarService,
              private activityService: ActivityService,
              private loggingService: LoggingService,
              private authService: AuthService,
              private participantService: ParticipantService,
              private router: Router,
              private datePipe: DatePipe,
              private translate: TranslateService) {
    super(route, toolbarService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  setActivity(routeData) {
    this.studyMaterial = routeData.studyMaterial;

    this.handleAttachmentsAndProperties();
    this.handleFirstOpen();
    this.generateProgressGraph();

    this.addNavTab(this.studyMaterial, 'study_material', ['material']);
  }

  handleAttachmentsAndProperties() {
    this.pdfs = [];
    this.defaultAttachments = [];
    for (const attachment of this.studyMaterial.attachments) {
      if (attachment.extension.toLowerCase() === 'pdf') {
        this.pdfs.push(attachment);
      } else {
        this.defaultAttachments.push(attachment);
      }
    }

    this.defaultProperties = [];
    this.defaultUrls = [];
    this.videoUrls = [];
    this.propertyKeys = Object.keys(this.studyMaterial.properties || {});
    for (const key of this.propertyKeys) {
      if (key === 'url') {
        if (ActivityStatic.isActivityOfType(this.studyMaterial, 'material.video')) {
          this.videoUrls = [this.studyMaterial.properties[key]];
        } else {
          this.defaultUrls = [this.studyMaterial.properties[key]];
        }
      } else {
        this.defaultProperties.push(key);
      }
    }
  }

  handleFirstOpen() {
    if (this.authService.checkRoles(['student'], this.route.snapshot.data.collection)) {
      if (!this.studyMaterial.my_results || this.studyMaterial.my_results.length === 0) {
        this.markAsSeen();
      } else if (this.isCompleted(this.studyMaterial)) {
        this.status = 'completed';
        this.completedTimestamp = this.studyMaterial.my_latest_result.timestamp;
      } else if (this.isInitialized(this.studyMaterial)) {
        this.status = 'seen';
      }
    }
  }

  markAsUnseen() {
    if (this.status !== 'unseen') {
      this.status = 'unseen';

      const initializedIdx = ActivityStatic.indexOfInitialized(this.studyMaterial.my_results);
      if (initializedIdx !== -1) {
        this.activityService.voidResult(this.studyMaterial.id, this.studyMaterial.my_results[initializedIdx].id)
          .subscribe(res => this.studyMaterial = res);
      }

      const completedIdx = ActivityStatic.indexOfCompleted(this.studyMaterial.my_results);
      if (completedIdx !== -1) {
        this.activityService.voidResult(this.studyMaterial.id, this.studyMaterial.my_results[completedIdx].id)
          .subscribe(res => this.studyMaterial = res);
      }
    }
  }

  markAsSeen() {
    if (this.status !== 'seen') {
      this.status = 'seen';

      if (!ActivityStatic.isInitialized(this.studyMaterial)) {
        this.activityService.markAsStarted(this.studyMaterial.id).subscribe(res => this.studyMaterial = res);
      }

      const completedIdx = ActivityStatic.indexOfCompleted(this.studyMaterial.my_results);
      if (completedIdx !== -1) {
        this.activityService.voidResult(this.studyMaterial.id, this.studyMaterial.my_results[completedIdx].id)
          .subscribe(res => this.studyMaterial = res);
      }
    }
  }

  markAsCompleted() {
    if (this.status !== 'completed') {
      this.status = 'completed';
      this.completedTimestamp = new Date().toString();

      if (!ActivityStatic.isInitialized(this.studyMaterial)) {
        this.activityService.markAsStarted(this.studyMaterial.id).subscribe(res => this.studyMaterial = res);
      }

      if (!ActivityStatic.isCompleted(this.studyMaterial)) {
        this.activityService.markAsComplete(this.studyMaterial.id).subscribe(res => this.studyMaterial = res);
      }
    }
  }

  getDateDMY(timestamp: string): string { // removes the hours, minutes & seconds
    const timestampDate = new Date(timestamp);
    return new Date(timestampDate.getFullYear(), timestampDate.getMonth(), timestampDate.getDate()).toISOString();
  }

  generateProgressGraph() {
    const countsPerDay = {};
    let previousDay = SharedStatic.getDateDMY(this.studyMaterial.date_added);
    countsPerDay[previousDay] = {
      unseen: this.route.snapshot.data.collection.member_count,
      seen: 0,
      completed: 0
    };

    for (let i = this.studyMaterial.results.length - 1; i >= 0; i--) {
      const result = this.studyMaterial.results[i];
      const resultLocaleDate = SharedStatic.getDateDMY(result.timestamp);
      if (countsPerDay[resultLocaleDate] === undefined) {
        countsPerDay[resultLocaleDate] = {
          unseen: countsPerDay[previousDay].unseen,
          seen: countsPerDay[previousDay].seen,
          completed: countsPerDay[previousDay].completed
        };
        previousDay = resultLocaleDate;
      }

      if (ActivityStatic.indexOfInitialized([result]) !== -1) {
        countsPerDay[resultLocaleDate].unseen--;
        countsPerDay[resultLocaleDate].seen++;
      } else if (ActivityStatic.indexOfCompleted([result]) !== -1) {
        countsPerDay[resultLocaleDate].seen--;
        countsPerDay[resultLocaleDate].completed++;
      }
    }

    const sortedDays = Object.keys(countsPerDay).sort((a, b) => a.localeCompare(b));
    for (const dateString of sortedDays) {
      this.progressDatasets[0].data.push({
        t: dateString,
        y: countsPerDay[dateString].unseen
      });
      this.progressDatasets[1].data.push({
        t: dateString,
        y: countsPerDay[dateString].seen
      });
      this.progressDatasets[2].data.push({
        t: dateString,
        y: countsPerDay[dateString].completed
      });
    }
  }

  logAttachment(attachment: ActivityAttachment) {
    this.loggingService.event('StudyMaterial', 'AttachmentClick',
      {
        study_material_id: this.studyMaterial.id,
        attachment_id: attachment.id
      }
    );
  }

  logURL(url: string) {
    this.loggingService.event('StudyMaterial', 'URLClick',
      {
        study_material_id: this.studyMaterial.id,
        url
      }
    );
  }

  progressChartClick($event) {
    if (!$event.value || $event.active.length === 0) {
      return;
    }
    this.handlingProgressChartClick = true;
    const endDate = new Date($event.value.t || $event.value.x);
    endDate.setDate(endDate.getDate() + 1); // add 1 day
    const studentIds = [];
    const datasetIndex = $event.active[0]._datasetIndex;
    this.participantService.students().subscribe((students: Participant[]) => {
      for (const student of students) {
        const results = this.studyMaterial.results.filter(result => {
          return result.user_id === student.id && new Date(result.timestamp) <= endDate;
        });
        const initializedIdx = ActivityStatic.indexOfInitialized(results);
        const completedIdx = ActivityStatic.indexOfCompleted(results);

        if (datasetIndex === 0 && initializedIdx === -1 && completedIdx === -1) { // label === 'Unseen'
          studentIds.push(student.id);
        } else if (datasetIndex === 1 && initializedIdx !== -1 && completedIdx === -1) { // label === 'Seen'
          studentIds.push(student.id);
        } else if (datasetIndex === 2 && completedIdx !== -1) { // label === 'Completed'
          studentIds.push(student.id);
        }
      }

      const setParams: StudentSetParams = {
        title: '',
        titleExtras: [this.studyMaterial.title, this.datePipe.transform(endDate)],
        studentIds
      };

      if (datasetIndex === 0) { // label === 'Unseen'
        setParams.title = 'study_material_unseen';
      } else if (datasetIndex === 1) { // label === 'Seen'
        setParams.title = 'study_material_seen';
      } else { // label === 'Completed'
        setParams.title = 'study_material_completed';
      }

      this.router.navigate(
        ['/', 'collections', this.route.snapshot.data.collection.id, 'students', 'set'],
        {queryParams: setParams}
      );
    });
  }

}
