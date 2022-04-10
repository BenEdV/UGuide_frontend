import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Construct } from '../../core/interfaces/construct';
import { ActivityService } from '../../core/services/collection/activity.service';
import { ActivityStatic } from '../../activity/activity.static';
import { ToolbarService } from 'src/app/core/services/components/toolbar.service';
import { Score } from 'src/app/core/interfaces/score';
import { Activity } from 'src/app/core/interfaces/activity';
import { Collection } from 'src/app/core/interfaces/collection';
import { StudentSetParams } from 'src/app/participants/student-set/student-set.component';
import { TranslateService } from '@ngx-translate/core';
import { ConstructStatic } from '../construct.static';
import { ConstructProgressDataset } from '@shared/charts/construct-progress-chart.component';
import { pathPlugin } from '../../shared/charts/chart-plugins';
import { DatePipe } from '@shared/pipes/date.pipe';

@Component({
  selector: 'app-construct',
  templateUrl: './construct.component.html',
  styleUrls: ['./construct.component.scss']
})
export class ConstructComponent implements OnInit, OnDestroy {
  construct: Construct;
  constructs: Construct[];
  connectedQuestions: Activity[];
  connectedStudyMaterial: Activity[];

  pathPlugin = pathPlugin;
  myScorePath = {
    scales: ['x-axis-1', 'y-axis-1'],
    points: [[0, 0], [1, 100]],
    size: 2.0,
    hidden: false,
    style: 'rgba(0,0,0,0.75)',
    text: [{
      string: this.translate.instant('construct.entity.score_distribution.chart.my_score'),
      position: 0.5
    }]
  };
  rirValueOptions = {
    aspectRatio: 1.4,
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => null,
        label: (tooltipItem, data) => {
          return this.translate.instant('construct.entity.question_rir.chart.callback', {
            value: tooltipItem.yLabel,
            question: this.questionLabels[tooltipItem.index]
          });
        }
      }
    }
  };
  constructProgressOptions = {
    aspectRatio: 1.4,
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => null,
        label: (tooltipItem, data) => {
          return this.translate.instant('construct.entity.construct_progress.chart.callback', {
            date: this.datePipe.transform(tooltipItem.xLabel),
            score: tooltipItem.yLabel.toFixed(0)
          });
        }
      }
    }
  };
  questionLabels: string[];
  questionRirs;

  warningScore: Score;
  isPositive: boolean;
  positiveHardConstructThreshold: number;
  negativeHardConstructThreshold: number;

  studyMaterialSeenPercentage = 0;
  studyMaterialCompletedPercentage = 0;

  constructProgressDatasets: ConstructProgressDataset[];

  private dataSubscription;
  scoreCallback = tick => tick * 100 + '%';

  constructor(private route: ActivatedRoute,
              private toolbarService: ToolbarService,
              private activityService: ActivityService,
              private router: Router,
              private datePipe: DatePipe,
              private translate: TranslateService) { }

  ngOnInit() {
    this.dataSubscription = this.route.data.subscribe(routeData => this.setConstruct(routeData));
  }

  setConstruct(routeData) {
    this.construct = routeData.construct;
    this.constructs = routeData.constructs;

    const collection = this.route.snapshot.data.collection as Collection;
    // TODO: Remove hardcoded threshold fallbacks
    this.positiveHardConstructThreshold = collection.settings?.positiveHardConstructThreshold || 0.5;
    this.negativeHardConstructThreshold = collection.settings?.negativeHardConstructThreshold || 0.3;

    this.connectedQuestions = this.construct.activities.filter(
      activity => ActivityStatic.isActivityOfType(activity, 'question')
    ) as unknown as Activity[];
    this.connectedStudyMaterial = this.construct.activities.filter(
      activity => ActivityStatic.isActivityOfType(activity, 'material')
    ) as unknown as Activity[];
    this.warningScore = this.construct.my_latest_score || this.construct.latest_average_score;
    this.isPositive = ConstructStatic.isConstructPositive(this.construct);

    this.questionLabels = this.connectedQuestions.map(question => question.title);
    const questionIds = this.connectedQuestions.map(question => question.id);
    if (this.construct.my_latest_score) {
      this.myScorePath.points = [[this.construct.my_latest_score.score, 0], [this.construct.my_latest_score.score, 100]];
    }

    this.questionRirs = this.activityService.getRir(questionIds)
      .pipe(
        map(results => {
          const res = [{
            data: []
          }];
          for (const rir of Object.values(results)) {
            const value = rir ? rir.toFixed(2) : null;
            res[0].data.push(value);
          }
          return res;
        })
      );

    this.setStudyMaterialProgress();
    this.createConstructProgressChart();

    this.toolbarService.addTab(
      {
        name: this.construct.name,
        link: ['collections', routeData.collection.id, 'constructs', this.construct.id]
      },
      routeData.collection
    );
  }

  setStudyMaterialProgress() {
    if (this.connectedStudyMaterial.length === 0) {
      this.studyMaterialCompletedPercentage = 1;
      return;
    }

    let completed = 0;
    let seen = 0;
    for (const studyMaterial of this.connectedStudyMaterial) {
      if (ActivityStatic.isCompleted(studyMaterial)) {
        completed++;
      } else if (ActivityStatic.isInitialized(studyMaterial)) {
        seen++;
      }
    }

    this.studyMaterialCompletedPercentage = completed / this.connectedStudyMaterial.length;
    this.studyMaterialSeenPercentage = seen / this.connectedStudyMaterial.length;
  }

  createConstructProgressChart() {
    // let averageScores: Score[] = [];
    // let averageLabel: string;
    // let averageConstructIds: number[];
    // if (ConstructStatic.isConstructPositive(this.construct)) {
    //   const positiveLeafConstructs = ConstructStatic.getPositiveLeafs(this.constructs);
    //   positiveLeafConstructs.forEach(construct => construct.average_scores && averageScores.push(...construct.average_scores));
    //   averageLabel = this.translate.instant('construct.entity.construct_progress.construct_average');
    //   averageConstructIds = positiveLeafConstructs.map(construct => construct.id);
    // } else {
    //   const negativeLeafConstructs = ConstructStatic.getNegativeLeafs(this.constructs);
    //   negativeLeafConstructs.forEach(construct => construct.average_scores && averageScores.push(...construct.average_scores));
    //   averageLabel = this.translate.instant('construct.entity.construct_progress.misconstruct_average');
    //   averageConstructIds = negativeLeafConstructs.map(construct => construct.id);
    // }

    this.constructProgressDatasets = [
      {
        scores: this.construct.average_scores,
        construct_ids: [this.construct.id],
        label: this.translate.instant('construct.entity.construct_progress.label', {constructName: this.construct.name}),
        colorIdx: 0
      }
      // {
      //   scores: averageScores,
      //   construct_ids: averageConstructIds,
      //   label: averageLabel,
      //   colorIdx: 1
      // }
    ];
  }

  handleDistributionChartClick($event) {
    if (!$event.value) {
      return;
    }

    const maxScore = +$event.value.x;
    const studentIds = [];
    for (const score of this.construct.latest_user_scores) {
      if (score.score <= maxScore) {
        studentIds.push(score.user_id);
      }
    }

    const setParams: StudentSetParams = {
      title: 'construct_distribution_score',
      titleExtras: [$event.value.x, this.construct.name],
      studentIds,
      constructIds: [this.construct.id]
    };

    this.router.navigate(['/', 'collections', this.route.snapshot.data.collection.id, 'students', 'set'], {queryParams: setParams});
  }

  handleRirChartClick($event) {
    if ($event.active.length > 0) {
      const idx = $event.active[0]._index;
      const question = this.connectedQuestions[idx];
      this.router.navigate(ActivityStatic.routerLinkHelper(question, this.route.snapshot.data.collection.id));
    }
  }

  ngOnDestroy() {
    this.dataSubscription.unsubscribe();
  }

}
