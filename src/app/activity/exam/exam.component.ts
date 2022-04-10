import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { ActivityComponent } from '../activity/activity.component';
import { Activity, SimpleActivity } from '../../core/interfaces/activity';
import { ActivityService } from '../../core/services/collection/activity.service';
import * as moment from 'moment';
import { ToolbarService } from 'src/app/core/services/components/toolbar.service';
import { ChartDataSets } from 'chart.js';
import { HeatmapPoint } from '@shared/charts/heatmap-chart.component';
import { TranslateService } from '@ngx-translate/core';
import { GradePipe } from '@shared/pipes/grade.pipe';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { pathPlugin } from '../../shared/charts/chart-plugins';
import { ActivityStatic } from '../activity.static';
import { ExamStatic } from '../exam.static';
import { SharedStatic } from '@shared/shared.static';

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.scss']
})
export class ExamComponent extends ActivityComponent implements OnInit {
  @ViewChild('gradeChart', {static: false}) gradeChart;
  @ViewChild('examDurationChart', {static: false}) examDurationChart;
  @ViewChild('questionPValueChart', {static: false}) questionPValueChart;
  @ViewChild('questionRirValueChart', {static: false}) questionRirValueChart;
  @ViewChild('questionDurationChart', {static: false}) questionDurationChart;
  @ViewChild('answerDistChart', {static: false}) answerDistChart;

  exam: Activity;
  questions: (SimpleActivity & Activity)[];

  lowQuestions: (SimpleActivity & Activity)[];
  highQuestions: (SimpleActivity & Activity)[];

  myGrade: number;
  minGrade: number;
  maxGrade: number;
  grades: any[];
  gradeAveragePath = {
    scales: ['x-axis-1', 'y-axis-1'],
    points: [],
    size: 2.0,
    hidden: false,
    style: 'rgba(0,0,0,0.75)'
  };
  examDurationOptions = {
    aspectRatio: 1,
    tooltips: {
      callbacks: {
        label: (tooltipItem, data) => {
          const dataItem = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          return this.translate.instant('exam.entity.exam_duration.chart.callback', {
            student: dataItem.user,
            grade: dataItem.x,
            duration: this.durationPipe.transform(moment.duration(dataItem.y, 'seconds').toISOString())
          });
        }
      }
    }
  };
  pValueOptions = {
    aspectRatio: 1.4,
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => null,
        label: (tooltipItem, data) => {
          return this.translate.instant('exam.entity.question_values.p_value_chart.callback', {
            value: tooltipItem.yLabel.toFixed(0),
            question: this.questionTitles[tooltipItem.index]
          });
        }
      }
    }
  };
  rirValueOptions = {
    aspectRatio: 1.4,
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => null,
        label: (tooltipItem, data) => {
          return this.translate.instant('exam.entity.question_values.rir_value_chart.callback', {
            value: tooltipItem.yLabel,
            question: this.questionTitles[tooltipItem.index]
          });
        }
      }
    }
  };
  questionDurationOptions = {
    aspectRatio: 1.4,
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => null,
        label: (tooltipItem, data) => {
          return this.translate.instant('exam.entity.question_values.duration_chart.callback', {
            duration: this.durationPipe.transform(moment.duration(tooltipItem.yLabel, 'seconds').toISOString()),
            question: this.questionTitles[tooltipItem.index]
          });
        }
      }
    }
  };
  answerDistOptions = {
    aspectRatio: 1.4,
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => null,
        label: (tooltipItem, data) => {
          const dataItem = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          return this.translate.instant('exam.entity.answer_distribution.chart.callback', {
            percent: (dataItem.v * 100).toFixed(0),
            question: this.questionTitles[dataItem.x - 1],
            answer: this.answerDistChart.getYLabel(dataItem.y)
          });
        }
      }
    }
  };

  questionScoresDataset: ChartDataSets[];
  questionLabels: string[];
  questionTitles: string[];
  questionRirs: any;
  questionAvgTimes: ChartDataSets[];
  amountPassed: number;
  correlation: any;
  answerDistItems: HeatmapPoint[];
  answerDistNotGivenIndices: number[] = [];
  answerDistPopularWrongIndices: number[] = [];
  examDurationDataset: ChartDataSets[];
  pathPlugin = pathPlugin;

  constructor(private route: ActivatedRoute,
              private router: Router,
              toolbarService: ToolbarService,
              private gradePipe: GradePipe,
              private durationPipe: DurationPipe,
              private translate: TranslateService,
              private activityService: ActivityService) {
    super(route, toolbarService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  setActivity(routeData): void {
    this.exam = routeData.exam;
    this.questions = ExamStatic.getQuestions(this.exam) as (SimpleActivity & Activity)[];
    this.addNavTab(this.exam, 'exams');

    this.myGrade = ExamStatic.getUserGrade(this.exam);
    this.amountPassed = ActivityStatic.amountSuccess(this.exam);

    this.setupGradeDist();
    this.setupExamDuration();
    this.setupQuestions();
    this.setupAnswerDistribution();
  }

  setupGradeDist(): void {
    const gradesFromResults = ExamStatic.getAllGrades(this.exam);
    this.grades = gradesFromResults.map(grade => ({score: grade, name: ''}));
    this.amountPassed = ActivityStatic.amountSuccess(this.exam);

    const minGrade = Math.min(...gradesFromResults);
    const maxGrade = Math.max(...gradesFromResults);
    this.gradeAveragePath.points = [[this.exam.properties.average, 0], [this.exam.properties.average, 100]];

    const gradeText: HTMLElement = document.getElementById('gradeText');
    gradeText.innerHTML = this.translate.instant('exam.entity.score_distribution.text');

    SharedStatic.setInjectedElement(gradeText.querySelector('.min_grade'), {
      innerHTML: `<u>${this.gradePipe.transform(minGrade)}</u>`,
      bind: this,
      mouseenter: this.highlightGradeDistChart,
      mouseleave: this.unhighlightGradeDistChart,
      classes: [this.colorForGrade(minGrade)]
    });

    SharedStatic.setInjectedElement(gradeText.querySelector('.max_grade'), {
      innerHTML: `<u>${this.gradePipe.transform(maxGrade)}</u>`,
      bind: this,
      mouseenter: this.highlightGradeDistChart,
      mouseleave: this.unhighlightGradeDistChart,
      classes: [this.colorForGrade(maxGrade)]
    });

    SharedStatic.setInjectedElement(gradeText.querySelector('.avg_grade'), {
      innerHTML: this.gradePipe.transform(this.exam.properties.average),
      bind: this,
      mouseenter: this.showAvgGradePath,
      mouseleave: this.hideAvgGradePath,
      classes: [this.colorForGrade(this.exam.properties.average)]
    });

    SharedStatic.setInjectedElement(gradeText.querySelector('.std_dev'), {
      innerHTML: this.gradePipe.transform(this.exam.properties.std_dev)
    });
  }

  setupExamDuration(): void {
    this.examDurationDataset = this.createExamDurationChart(this.exam);

    const examDuration: HTMLElement = document.getElementById('examDurationText');
    examDuration.innerHTML = this.translate.instant('exam.entity.exam_duration.text');

    SharedStatic.setInjectedElement(examDuration.querySelector('.outliers'), {
      innerHTML: `<u>${this.examDurationDataset[1].data.length}</u>`,
      bind: this,
      mouseenter: this.showOutliers,
      mouseleave: this.hideOutliers
    });

    SharedStatic.setInjectedElement(examDuration.querySelector('.avg_duration'), {
      innerHTML: this.durationPipe.transform(this.exam.properties.avg_duration)
    });

    SharedStatic.setInjectedElement(examDuration.querySelector('.avg_duration_passed'), {
      innerHTML: this.durationPipe.transform(this.exam.properties.avg_duration_passed)
    });
  }

  setupQuestions(): void {
    this.questionScoresDataset = [{
      data: this.questions.map(question => +(ActivityStatic.amountSuccess(question) * 100).toFixed(2))
    }];
    this.questionLabels = this.questions.map(question => '' + question.relation_properties.number);
    this.questionTitles = this.questions.map(question => '' + question.title);
    this.questionAvgTimes = this.createQuestionDurationChart(this.questions);

    // Question rir
    const questionIds = this.questions.map(question => question.id);
    this.questionRirs = this.activityService.getRir(questionIds).pipe(map(results => {
      const res = [{
        data: []
      }];
      for (const rir of Object.values(results)) {
        const value = rir ? rir.toFixed(2) : null;
        res[0].data.push(value);
      }
      return res;
    }));

    // HTML
    const examDuration: HTMLElement = document.getElementById('questionsText');
    const lowQuestions = this.questions.filter(question => ActivityStatic.amountSuccess(question) < 0.2);
    const highQuestions = this.questions.filter(question => ActivityStatic.amountSuccess(question) > 0.8);

    const translateBase = 'exam.entity.question_values.text';
    if (lowQuestions.length > 0 && highQuestions.length > 0) {
      examDuration.innerHTML = this.translate.instant(`${translateBase}.high_low`);
    } else if (lowQuestions.length > 1) {
      examDuration.innerHTML = this.translate.instant(`${translateBase}.low_mult`);
    } else if (lowQuestions.length > 0) {
      examDuration.innerHTML = this.translate.instant(`${translateBase}.low_sing`);
    } else if (highQuestions.length > 1) {
      examDuration.innerHTML = this.translate.instant(`${translateBase}.high_mult`);
    } else if (highQuestions.length > 0) {
      examDuration.innerHTML = this.translate.instant(`${translateBase}.high_sing`);
    } else {
      examDuration.innerHTML = this.translate.instant(`${translateBase}.none`);
    }

    const highQuestionsElement: HTMLElement = examDuration.querySelector('.high_questions');

    for (let i = 0; i < highQuestions.length; i++) {
      const highQuestionElement = SharedStatic.setInjectedElement(document.createElement('a'), {
        innerHTML: highQuestions[i].title,
        bind: this,
        mouseenter: this.highlightQuestion,
        properties: {number: highQuestions[i].relation_properties.number}
      });

      highQuestionsElement.appendChild(highQuestionElement);
      if (i < highQuestions.length - 1) {
        const comma = document.createTextNode(', ');
        highQuestionsElement.appendChild(comma);
      }
    }

    const lowQuestionsElement: HTMLElement = examDuration.querySelector('.low_questions');

    for (let i = 0; i < lowQuestions.length; i++) {
      const lowQuestionElement = SharedStatic.setInjectedElement(document.createElement('a'), {
        innerHTML: lowQuestions[i].title,
        bind: this,
        mouseenter: this.highlightQuestion,
        properties: {number: lowQuestions[i].relation_properties.number}
      });

      lowQuestionsElement.appendChild(lowQuestionElement);
      if (i < lowQuestions.length - 1) {
        const comma = document.createTextNode(', ');
        lowQuestionsElement.appendChild(comma);
      }
    }
  }

  setupAnswerDistribution(): void {
    this.answerDistItems = this.getAnswerDistributionHeatmapPoints(this.questions);

    for (let i = 0; i < this.answerDistItems.length; i++) {
      if (this.answerDistItems[i].v === 0) {
        this.answerDistNotGivenIndices.push(i);
      }
      if (this.answerDistItems[i].v > 0.2 && this.answerDistItems[i].color === 'rgba(255,0,0,1)') {
        this.answerDistPopularWrongIndices.push(i);
      }
    }

    const answerDist: HTMLElement = document.getElementById('answerDistText');
    if (this.answerDistNotGivenIndices.length === 1) {
      answerDist.innerHTML = this.translate.instant('exam.entity.answer_distribution.text.not_given_sing');
    } else {
      answerDist.innerHTML = this.translate.instant('exam.entity.answer_distribution.text.not_given_mult');
    }

    if (this.answerDistPopularWrongIndices.length === 1) {
      answerDist.innerHTML =
        answerDist.innerHTML.concat(' ' + this.translate.instant('exam.entity.answer_distribution.text.pop_wrong_sing'));
    } else {
      answerDist.innerHTML =
        answerDist.innerHTML.concat(' ' + this.translate.instant('exam.entity.answer_distribution.text.pop_wrong_mult'));
    }

    SharedStatic.setInjectedElement(answerDist.querySelector('.num_not_given'), {
      innerHTML: `<u>${this.answerDistNotGivenIndices.length}</u>`,
      bind: this,
      mouseenter: (e) => this.showNotGivenAnswers(e),
      mouseleave: (e) => this.hideAnswerDistHighlights(e)
    });

    SharedStatic.setInjectedElement(answerDist.querySelector('.num_pop_wrong'), {
      innerHTML: `<u>${this.answerDistPopularWrongIndices.length}</u>`,
      bind: this,
      mouseenter: (e) => this.showPopularWrongAnswers(e),
      mouseleave: (e) => this.hideAnswerDistHighlights(e)
    });
  }


  highlightQuestion($event): void {
    this.questionPValueChart.simulateHover(0, $event.target.number - 1);
    this.questionRirValueChart.simulateHover(0, $event.target.number - 1);
    this.questionDurationChart.simulateHover(0, $event.target.number - 1);
  }

  highlightGradeDistChart($event): void {
    this.gradeChart.highlightItem(+$event.target.innerText);
  }

  unhighlightGradeDistChart($event): void {
    this.gradeChart.unhighlightItem(+$event.target.innerText);
  }

  showAvgGradePath($event): void {
    // this.gradeAveragePath.hidden = false;
    // this.gradeChart.chartOptions = {...this.gradeChartOptions};
    // this.gradeChart.chartOptions.plugins.path[0] = {...this.gradeAveragePath};
    // this.gradeChart.options = {...this.gradeChartOptions};
    // this.gradeChart.mergedOptions = {...this.gradeChartOptions};
    // this.gradeChart.chart.update();
    // console.log(this.gradeChart.chart)
    // this.pathPlugin.hook.calls.reset();
  }

  hideAvgGradePath($event): void {
    // this.gradeAveragePath.hidden = true;
    // this.gradeChart.chartOptions = {...this.gradeChartOptions};
    // this.gradeChart.chartOptions.plugins.path[0] = {...this.gradeAveragePath};
    // this.gradeChart.datasets[0] = {...this.gradeChart.datasets[0]};
    // this.gradeChart.chart.update();
    // console.log(this.gradeChart.chart)
  }

  showOutliers($event): void {
    if (this.examDurationDataset[1]) {
      this.examDurationDataset[1].hidden = false;
      this.examDurationChart.chart.update();
    }
  }

  hideOutliers($event): void {
    if (this.examDurationDataset[1]) {
      this.examDurationDataset[1].hidden = true;
      this.examDurationChart.chart.update();
    }
  }

  showNotGivenAnswers($event): void {
    this.answerDistChart.highlightIndices = this.answerDistNotGivenIndices;
    this.answerDistChart.chart.update();
  }

  showPopularWrongAnswers($event): void {
    this.answerDistChart.highlightIndices = this.answerDistPopularWrongIndices;
    this.answerDistChart.chart.update();
  }

  hideAnswerDistHighlights($event): void {
    this.answerDistChart.highlightIndices = [];
    this.answerDistChart.chart.update();
  }

  getAnswerDistributionHeatmapPoints(questions: Activity[]): HeatmapPoint[] {
    let x = 0;
    let y = 0;
    const distribution = [];
    for (const question of questions) {
      x += 1;
      y = 0;
      for (const answer of question.properties.answers) {
        y += 1;
        const color = answer.correct ? 'rgba(0,255,0,1)' : 'rgba(255,0,0,1)';
        distribution.push({x, y, v: +(answer.count / question.latest_results.length).toFixed(2), color});
      }
    }
    return distribution;
  }

  createExamDurationChart(exam: Activity): ChartDataSets[] {
    const dataset = [{
      data: []
    }, {
      data: [],
      hidden: true
    }];

    const avg = moment.duration(exam.properties.avg_duration).as('seconds');
    const std = moment.duration(exam.properties.std_dev_duration).as('seconds');

    for (const result of exam.latest_results) {
      const durationSeconds = moment.duration(result.result.duration).as('seconds');
      const grade = ExamStatic.getGradeFromResult(result);

      if (durationSeconds < avg + 2 * std && durationSeconds > avg - 2 * std) {
        dataset[0].data.push({y: durationSeconds, x: grade, user: result.user_id});
      } else {
        dataset[1].data.push({y: durationSeconds, x: grade, user: result.user_id});
      }
    }

    return dataset;
  }

  createQuestionDurationChart(questions: Activity[]): ChartDataSets[] {
    const dataset = [{
      data: []
    }];
    for (const question of questions) {
      const durationSeconds = moment.duration(question.properties.avg_duration).as('seconds');
      dataset[0].data.push(durationSeconds);
    }
    return dataset;
  }

  questionChartClick($event) {
    if ($event.active.length > 0) {
      const questionIndex = $event.active[0]._index;

      this.router.navigate(
        ActivityStatic.routerLinkHelper(this.questions[questionIndex], this.route.snapshot.params.collectionId)
      );
    }
  }

  answerDistributionChartClick($event) {
    if ($event.value) {
      const question = this.questions[$event.value.x - 1];
      this.router.navigate(
        ActivityStatic.routerLinkHelper(question, this.route.snapshot.params.collectionId)
      );
    }
  }

  colorForGrade(grade: number): string {
    if (grade >= 0 && grade < 4) {
      return 'grade-red';
    }
    if (grade >= 4 && grade < 6) {
      return 'grade-yellow';
    }
    if (grade >= 6 && grade < 8) {
      return 'grade-green';
    }
    if (grade >= 8 && grade <= 10) {
      return 'grade-cyan';
    }
    return '';
  }
}
