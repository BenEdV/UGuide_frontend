import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ChartDataSets } from 'chart.js';
import { Collection } from 'src/app/core/interfaces/collection';
import { AuthService } from 'src/app/core/services/auth.service';
import { Activity } from '../../core/interfaces/activity';
import { ActivityStatic } from '../activity.static';
import { ExamStatic } from '../exam.static';

@Component({
  selector: 'app-activity-overview',
  templateUrl: './exam-overview.component.html',
  styleUrls: ['./exam-overview.component.scss']
})
export class ExamOverviewComponent implements OnInit {
  collection: Collection;
  exams: Activity[];
  grades: any[];
  violinGrades: any[];
  gradeLabels: string[];
  participantCount: any[];

  sortedExams: Activity[];
  examProgressDatasets: ChartDataSets[];
  examProgressLabels: string[];

  showUserResults: boolean;
  showMyResults: boolean;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private translate: TranslateService) {  }

  randomValues(count, min, max) {
    const delta = max - min;
    return Array.from({length: count}).map(() => Math.random() * delta + min);
  }

  ngOnInit() {
    this.collection = this.route.snapshot.data.collection;
    this.exams = this.route.snapshot.data.activities.examList;
    this.sortedExams = this.exams.sort((a, b) => a.end_time.localeCompare(b.end_time));

    this.showUserResults = false;
    this.showMyResults = false;

    if (this.authService.checkPermissions(['see_user_results'], this.collection)) {
      this.showUserResults = true;
      this.createGradeViolinChart(this.sortedExams);
      this.createParticipantChart(this.sortedExams);
    }

    if (this.authService.checkRoles(['student'], this.collection)) {
      this.showMyResults = true;
      this.createGradeProgressChart(this.sortedExams);
    }
  }

  createGradeViolinChart(exams: Activity[]) {
    this.grades = [{data: [], legend: false, itemRadius: 1, outlierColor: 'red'}];
    this.gradeLabels = [];

    for (const exam of exams) {
      const grades = ExamStatic.getAllGrades(exam);
      this.grades[0].data.push(grades);
      this.gradeLabels.push(exam.title);
    }
  }

  createParticipantChart(exams: Activity[]) {
    this.participantCount = [{data: [], legend: false}];
    for (const exam of exams) {
      const grades = ExamStatic.getAllGrades(exam);
      const participantCount = grades && grades.length;
      this.participantCount[0].data.push(participantCount);
    }
  }

  createGradeProgressChart(exams: Activity[]) {
    this.examProgressDatasets = [{
      data: [],
      label: this.translate.instant('exam.overview.grade_progress.my_grade')
    }, {
      data: [],
      label: this.translate.instant('exam.overview.grade_progress.average_grade')
    }];
    this.examProgressLabels = [];
    for (const exam of exams) {
      this.examProgressDatasets[0].data.push(ExamStatic.getUserGrade(exam));
      this.examProgressDatasets[1].data.push(exam.properties.average);
      this.examProgressLabels.push(exam.title);
    }
  }

  examChartClick($event) {
    if ($event.active.length > 0) {
      const index: number = $event.active[0]._index;
      this.router.navigate(ActivityStatic.routerLinkHelper(this.sortedExams[index], this.route.snapshot.params.collectionId));
    }
  }

}
