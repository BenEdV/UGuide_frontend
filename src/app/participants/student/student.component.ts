import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Participant } from 'src/app/core/interfaces/participant';
import { ToolbarService } from 'src/app/core/services/components/toolbar.service';
import { Activity } from 'src/app/core/interfaces/activity';
import { Construct } from 'src/app/core/interfaces/construct';
import { ActivityStatic } from 'src/app/activity/activity.static';
import { ChartDataSets } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { ConstructStatic } from '../../constructs/construct.static';
import { SearchBarComponent } from 'src/app/shared/components/search-bar/search-bar.component';
import { ExamStatic } from 'src/app/activity/exam.static';
import { Group } from 'src/app/core/interfaces/group';
import { ConstructProgressDataset } from '@shared/charts/construct-progress-chart.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/interfaces/user';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent implements OnInit, OnDestroy {
  student: Participant | User;
  groups: Group[];
  constructs: Construct[];
  exams: Activity[];
  studyMaterial: Activity[];
  dataSubscription;

  averageGrade: number;
  averageConstructScore: number;
  averageMisconstructScore: number;

  studentGroups: Group[];

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
            translateString = 'student.entity.exam_progress.chart.callback.student';
          } else if (tooltipItem.datasetIndex === 1) {
            translateString = 'student.entity.exam_progress.chart.callback.cohort';
          }
          return this.translate.instant(translateString, {
            student_name: this.student.display_name,
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
            translateString = 'student.entity.construct_progress.chart.callback.student';
          } else if (tooltipItem.datasetIndex === 1) {
            translateString = 'student.entity.construct_progress.chart.callback.cohort';
          }
          return this.translate.instant(translateString, {
            student_name: this.student.display_name,
            num_material: tooltipItem.yLabel
          });
        }
      }
    }
  };
  studyMaterialChartOptions = {
    aspectRatio: 1.8,
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => null,
        label: (tooltipItem, data) => {
          let translateString;
          if (tooltipItem.index === 0) {
            translateString = 'student.entity.study_material_progress.chart.callback.unseen';
          } else if (tooltipItem.index === 1) {
            translateString = 'student.entity.study_material_progress.chart.callback.seen';
          } else if (tooltipItem.index === 2) {
            translateString = 'student.entity.study_material_progress.chart.callback.completed';
          }
          return this.translate.instant(translateString, {
            student_name: this.student.display_name,
            num_material: tooltipItem.yLabel
          });
        }
      }
    }
  };

  constructChartLabel: string;
  showConstructChart = false;
  showMisconstructChart = false;
  positiveConstructProgressDatasets: ConstructProgressDataset[];
  negativeConstructProgressDatasets: ConstructProgressDataset[];

  studyMaterialFilter: string;
  studyMaterialValueLambda = ((studyMaterial: Activity) => {
    const parent = studyMaterial.tail_activities[0];
    if (studyMaterial.visible === 'F' || (parent && parent.visible === 'F')) {
      return null;
    }

    if (ActivityStatic.isCompleted(studyMaterial, this.student.id)) {
      return this.translate.instant('student.entity.study_material_progress.chart.completed');
    } else if (ActivityStatic.isInitialized(studyMaterial, this.student.id)) {
      return this.translate.instant('student.entity.study_material_progress.chart.seen');
    } else {
      return this.translate.instant('student.entity.study_material_progress.chart.unseen');
    }
  });
  studyMaterialLabelLambda = ((label: string) => this.prettifyLabel(label));

  constructor(private route: ActivatedRoute,
              private toolbarService: ToolbarService,
              private translate: TranslateService,
              private router: Router,
              private authService: AuthService) { }

  ngOnInit() {
    this.dataSubscription = this.route.data.subscribe(routeData => this.setStudent(routeData));
  }

  getStudentGroups(studentId: number, groups: Group[]): Group[] {
    const result: Group[] = [];
    for (const group of groups) {
      for (const groupStudent of group.students) {
        if (groupStudent.id === studentId) {
          result.push(group);
          break;
        }
      }
    }

    return result;
  }

  setStudent(routeData) {
    this.student = routeData.student;

    if (!this.student) {
      this.student = this.authService.user;
    }

    this.groups = routeData.groups;
    this.studentGroups = this.getStudentGroups(this.student.id, this.groups);
    this.constructs = routeData.constructs;
    this.exams = routeData.activities.examList;
    this.studyMaterial = routeData.activities.studyMaterialList;

    this.averageGrade = ExamStatic.getUsersAverageGrade(this.exams, [this.student.id]) || 0;

    const positiveLeafConstructs = ConstructStatic.getPositiveLeafs(this.constructs);
    if (positiveLeafConstructs.length > 0) {
      this.averageConstructScore = ConstructStatic.getLatestUsersAverage(positiveLeafConstructs, [this.student.id]) || 0;
    }

    const negativeLeafConstructs = ConstructStatic.getNegativeLeafs(this.constructs);
    if (negativeLeafConstructs.length > 0) {
      this.averageConstructScore = ConstructStatic.getLatestUsersAverage(positiveLeafConstructs, [this.student.id]) || 0;
    }

    this.createExamProgressChart();
    this.createConstructScoreChart();
    this.createConstructProgressChart();

    this.toolbarService.addTab(
      {
        name: this.student.display_name,
        link: ['collections', routeData.collection.id, 'students', this.student.id]
      },
      routeData.collection
    );
  }

  createExamProgressChart() {
    let averageTitle: string = this.translate.instant('student.entity.average_grade');
    averageTitle = averageTitle[0].toUpperCase() + averageTitle.slice(1, averageTitle.length);

    this.examChartDatasets = [
      {
        label: this.student.display_name,
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

      const studentGrade = ExamStatic.getUserGrade(exam, this.student.id);
      this.examChartDatasets[0].data.push(studentGrade);

      const average = exam.properties.average;
      this.examChartDatasets[1].data.push(average && average.toFixed(2));
    }
  }

  createConstructScoreChart() {
    this.constructChartLabel = this.student.display_name;
    this.showConstructChart = this.constructs.find(c => ConstructStatic.isConstructPositive(c)) !== undefined;
    this.showMisconstructChart = this.constructs.find(c => ConstructStatic.isConstructNegative(c)) !== undefined;

    if (!this.showConstructChart && !this.showMisconstructChart) {
      this.showConstructChart = true; // show at least one chart to display the warning that a chart cannot be shown
    }
  }

  createConstructProgressChart() {
    const positiveLeafConstructs = ConstructStatic.getPositiveLeafs(this.constructs);
    const positiveLeafConstructIds = positiveLeafConstructs.map(construct => construct.id);
    const positiveAverageScores = [];
    positiveLeafConstructs.forEach(construct => construct.average_scores && positiveAverageScores.push(...construct.average_scores));
    const positivesUserScores = ConstructStatic.getUsersScores(positiveLeafConstructs, [this.student.id]);

    this.positiveConstructProgressDatasets = [
      {
        scores: positivesUserScores,
        construct_ids: positiveLeafConstructIds,
        label: this.translate.instant('student.entity.construct_progress.construct_average'),
        colorIdx: 0
      },
      {
        scores: positiveAverageScores,
        construct_ids: positiveLeafConstructIds,
        label: this.translate.instant('student.entity.construct_progress.cohort_average'),
        colorIdx: 1
      }
    ];

    const negativeLeafConstructs = ConstructStatic.getNegativeLeafs(this.constructs);
    const negativeLeafConstructIds = negativeLeafConstructs.map(construct => construct.id);
    const negativeAverageScores = [];
    negativeLeafConstructs.forEach(construct => construct.average_scores && negativeAverageScores.push(...construct.average_scores));
    const negativeUserScores = ConstructStatic.getUsersScores(negativeLeafConstructs, [this.student.id]);

    this.negativeConstructProgressDatasets = [
      {
        scores: negativeUserScores,
        construct_ids: negativeLeafConstructIds,
        label: this.translate.instant('student.entity.misconstruct_progress.misconstruct_average'),
        colorIdx: 0
      },
      {
        scores: negativeAverageScores,
        construct_ids: negativeLeafConstructIds,
        label: this.translate.instant('student.entity.misconstruct_progress.cohort_average'),
        colorIdx: 1
      }
    ];
  }

  prettifyLabel(label: string): string {
    const translatedLabel = this.translate.instant(label) as string;
    return translatedLabel[0].toUpperCase() + translatedLabel.slice(1, translatedLabel.length);
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

  handleStudyMaterialChartClick($event) {
    if ($event.label) {
      this.studyMaterialFilter = SearchBarComponent.makeFilterAbsolute($event.label);
    }
  }

  ngOnDestroy() {
    this.dataSubscription.unsubscribe();
  }

}
