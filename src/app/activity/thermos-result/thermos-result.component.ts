import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { ActivityComponent } from '../activity/activity.component';
import { Activity, ActivityConstruct, ActivityResult } from '../../core/interfaces/activity';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityStatic } from '../activity.static';
import { linePlugin, textPlugin, pathPlugin } from '../../shared/charts/chart-plugins';
import { AuthService } from '../../core/services/auth.service';
import { ExternalService } from '../../core/services/external.service';
import { ToolbarService } from 'src/app/core/services/components/toolbar.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivityService } from 'src/app/core/services/collection/activity.service';
import { Score } from 'src/app/core/interfaces/score';
import { LoggingService } from 'src/app/core/services/logging.service';
import { PolarChartComponent } from '@shared/charts/polar-chart.component';
import { ConstructStatic } from 'src/app/constructs/construct.static';
import { GaugeChartComponent } from '@shared/charts/gauge-chart.component';
import { environment } from 'src/environments/environment';

type ChartType = 'MES' | 'GSQ';

@Component({
  selector: 'app-thermos-result',
  templateUrl: './thermos-result.component.html',
  styleUrls: ['./thermos-result.component.scss']
})
export class ThermosResultComponent extends ActivityComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoModal') videoModal;
  @ViewChild('mobileWarningModal') mobileWarningModal;
  @ViewChild('constructChart') constructChart: PolarChartComponent;
  @ViewChildren(GaugeChartComponent) GSQCharts!: QueryList<GaugeChartComponent>;

  survey: Activity;
  MESConstructs: ActivityConstruct[];
  GSQConstructs: ActivityConstruct[];
  private paramSubscription;

  studyName: string;
  studyCredits: string;
  studyGrade: string;

  feedbackPreviewConstruct: ActivityConstruct;
  feedbackClickedConstruct: ActivityConstruct;
  feedbackPrepare: Activity;
  feedbackActions: Activity[];
  feedbackActionIds: number[];
  feedbackReflect: Activity;
  feedbackNormKey = '';

  MESDataset = [{
    data: [],
    backgroundColor: [],
    borderColor: [],
    hoverBackgroundColor: [],
    hoverBorderColor: [],
    label: 'Score'
  }];
  MESLabels: string[];
  MESActiveDataIndices: number[] = [];
  GSQActiveList: boolean[] = [];
  angles: number[] = [];
  plugins = [linePlugin, textPlugin];
  MESOptions = {
    animation: {
      duration: 0
    },
    hover: {
      animationDuration: 0
    },
    responsiveAnimationDuration: 0,
    layout: {
      padding: {
        top: 35,
        bottom: 35
      }
    },
    scale: {
      ticks: {
        callback: (tick) => '          ' + tick + '%'
      }
    },
    plugins: {
      line: [
        {
          type: 'vertical',
          pos: 0,
          size: 0.95,
          style: 'rgba(0,0,0,0.75)'
        },
        {
          type: 'horizontal',
          pos: 0,
          size: 0.70,
          style: 'rgba(0,0,0,0.75)'
        }
      ],
      text: [
        {
          text: 'Positive Motivation',
          x: 0.18,
          y: 0.04
        },
        {
          text: 'Positive Engagement',
          x: 0.82,
          y: 0.04
        },
        {
          text: 'Negative Engagement',
          x: 0.18,
          y: 0.94
        },
        {
          text: 'Negative Motivation',
          x: 0.82,
          y: 0.94
        }
      ]
    }
  };

  GSQColors: {backgroundColor: string, hoverBackgroundColor: string}[][] = [];
  GSQOptions = [{
    animation: {
      duration: 0
    },
    plugins: {
      line: []
    }
  },
  {
    animation: {
      duration: 0
    },
    plugins: {
      line: []
    }
  }];
  showNorms = false;

  blockChartHover = false;
  isRedrawn = false;
  isSurveyCompleted = false;
  allResults: ActivityResult[] = [];
  resultIdx = 0;
  showMobileWarning = window.innerWidth < 768;
  lastLogHoverConstruct = null;
  currentLogHoverConstruct = null;
  feedbackHoverTime = null;
  subsessionKey = 'subsession';
  isCompleted = (survey: Activity) => this.resultIdx && this.resultIdx > 0 || ActivityStatic.indexOfCompleted(survey.my_results) === 0;

  constructor(private route: ActivatedRoute,
              toolbarService: ToolbarService,
              public authService: AuthService,
              public externalService: ExternalService,
              public activityService: ActivityService,
              private modal: NgbModal,
              private router: Router,
              private loggingService: LoggingService) {
    super(route, toolbarService);
  }

  ngOnInit() {
    super.ngOnInit();

    this.externalService.getOsirisResults().subscribe(
      (res: any) => {
        if (res) {
          const progress = res.student.progressPerStudentNumberList.progressPerStudentNumber[0].progressList.progress[0];
          this.studyName = progress.studyProgrammeName + ' ' + progress.examPhaseDescription;
          this.studyCredits = progress.applicableObtainedCredits;
          this.studyGrade = progress.averageGrade;
        }
      }
    );

    this.paramSubscription = this.route.queryParams.subscribe((params) => {
      if (params.feedbackId) {
        const constructId = +params.feedbackId;
        const construct = this.survey.constructs.find(c => c.id === constructId);
        if (construct) {
          this.setFeedback(construct);
        }
      }

      if (params.resultIdx) {
        if (params.resultIdx < this.allResults.length) {
          this.resultIdx = this.allResults.length - params.resultIdx - 1;
          this.checkSurveyCompleted();
          this.updateMES();
          this.updateGSQColors();
        } else {
          this.router.navigate([], {relativeTo: this.route, queryParams: this.getQueryParams()}); // remove invalid queryParams
        }
      }
    });

    const feedback = document.getElementById('feedbackCard');
    feedback.addEventListener('mouseenter', function() {
      this.feedbackHoverTime = new Date();
    }.bind(this));
    feedback.addEventListener('mouseleave', function() {
      const endTime = new Date();
      const timeHovered = endTime.getTime() - this.feedbackHoverTime.getTime();
      if (timeHovered > environment.hover_log_timeout) {
        this.log('FeedbackCard', 'Hover', { length: timeHovered });
      }
      this.feedbackHoverTime = null;
    }.bind(this));
  }

  ngAfterViewInit() {
    if (!this.authService.user.settings.has_seen_thermos_intro) {
      this.videoModal.open(true);
      this.authService.updateSettings({has_seen_thermos_intro: true}).subscribe();
    }

    if (this.showMobileWarning) {
      this.mobileWarningModal.open();
    }
  }

  ngOnDestroy() {
    this.modal.dismissAll('Navigation');
    this.paramSubscription.unsubscribe();
    super.ngOnDestroy();
  }

  setActivity(routeData) {
    this.survey = routeData.survey;
    this.allResults = this.getAllResults(this.survey);
    this.checkSurveyCompleted();

    const tmpModels = {}; // {model_id: construct[]}
    for (const construct of this.survey.constructs) {
      if (!tmpModels[construct.model_id]) {
        tmpModels[construct.model_id] = [];
      }

      tmpModels[construct.model_id].push(construct);
    }

    for (const constructs of (Object.values(tmpModels) as ActivityConstruct[][])) {
      if (constructs.length === 2) {
        this.GSQConstructs = constructs.sort(this.sortConstructs);
      } else {
        this.MESConstructs = constructs.sort(this.sortConstructs);
      }
    }

    if (!this.MESConstructs) {
      this.MESConstructs = [];
    }

    if (!this.GSQConstructs) {
      this.GSQConstructs = [];
    }

    const smallStep = Math.PI / 6;
    const bigStep = Math.PI / 4;
    for (let i = 0; i < this.MESConstructs.length; i++) {
      this.angles.push(i === 3 || i === 4 ? bigStep : smallStep);
    }

    this.updateMES();
    this.MESLabels = this.MESConstructs.map(construct => construct.name);
    this.updateGSQColors();

    this.addNavTab(this.survey, 'surveys');
  }

  checkSurveyCompleted() {
    this.isSurveyCompleted = this.isCompleted(this.survey);

    if (!this.isSurveyCompleted && !this.survey.properties.see_results_before_completion) {
      this.router.navigate(ActivityStatic.routerLinkHelper(this.survey, this.route.snapshot.params.collectionId));
    }
  }

  getScore(construct: ActivityConstruct): number {
    if (this.resultIdx) {
      const resultTimestamp = new Date(this.allResults[this.resultIdx].timestamp);
      const allScores = construct.user_scores?.filter(score => !score.user_id || score.user_id === this.authService.user.id);
      let latestScoreTimestamp = Number.NEGATIVE_INFINITY;
      let latestScore: Score;
      for (const score of allScores) {
        const deltaTime = new Date(score.timestamp).getTime() - resultTimestamp.getTime();
        if (deltaTime < 0 && deltaTime > latestScoreTimestamp) {
          latestScoreTimestamp = deltaTime;
          latestScore = score;
        }
      }

      return latestScore && latestScore.score || 0;
    }

    return construct.my_latest_score?.score || 0;
  }

  updateGSQColors() {
    this.GSQColors = [];
    for (const GSQConstruct of this.GSQConstructs) {
      const isActive = this.feedbackClickedConstruct && GSQConstruct.id === this.feedbackClickedConstruct.id;
      this.GSQColors.push([
        {
          backgroundColor: this.getColorForGSQ(
            isActive,
            false
          ),
          hoverBackgroundColor: this.getColorForGSQ(
            isActive,
            true
          ),
        }
      ]);
    }
    this.redrawGSQ();
  }

  updateMES() {
    this.MESDataset[0].data = this.MESConstructs.map(construct => this.getScore(construct) * 100);
    this.updateMESColors();
    if (sessionStorage.getItem('norms') === 'peer' || sessionStorage.getItem('norms') === 'criterion') {
      let normName = '';
      if (sessionStorage.getItem('norms') === 'peer') {
        this.feedbackNormKey = 'thermos.feedback.score-peer-norm';
        normName = 'Peer reference';
      } else {
        this.feedbackNormKey = 'thermos.feedback.score-criterion-norm';
        normName = 'Criterion reference';
      }
      this.showNorms = true;
      (this.MESOptions as any).tooltips = {
        callbacks: {
          label: (tooltipItem, data) => {
            return [
              `${data.labels[tooltipItem.index]}: ${Number(data.datasets[0].data[tooltipItem.index]).toFixed(0)}% (${normName}: ` +
              `${Number(data.datasets[1].data[tooltipItem.index]).toFixed(0)}%)`];
          }
        }
      };
      this.MESDataset[1] = {
        data: this.MESConstructs.map(construct => construct.properties.norms[0]),
        label: null,
        backgroundColor: this.MESConstructs.map(construct => 'rgba(0,0,0,0)'),
        hoverBackgroundColor: this.MESConstructs.map(construct => 'rgba(0,0,0,0)'),
        borderColor: this.MESConstructs.map(construct => 'rgba(0,0,0,0.75)'),
        hoverBorderColor: this.MESConstructs.map(construct => 'rgba(0,0,0,0.75)')
      };

      this.GSQOptions[0].plugins.line[0] = {
        pos: this.GSQConstructs.map(construct => construct.properties.norms[0])[0],
        size: 0.70,
        style: 'rgba(0,0,0,0.75)'
      };
      this.GSQOptions[1].plugins.line[0] = {
        pos: this.GSQConstructs.map(construct => construct.properties.norms[0])[1],
        size: 0.70,
        style: 'rgba(0,0,0,0.75)',
      };
    }
  }

  updateMESColors() {
    this.MESDataset[0].backgroundColor = this.MESConstructs.map(
      construct => this.getColorForMES(construct, 0.75)
    );
    this.MESDataset[0].borderColor = this.MESConstructs.map(
      construct => this.getColorForMES(construct)
    );
    this.MESDataset[0].hoverBackgroundColor = this.MESConstructs.map(
      construct => this.getColorForMES(construct, 0.88)
    );
    this.MESDataset[0].hoverBorderColor = this.MESConstructs.map(
      construct => this.getColorForMES(construct)
    );
    this.redrawMES();
  }

  setMESHover(index: number): boolean {
    if (this.MESDataset[0].backgroundColor[index] !== this.MESDataset[0].hoverBackgroundColor[index] ||
        this.MESDataset[0].borderColor[index] !== this.MESDataset[0].hoverBorderColor[index]) {
      this.MESDataset[0].backgroundColor[index] = this.MESDataset[0].hoverBackgroundColor[index];
      this.MESDataset[0].borderColor[index] = this.MESDataset[0].hoverBorderColor[index];
      this.redrawMES();
      return true;
    }

    return false;
  }

  unsetMESHover(index: number): boolean {
    if (this.MESDataset[0].backgroundColor[index] === this.MESDataset[0].hoverBackgroundColor[index] &&
        this.MESDataset[0].borderColor[index] === this.MESDataset[0].hoverBorderColor[index]) {
      this.MESDataset[0].backgroundColor = this.MESConstructs.map(
        construct => this.getColorForMES(construct, 0.75)
      );
      this.MESDataset[0].borderColor = this.MESConstructs.map(
        construct => this.getColorForMES(construct)
      );
      this.redrawMES();
      return true;
    }

    return false;
  }

  setGSQHover(index: number): boolean {
    if (this.GSQColors[index][0].backgroundColor !== this.GSQColors[index][0].hoverBackgroundColor) {
      this.GSQColors[index][0].backgroundColor = this.getColorForGSQ(
        this.GSQActiveList[index],
        true
      );
      this.GSQColors[index] = [...this.GSQColors[index]];

      this.redrawGSQ();
      return true;
    }

    return false;
  }

  unsetGSQHover(index: number): boolean {
    if (this.GSQColors[index][0].backgroundColor === this.GSQColors[index][0].hoverBackgroundColor) {
      this.GSQColors[index][0].backgroundColor = this.getColorForGSQ(
        this.GSQActiveList[index],
        false
      );
      this.GSQColors[index] = [...this.GSQColors[index]];

      this.redrawGSQ();
      return true;
    }

    return false;
  }

  getColorForMES(construct, alpha: number = 1): string {
    const isPositive = ConstructStatic.isConstructPositive(construct);
    const isActive = this.feedbackClickedConstruct && this.feedbackClickedConstruct.id === construct.id;
    const colors = isPositive ? [60, 110, 190] : [254, 225, 20];

    if (isActive) {
      alpha = 1;
    }

    return `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, ${alpha})`;
  }

  getColorForGSQ(isActive: boolean, isHovered: boolean): string {
    const colors: number[] = [60, 110, 190];
    let alpha = 0.6;
    if (isActive) {
      alpha = 1;
    } else if (isHovered) {
      alpha = 0.85;
    }

    return `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, ${alpha})`;
  }

  sortConstructs(a, b) {
    return a.id > b.id ? 1 : -1;
  }

  chartClick($event, construct: ActivityConstruct = null) {
    if ($event.active.length > 0) {
      if (!construct) {
        construct = this.MESConstructs[$event.active[0]._index];
      }

      this.setFeedbackId(construct);
    }
  }

  chartHover($event, construct: ActivityConstruct = null) {
    if (this.blockChartHover) {
      return;
    }

    if ($event.points.length > 0) {
      if (!construct) {
        construct = this.MESConstructs[$event.points[0]._index];
      }
      this.currentLogHoverConstruct = construct;
      setTimeout(() => {
        if (this.currentLogHoverConstruct === construct && this.lastLogHoverConstruct !== construct) {
          this.lastLogHoverConstruct = construct;
          this.log('PolarChart', 'Hover', { label: construct.name });
        }
      }, environment.hover_log_timeout);
      this.setFeedback(construct, true);
    } else {
      this.setFeedback(null, true);
      this.currentLogHoverConstruct = null;
    }
  }

  labelClick(construct) {
    this.setFeedbackId(construct);
  }

  labelHover($event, construct: ActivityConstruct, chartType: ChartType = 'MES') {
    if (this.isRedrawn) {
      this.blockChartHover = false;
      this.isRedrawn = false; // ignore the hover after chart redraw to prevent flickering
      return;
    }

    if ($event.hovered) {
      this.blockChartHover = true;
      this.setFeedback(construct, true);
      if (chartType === 'MES') {
        this.isRedrawn = this.setMESHover($event.dataIndex);
      } else {
        this.isRedrawn = this.setGSQHover(this.GSQConstructs.indexOf(construct));
      }
    } else {
      this.blockChartHover = false;
      this.setFeedback(null, true);
      if (chartType === 'MES') {
        this.unsetMESHover($event.dataIndex);
      } else {
        this.unsetGSQHover(this.GSQConstructs.indexOf(construct));
      }
      this.isRedrawn = false;
    }
  }

  setFeedbackId(construct: ActivityConstruct) {
    this.router.navigate([], {
      queryParams: {feedbackId: construct && construct.id},
      relativeTo: this.route,
      queryParamsHandling: 'merge'
    });
  }

  setFeedback(construct: ActivityConstruct, isPreview: boolean = false) {
    const chartType: ChartType = this.GSQConstructs.indexOf(construct) !== -1 ? 'GSQ' : 'MES';

    if (!isPreview) {
      this.feedbackClickedConstruct = construct;

      this.GSQActiveList = this.GSQConstructs.map(() => false);

      if (chartType === 'MES') {
        this.MESActiveDataIndices = [this.MESConstructs.indexOf(construct)];
        this.updateMESColors();
      } else {
        const constructIdx = this.GSQConstructs.indexOf(construct);
        if (constructIdx !== -1) {
          this.GSQActiveList[constructIdx] = true;
        }

        this.updateGSQColors();
      }
    } else {
      this.feedbackPreviewConstruct = construct;
    }

    if (construct) {
      this.setExercises(construct);
    } else if (this.feedbackClickedConstruct) {
      this.setExercises(this.feedbackClickedConstruct);
    }
  }

  setExercises(construct: ActivityConstruct) {
    if (construct.properties.exercises) {
      this.feedbackPrepare = construct.properties.exercises.find(exercise => exercise.survey_type === 'prepare');
      this.feedbackActions = construct.properties.exercises.filter(exercise => exercise.survey_type === 'action');
      this.feedbackActionIds = this.feedbackActions.map(exercise => exercise.id);
      this.feedbackReflect = construct.properties.exercises.find(exercise => exercise.survey_type === 'reflect');
    }
  }

  getQueryParams() {
    if (!this.feedbackClickedConstruct) {
      return {};
    }

    return {feedbackId: this.feedbackClickedConstruct.id};
  }

  getAllResults(survey: Activity): ActivityResult[] {
    if (!survey.my_results || survey.my_results.length === 0) {
      return [];
    }

    const result = survey.my_results.filter(r => ActivityStatic.indexOfCompleted([r]) === 0);

    if (ActivityStatic.indexOfCompleted([survey.my_latest_result]) !== 0) {
      result.unshift(survey.my_latest_result);
    }

    return result;
  }

  log(subject: string, event: string, details: any) {
    this.loggingService.event(subject, event, details);
  }

  clickResult(index: number) {
    const subsession = Number(sessionStorage.getItem(this.subsessionKey));
    sessionStorage.setItem(this.subsessionKey, String(subsession + 1));
    this.log('resultsHistory', 'Change', {resultIdx: this.allResults.length - index - 1});
  }

  redrawMES() {
    this.constructChart?.invalidate();
  }

  redrawGSQ() {
    if (!this.GSQCharts) {
      return;
    }

    for (const chart of this.GSQCharts) {
      chart.invalidate();
    }
  }

}
