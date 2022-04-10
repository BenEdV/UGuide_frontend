import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityComponent } from '../activity/activity.component';
import { Activity } from '../../core/interfaces/activity';
import { ToolbarService } from 'src/app/core/services/components/toolbar.service';
import { ExamStatic } from '../exam.static';
import { StudentSetParams } from 'src/app/participants/student-set/student-set.component';
import { ActivityStatic } from '../activity.static';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-question',
  templateUrl: './exam-question.component.html',
  styleUrls: ['./exam-question.component.scss']
})
export class ExamQuestionComponent extends ActivityComponent implements OnInit {
  question: Activity;
  sortedQuestions: Activity[];
  nextQuestion: Activity;
  prevQuestion: Activity;

  answerDist: any;
  answerLabels: string[];
  givenAnswers: string[];
  nonNullResults: any;
  nonNullResultsCount: any;
  percentCorrect = 0;
  averageTimeFormatted: string;
  popularWrongAnswers: string[];

  answerMSOptions = {
    aspectRatio: 1.4,
    tooltips: {
      filter: (tooltipItem, data) => {
        const dataItem = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
        return dataItem.v !== 0;
      },
      callbacks: {
        title: (tooltipItem, data) => null,
        label: (tooltipItem, data) => {
          const dataItem = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          return this.translate.instant('question.entity.answer_distribution_ms.chart.callback', {
            percent: (dataItem.v * 100).toFixed(0),
            response: this.answerLabels[dataItem.x - 1]
          });
        }
      }
    }
  };
  answerOptions = {
    aspectRatio: 1.4,
    scales: {
      yAxes: [{
        scaleLabel: {display: true, labelString: this.translate.instant('question.entity.answer_distribution.chart.y_label')},
        ticks: {precision: 0}
      }],
    },
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => null,
        label: (tooltipItem, data) => {
          return this.translate.instant('question.entity.answer_distribution.chart.callback', {
            num_students: tooltipItem.yLabel,
            answer: tooltipItem.xLabel
          });
        }
      }
    }
  };
  exam: Activity;
  examLink: (string | number)[];

  constructKeys: string[];
  constructValueOverrides = {
    answer: (construct => construct.relation_properties &&
                          construct.relation_properties.value_pairs &&
                          Object.keys(construct.relation_properties.value_pairs))
  };

  getQuestionNumber = ExamQuestionComponent.getQuestionNumber;
  getQuestions = ExamStatic.getQuestions;

  static getExam(question: Activity) {
    return question && question.tail_activities && question.tail_activities[0];
  }

  static getQuestionNumber(question: Activity) {
    const exam = ExamQuestionComponent.getExam(question);
    return exam && exam.relation_properties && exam.relation_properties.number;
  }

  constructor(
              private route: ActivatedRoute,
              toolbarService: ToolbarService,
              private translate: TranslateService,
              private router: Router) {
    super(route, toolbarService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  setActivity(routeData) {
    this.question = routeData.question;
    this.givenAnswers = this.question.my_latest_result?.result.response.split(',') || [];
    this.exam = routeData.exam;
    this.examLink = ActivityStatic.routerLinkHelper(this.exam, routeData.collection.id);

    if (this.question.type === 'question.open') {
      this.constructKeys = ['name', 'score', 'average_score'];
    } else {
      this.constructKeys = ['answer', 'name', 'score', 'average_score'];
    }

    this.nonNullResultsCount = [];
    this.nonNullResults = this.question.latest_results.filter(result => result.result.response !== '').sort((r1, r2) => {
      if (r1.result.success && !r2.result.success) {
        return -1;
      }
      if (!r1.result.success && r2.result.success) {
        return 1;
      }
      if (r1.result.response < r2.result.response) {
        return -1;
      }
      if (r1.result.response > r2.result.response) {
        return 1;
      }
      return 0;
    });

    // This expects nonNullResults to be sorted
    for (const result of this.nonNullResults) {
      if (this.nonNullResultsCount.length === 0) {
        const tuple = {
          result,
          count: 1
        };
        this.nonNullResultsCount.push(tuple);
        continue;
      }
      if (result.result.response === this.nonNullResultsCount[this.nonNullResultsCount.length - 1].result.result.response) {
        this.nonNullResultsCount[this.nonNullResultsCount.length - 1].count += 1;
      } else {
        const tuple = {
          result,
          count: 1
        };
        this.nonNullResultsCount.push(tuple);
      }
    }

    this.sortedQuestions = ExamStatic.getQuestions(this.exam)
                              .map(question => ({...question})) // copy to not edit the original list
                              .sort(question => ExamQuestionComponent.getQuestionNumber(question));

    const currentIndex = this.sortedQuestions.map(question => question.id).indexOf(this.question.id);
    this.prevQuestion = this.sortedQuestions[currentIndex - 1];
    this.nextQuestion = this.sortedQuestions[currentIndex + 1];

    this.answerDist = [];
    this.answerLabels = [];
    if (this.question.type === 'question.multiple_selection') {
      this.createAnswerHeatmap();
    } else if (this.question.type === 'question.multiple_choice') {
      this.createAnswerHistogram();
    }

    this.popularWrongAnswers = [];
    if (this.question.type === 'question.multiple_selection' || this.question.type === 'question.multiple_choice') {
      this.popularWrongAnswers = this.getPopularWrongAnswers();
    }

    this.percentCorrect = ActivityStatic.amountSuccess(this.question);

    this.addNavTab(this.exam, 'exams');
  }

  getPopularWrongAnswers(): string[] {
    if (!this.question.latest_results || this.question.latest_results.length === 0) {
      return [];
    }

    const result = [];
    for (const answer of this.question.properties.answers) {
      if (!answer.correct && answer.count / this.question.latest_results.length > 0.25) {
        result.push(answer.id);
      }
    }
    return result;
  }

  createAnswerHistogram() {
    this.answerDist.push({data: [], backgroundColor: [], borderColor: [], hoverBackgroundColor: [], hoverBorderColor: []});
    for (const answer of this.question.properties.answers) {
      this.answerLabels.push(answer.id);
      this.answerDist[0].data.push(answer.count);
      if (answer.correct) {
        this.answerDist[0].backgroundColor.push('rgba(160, 210, 90, 0.6)');
        this.answerDist[0].borderColor.push('rgba(160, 210, 90, 0.6)');
        this.answerDist[0].hoverBackgroundColor.push('rgba(160, 210, 90, 0.7)');
        this.answerDist[0].hoverBorderColor.push('rgba(160, 210, 90, 0.7)');
      } else {
        this.answerDist[0].backgroundColor.push('rgba(55, 126, 184, 0.6)');
        this.answerDist[0].borderColor.push('rgba(55, 126, 184, 0.6)');
        this.answerDist[0].hoverBackgroundColor.push('rgba(55, 126, 184, 0.7)');
        this.answerDist[0].hoverBorderColor.push('rgba(55, 126, 184, 0.7)');
      }
    }
  }

  createAnswerHeatmap() {
    let x = 0;
    let y = 0;
    const resultCount: Record<string, number> = {};
    for (const result of this.question.latest_results) {
      if (!resultCount[result.result.response]) {
        this.answerLabels.push(result.result.response);
        resultCount[result.result.response] = 0;
      }
      resultCount[result.result.response] += 1;
    }

    const resultCountSorted = Object.entries(resultCount).sort((a, b) => b[1] - a[1]);

    for (const [response, count] of resultCountSorted) {
      x += 1;
      y = 0;
      for (const answer of this.question.properties.answers) {
        y += 1;
        const color = answer.correct ? 'rgba(0,255,0,1)' : 'rgba(255,0,0,1)';
        const v = response.includes(answer.id) ? (count / this.question.latest_results.length).toFixed(2) : 0;
        this.answerDist.push({x, y, v, color});
      }
    }
  }

  goToNextQuestion() {
    if (this.nextQuestion) {
      this.router.navigate(ActivityStatic.routerLinkHelper(this.nextQuestion, this.route.snapshot.params.collectionId));
    }
  }

  goToPreviousQuestion() {
    if (this.prevQuestion) {
      this.router.navigate(ActivityStatic.routerLinkHelper(this.prevQuestion, this.route.snapshot.params.collectionId));
    }
  }

  answerGivenAndCorrect(question: Activity): boolean {
    return question.my_latest_result?.result?.success || false;
  }

  gotoQuestion($event) {
    this.router.navigate(['..', this.sortedQuestions[$event - 1].id], {relativeTo: this.route});
  }

  handleAnswerDistributionChartClick($event) {
    if ($event.active.length === 0) {
      return;
    }
    const answer: string = $event.label;
    const studentIds: number[] = [];
    for (const result of this.question.latest_results) {
      if (result.result.response === answer) {
        studentIds.push(result.user_id);
      }
    }

    const setParams: StudentSetParams = {
      title: 'question_answer_distribution',
      titleExtras: [answer, this.question.title],
      studentIds
    };
    this.router.navigate(['/', 'collections', this.route.snapshot.data.collection.id, 'students', 'set'], {queryParams: setParams});
  }

}
