import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Collection } from '../../core/interfaces/collection';
import { Activity } from '../../core/interfaces/activity';
import { Construct } from '../../core/interfaces/construct';
import { ConstructStatic } from 'src/app/constructs/construct.static';
import { ExamStatic } from 'src/app/activity/exam.static';
import { StudentSetParams } from 'src/app/participants/student-set/student-set.component';
import { pathPlugin } from '@shared/charts/chart-plugins';
import { ActivityStatic } from 'src/app/activity/activity.static';
import { TranslateService } from '@ngx-translate/core';
import { PercentPipe } from '@angular/common';
import { Participant } from 'src/app/core/interfaces/participant';
import { SharedStatic } from '@shared/shared.static';
import { DatePipe } from '@shared/pipes/date.pipe';

@Component({
  selector: 'app-collection-overview',
  templateUrl: './collection-overview.component.html',
  styleUrls: ['./collection-overview.component.scss']
})
export class CollectionOverviewComponent implements OnInit {
  collection: Collection;
  exams: Activity[];
  studyMaterial: Activity[];
  constructs: Construct[];
  students: Participant[];

  showConstructs = false;
  showMisconstructs = false;
  showConstructChartScore = false;

  averageGrade: number;
  averageConstructScore: number;
  averageMisconstructScore: number;

  studentAverages: {score: number, name: string, user_id: string | number}[];
  pathPlugin = pathPlugin;
  gradeAveragePath = {
    scales: ['x-axis-0', 'y-axis-0'],
    points: [],
    size: 2.0,
    hidden: false,
    style: 'rgba(0,0,0,0.75)'
  };

  studyMaterialChartDatasets: any[];
  studyMaterialChartOptions = {
    aspectRatio: 1.4,
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => null,
        label: (tooltipItem, data) => {
          let translateString;
          if (tooltipItem.datasetIndex === 0) {
            translateString = 'course.overview.material.chart.tooltip.unseen';
          } else if (tooltipItem.datasetIndex === 1) {
            translateString = 'course.overview.material.chart.tooltip.seen';
          } else if (tooltipItem.datasetIndex === 2) {
            translateString = 'course.overview.material.chart.tooltip.completed';
          }

          return this.translate.instant(translateString, {
            date: this.datePipe.transform(tooltipItem.xLabel),
            percentage: this.percentPipe.transform(tooltipItem.yLabel / 100)
          });
        }
      }
    }
  };

  constructor(private route: ActivatedRoute,
              private router: Router,
              private percentPipe: PercentPipe,
              private datePipe: DatePipe,
              private translate: TranslateService) { }

  ngOnInit() {
    this.collection = this.route.snapshot.data.collection;
    this.exams = this.route.snapshot.data.activities.examList;
    this.studyMaterial = this.route.snapshot.data.activities.studyMaterialList;
    this.constructs = this.route.snapshot.data.constructs;
    this.students = this.route.snapshot.data.participants.studentList;

    const positiveConstructs = ConstructStatic.getPositiveLeafs(this.constructs);
    const negativeConstructs = ConstructStatic.getNegativeLeafs(this.constructs);

    this.showConstructs = positiveConstructs.length > 0;
    this.showMisconstructs = negativeConstructs.length > 0;

    if (this.constructs.find(construct => construct.my_latest_score)) {
      this.showConstructChartScore = true;
    }

    this.setGeneralInformation(this.exams, positiveConstructs, negativeConstructs);
    this.createGradeDistChart(this.exams, this.students, this.averageGrade);
    this.createStudyMaterialProgressChart();
  }

  setGeneralInformation(exams: Activity[], positiveConstructs: Construct[], negativeConstructs: Construct[]) {
    let averageSum = 0;
    for (const exam of exams) {
      averageSum += exam.properties.average;
    }
    this.averageGrade = averageSum > 0 ? averageSum / exams.length : 0;

    let positiveConstructSum = 0;
    for (const construct of positiveConstructs) {
      if (construct.latest_average_score) {
        positiveConstructSum += construct.latest_average_score.score;
      }
    }
    this.averageConstructScore = positiveConstructSum / positiveConstructs.length;

    let negativeConstructSum = 0;
    for (const construct of negativeConstructs) {
      if (construct.latest_average_score) {
        negativeConstructSum += construct.latest_average_score.score;
      }
    }
    this.averageMisconstructScore = negativeConstructSum / negativeConstructs.length;
  }

  createGradeDistChart(exams: Activity[], students: Participant[], averageGrade: number) {
    this.studentAverages = [];
    for (const student of students) {
      const average = ExamStatic.getUsersAverageGrade(exams, [student.id]);

      this.studentAverages.push({
        score: average,
        name: student.display_name,
        user_id: student.id
      });
    }

    if (averageGrade !== null && averageGrade !== undefined) {
      averageGrade = averageGrade + 1; // add 1 to compensate for the N.D. label
      this.gradeAveragePath.points.push([averageGrade, 0], [averageGrade, 100]);
    }
  }

  createStudyMaterialProgressChart() {
    this.studyMaterialChartDatasets = [{
      label: this.translate.instant('course.overview.material.chart.unseen'),
      backgroundColor: [],
      data: []
    }, {
      label: this.translate.instant('course.overview.material.chart.seen'),
      backgroundColor: [],
      data: []
    }, {
      label: this.translate.instant('course.overview.material.chart.completed'),
      backgroundColor: [],
      data: []
    }];

    const changesPerDay: {[day: string]: {unseen: number, seen: number, completed: number}} = {};
    for (const studyMaterial of this.studyMaterial) {
      for (const result of studyMaterial.results) {
        const day = SharedStatic.getDateDMY(result.timestamp);
        if (!changesPerDay[day]) {
          changesPerDay[day] = {
            unseen: 0,
            seen: 0,
            completed: 0
          };
        }

        if (ActivityStatic.indexOfInitialized([result]) !== -1) {
          changesPerDay[day].unseen--;
          changesPerDay[day].seen++;
        } else if (ActivityStatic.indexOfCompleted([result]) !== -1) {
          changesPerDay[day].seen--;
          changesPerDay[day].completed++;
        }
      }
    }

    const total = this.collection.member_count * this.studyMaterial.length;
    let unseen = total;
    let seen = 0;
    let completed = 0;

    let firstDate;
    for (const studyMaterial of this.studyMaterial) {
      if (studyMaterial.date_added.localeCompare(firstDate) === -1) {
        firstDate = studyMaterial.date_added;
      }
    }
    this.studyMaterialChartDatasets[0].data.push({
      t: firstDate,
      y: unseen / total * 100
    });
    this.studyMaterialChartDatasets[1].data.push({
      t: firstDate,
      y: seen / total * 100
    });
    this.studyMaterialChartDatasets[2].data.push({
      t: firstDate,
      y: completed / total * 100
    });

    const sortedDays = Object.keys(changesPerDay).sort((a, b) => a.localeCompare(b));
    for (const day of sortedDays) {
      const changes = changesPerDay[day];
      unseen += changes.unseen;
      seen += changes.seen;
      completed += changes.completed;

      this.studyMaterialChartDatasets[0].data.push({
        t: day,
        y: unseen / total * 100
      });
      this.studyMaterialChartDatasets[1].data.push({
        t: day,
        y: seen / total * 100
      });
      this.studyMaterialChartDatasets[2].data.push({
        t: day,
        y: completed / total * 100
      });
    }
  }

  handleConstructChartClick($event) {
    if ($event.construct) {
      this.router.navigate(ConstructStatic.routerLinkHelper($event.construct, this.collection.id));
    }
  }

  handleAverageGradeDistClick($event) {
    if ($event.items?.length > 0) {
      const studentIds = $event.items.map(item => item.user_id);

      const setParams: StudentSetParams = {
        title: 'average_grade_distribution',
        titleExtras: [$event.labelText],
        studentIds
      };
      this.router.navigate(['/', 'collections', this.collection.id, 'students', 'set'], {queryParams: setParams});
    }
  }

  handleStudyMaterialChartClick($event) {
    if ($event.active.length === 0) {
      return;
    }
    this.router.navigate(['/', 'collections', this.route.snapshot.data.collection.id, 'material', 'list']);
  }

}
