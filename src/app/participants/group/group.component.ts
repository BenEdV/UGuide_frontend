import { Component, OnInit, OnDestroy } from '@angular/core';
import { Group } from 'src/app/core/interfaces/group';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolbarService } from 'src/app/core/services/components/toolbar.service';
import { Activity } from 'src/app/core/interfaces/activity';
import { Construct } from 'src/app/core/interfaces/construct';
import { ChartDataSets } from 'chart.js';
import { ExamStatic} from 'src/app/activity/exam.static';
import { ConstructStatic } from 'src/app/constructs/construct.static';
import { TranslateService } from '@ngx-translate/core';
import { ActivityStatic } from 'src/app/activity/activity.static';
import { ConstructProgressDataset } from '@shared/charts/construct-progress-chart.component';
import { DatePipe } from '@shared/pipes/date.pipe';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit, OnDestroy {
  dataSubscription;
  group: Group;
  constructs: Construct[];
  exams: Activity[];
  studentIds: number[];

  averageGrade: number;
  averageConstructScore: number;
  averageMisconstructScore: number;

  examChartDatasets: ChartDataSets[];
  examChartLabels: string[];
  examChartOptions = {
    aspectRatio: 1.8,
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => null,
        label: (tooltipItem, data) => {

          let translateString;
          if (tooltipItem.datasetIndex === 0) {
            translateString = 'group.entity.exam_progress.chart.callback.group';
          } else if (tooltipItem.datasetIndex === 1) {
            translateString = 'group.entity.exam_progress.chart.callback.cohort';
          }
          return this.translate.instant(translateString, {
            group_name: this.group.name,
            grade: tooltipItem.yLabel,
            exam: tooltipItem.xLabel
          });
        }
      }
    }
  };
  constructProgressChartOptions = {
    aspectRatio: 1.8,
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => null,
        label: (tooltipItem, data) => {
          let translateString;
          if (tooltipItem.datasetIndex === 0) {
            translateString = 'group.entity.construct_progress.chart.callback.group';
          } else if (tooltipItem.datasetIndex === 1) {
            translateString = 'group.entity.construct_progress.chart.callback.cohort';
          }
          return this.translate.instant(translateString, {
            group_name: this.group.name,
            date: this.datePipe.transform(tooltipItem.xLabel),
            score: tooltipItem.yLabel.toFixed(0)
          });
        }
      }
    }
  };

  showConstructChart = false;
  showMisconstructChart = false;
  positiveConstructProgressDatasets: ConstructProgressDataset[];
  negativeConstructProgressDatasets: ConstructProgressDataset[];

  constructor(private route: ActivatedRoute,
              private toolbarService: ToolbarService,
              private translate: TranslateService,
              private datePipe: DatePipe,
              private router: Router) { }

  setGroup(routeData) {
    this.group = routeData.group;
    this.constructs = routeData.constructs;
    this.exams = routeData.activities.examList;
    this.studentIds = this.group.students?.map(student => student.id);

    this.averageGrade = ExamStatic.getUsersAverageGrade(this.exams, this.studentIds) || 0;

    const positiveLeafConstructs = ConstructStatic.getPositiveLeafs(this.constructs);
    if (positiveLeafConstructs.length > 0) {
      this.averageConstructScore = ConstructStatic.getLatestUsersAverage(positiveLeafConstructs, this.studentIds) || 0;
    }

    const negativeLeafConstructs = ConstructStatic.getNegativeLeafs(this.constructs);
    if (negativeLeafConstructs.length > 0) {
      this.averageConstructScore = ConstructStatic.getLatestUsersAverage(positiveLeafConstructs, this.studentIds) || 0;
    }

    this.showConstructChart = positiveLeafConstructs.length > 0;
    this.showMisconstructChart = negativeLeafConstructs.length > 0;

    if (!this.showConstructChart && !this.showMisconstructChart) {
      this.showConstructChart = true; // always show at least one of the charts if there are no constructs
    }

    this.createExamProgressChart();
    this.createConstructProgressChart();

    this.toolbarService.addTab(
      {
        name: this.group.name,
        link: ['collections', routeData.collection.id, 'groups', this.group.id]
      },
      routeData.collection
    );
  }


  ngOnInit() {
    this.dataSubscription = this.route.data.subscribe(routeData => this.setGroup(routeData));
  }

  createExamProgressChart() {
    let averageTitle: string = this.translate.instant('group.entity.average_grade');
    averageTitle = averageTitle[0].toUpperCase() + averageTitle.slice(1, averageTitle.length);

    this.examChartDatasets = [
      {
        label: this.group.name,
        data: []
      },
      {
        label: averageTitle,
        data: []
      }
    ];
    this.examChartLabels = [];

    for (const exam of this.exams) {
      this.examChartLabels.push(exam.title);

      const groupAverage = ExamStatic.getUsersAverageGrade([exam], this.studentIds);
      this.examChartDatasets[0].data.push(groupAverage);

      const average = exam.properties.average;
      this.examChartDatasets[1].data.push(average && average.toFixed(2));
    }
  }

  createConstructProgressChart() {
    const positiveLeafConstructs = ConstructStatic.getPositiveLeafs(this.constructs);
    const positiveLeafConstructIds = positiveLeafConstructs.map(construct => construct.id);
    const positiveAverageScores = [];
    positiveLeafConstructs.forEach(construct => construct.average_scores && positiveAverageScores.push(...construct.average_scores));
    const positivesGroupScores = ConstructStatic.getUsersScores(positiveLeafConstructs, this.studentIds);

    this.positiveConstructProgressDatasets = [
      {
        scores: positivesGroupScores,
        construct_ids: positiveLeafConstructIds,
        label: this.translate.instant('student.entity.construct_progress.construct_average'),
        colorIdx: 0
      },
      {
        scores: positiveAverageScores,
        construct_ids: positiveLeafConstructIds,
        label: this.translate.instant('group.entity.construct_progress.cohort_average'),
        colorIdx: 1
      }
    ];

    const negativeLeafConstructs = ConstructStatic.getNegativeLeafs(this.constructs);
    const negativeLeafConstructIds = negativeLeafConstructs.map(construct => construct.id);
    const negativeAverageScores = [];
    negativeLeafConstructs.forEach(construct => construct.average_scores && negativeAverageScores.push(...construct.average_scores));
    const negativeGroupScores = ConstructStatic.getUsersScores(negativeLeafConstructs, this.studentIds);

    this.negativeConstructProgressDatasets = [
      {
        scores: negativeGroupScores,
        construct_ids: negativeLeafConstructIds,
        label: this.translate.instant('group.entity.misconstruct_progress.misconstruct_average'),
        colorIdx: 0
      },
      {
        scores: negativeAverageScores,
        construct_ids: negativeLeafConstructIds,
        label: this.translate.instant('group.entity.misconstruct_progress.cohort_average'),
        colorIdx: 1
      }
    ];
  }

  handleExamChartClick($event) {
    if ($event.active?.length > 0) {
      const exam = this.exams[$event.active[0]._index];
      this.router.navigate(ActivityStatic.routerLinkHelper(exam, this.route.snapshot.data.collection.id));
    }
  }

  handleConstructChartClick($event) {
    if ($event.active?.length > 0) {
      this.router.navigate(ConstructStatic.routerLinkHelper($event.construct, this.route.snapshot.data.collection.id));
    }
  }

  ngOnDestroy() {
    this.dataSubscription.unsubscribe();
  }

}
