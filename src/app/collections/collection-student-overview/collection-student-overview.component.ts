import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ChartDataSets } from 'chart.js';
import { ActivityStatic } from 'src/app/activity/activity.static';
import { ExamStatic } from 'src/app/activity/exam.static';
import { ConstructStatic } from 'src/app/constructs/construct.static';
import { Activity } from 'src/app/core/interfaces/activity';
import { Collection } from 'src/app/core/interfaces/collection';
import { Construct } from 'src/app/core/interfaces/construct';

@Component({
  selector: 'app-collection-student-overview',
  templateUrl: './collection-student-overview.component.html',
  styleUrls: ['./collection-student-overview.component.scss']
})
export class CollectionStudentOverviewComponent implements OnInit {
  collection: Collection;
  constructs: Construct[];
  exams: Activity[];
  studyMaterial: Activity[];

  averageGrade: number;
  averageConstructScore: number;
  averageMisconstructScore: number;
  studyMaterialSeenPercentage: number;
  studyMaterialCompletedPercentage: number;

  showConstructs = false;
  showMisconstructs = false;

  sortedExams: Activity[];
  examProgressDatasets: ChartDataSets[];
  examProgressLabels: string[];

  studyMaterialFilter: string;
  studyMaterialChartDatasets: ChartDataSets[];
  studyMaterialChartOptions = {
    aspectRatio: 1.4
  };

  constructScoreThreshold: number;
  misconstructScoreThreshold: number;
  recommendedConstructs: Construct[];
  recommendedMisconstructs: Construct[];

  constructor(private route: ActivatedRoute, private router: Router, private translate: TranslateService) { }

  ngOnInit(): void {
    this.collection = this.route.snapshot.data.collection;
    this.constructs = this.route.snapshot.data.constructs;
    this.exams = this.route.snapshot.data.activities.examList;
    this.studyMaterial = this.route.snapshot.data.activities.studyMaterialList;

    const positiveLeafConstructs = ConstructStatic.getPositiveLeafs(this.constructs);
    const negativeLeafConstructs = ConstructStatic.getNegativeLeafs(this.constructs);

    this.showConstructs = positiveLeafConstructs.length > 0;
    this.showMisconstructs = negativeLeafConstructs.length > 0;

    this.averageConstructScore = ConstructStatic.getLatestUsersAverage(positiveLeafConstructs, [null]);
    this.averageMisconstructScore = ConstructStatic.getLatestUsersAverage(negativeLeafConstructs, [null]);

    this.averageGrade = ExamStatic.getUsersAverageGrade(this.exams, [null]); // use null to get own latest results

    this.createExamProgressChart(this.exams);
    this.createStudyMaterialStatusChart(this.studyMaterial);
    this.createRecommendations(this.constructs);
  }

  createExamProgressChart(exams: Activity[]) {
    this.examProgressDatasets = [{
      data: [],
      label: this.translate.instant('course.student_overview.exams.chart.my_grade')
    }, {
      data: [],
      label: this.translate.instant('course.student_overview.exams.chart.average_grade')
    }];
    this.examProgressLabels = [];
    this.sortedExams = exams.sort((a, b) => a.end_time.localeCompare(b.end_time));
    for (const exam of this.sortedExams) {
      this.examProgressDatasets[0].data.push(ExamStatic.getUserGrade(exam));
      this.examProgressDatasets[1].data.push(exam.properties.average);
      this.examProgressLabels.push(exam.title);
    }
  }

  createStudyMaterialStatusChart(studyMaterial: Activity[]) {
    let unseenCount = 0;
    let seenCount = 0;
    let completedCount = 0;
    for (const material of studyMaterial) {
      if (ActivityStatic.isCompleted(material)) {
        completedCount++;
      } else if (ActivityStatic.isInitialized(material)) {
        seenCount++;
      } else {
        unseenCount++;
      }
    }

    this.studyMaterialChartDatasets = [{
      data: [unseenCount, seenCount, completedCount]
    }];

    this.studyMaterialSeenPercentage = seenCount / studyMaterial.length;
    this.studyMaterialCompletedPercentage = completedCount / studyMaterial.length;
  }

  createRecommendations(constructs: Construct[]) {
    // TODO: Remove hardcoded way of setting threshold, should always be in colleciton settings or be uniform accross the system
    this.constructScoreThreshold = this.collection.settings?.positiveHardConstructThreshold || 0.5;
    this.misconstructScoreThreshold = this.collection.settings?.negativeHardConstructThreshold || 0.3;

    this.recommendedConstructs = [];
    this.recommendedMisconstructs = [];
    for (const construct of constructs) {
      if (ConstructStatic.isConstructPositive(construct) && construct.my_latest_score?.score < this.constructScoreThreshold) {
        this.recommendedConstructs.push(construct);
      } else if (ConstructStatic.isConstructNegative(construct) && construct.my_latest_score?.score > this.misconstructScoreThreshold) {
        this.recommendedMisconstructs.push(construct);
      }
    }
  }

  handleConstructChartClick($event) {
    if ($event.construct) {
      this.router.navigate(ConstructStatic.routerLinkHelper($event.construct, this.collection.id));
    }
  }

  handleExamProgressChartClick($event) {
    if ($event.active.length > 0) {
      const index: number = $event.active[0]._index;
      this.router.navigate(ActivityStatic.routerLinkHelper(this.sortedExams[index], this.collection.id));
    }
  }

  handleStudyMaterialChartClick($event) {
    if ($event.active.length > 0) {
      const index: number = $event.active[0]._index;
      let filter;
      if (index === 0) {
        filter = 'unseen';
      } else if (index === 1) {
        filter = 'seen';
      } else if (index === 2) {
        filter = 'completed';
      }
      this.studyMaterialFilter = `\"${filter}\"`;
    }
  }

  goToConstruct(construct: Construct) {
    this.router.navigate(ConstructStatic.routerLinkHelper(construct, this.collection.id));
  }

}
