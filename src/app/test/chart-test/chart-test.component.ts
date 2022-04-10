import { Component, OnInit } from '@angular/core';
import { ChartSubject } from '../../core/interfaces/chart-subject';
import { ChartType } from 'chart.js';
import { Construct } from '../../core/interfaces/construct';
import { ActivityService } from '../../core/services/collection/activity.service';
import { ActivatedRoute } from '@angular/router';
import { CollectionService } from '../../core/services/collection/collection.service';
import { LoggingService } from '../../core/services/logging.service';
import { TranslateService } from '@ngx-translate/core';

interface ChartHistory {
  parentId: number;
  chartType: ChartType;
}

@Component({
  selector: 'app-chart-test',
  templateUrl: './chart-test.component.html',
  styleUrls: ['./chart-test.component.scss']
})
export class ChartTestComponent implements OnInit {
  examIds: number[];
  isNegative: boolean;
  parentId: number;
  chartType: ChartType;
  subjects: ChartSubject[];
  datasetLabels: string[] = ['User', 'Cohort'];
  chartHistory: ChartHistory[] = [];

  radarDisabled = false;

  testData = {
    labels: [
      'A',
      {
        label: 'This is a long text',
        expand: false,
        children: [
          'B1.1',
          {
            label: 'B1.2',
            children: ['B1.2.1', 'B1.2.2']
          },
          'B1.3'
        ]
      },
      {
        label: 'C1',
        children: ['C1.1', 'C1.2', 'C1.3', 'C1.4']
      },
      'D'
    ],
    datasets: [
      {
        label: 'Score',
        data: [
          1,
          {
            value: 20,
            children: [
              30,
              {
                value: 40,
                children: [41, 42]
              },
              50
            ]
          },
          {
            value: 60,
            children: [70, 80, 90, 100]
          },
          33
        ]
      },
      {
        label: 'Cohort Score',
        data: [
          1,
          {
            value: 20,
            children: [
              30,
              {
                value: 40,
                children: [41, 42]
              },
              50
            ]
          },
          {
            value: 60,
            children: [70, 80, 90, 100]
          },
          33
        ]
      }],
    misconcept_labels : ['test', 'test 2', 'asdf', 'lorem', 'ipsum'],
    misconcept_datasets: [
      {
        label: 'Score',
        data: [-20, -44, -64, -50, -51]
      },
      {
        label: 'Cohort Score',
        data: [-30, -24, -14, -84, -51]
      }
    ]
    // labels: [{ label: 'A', children: ['A.1', 'A.2'] }, 'B', 'C', 'D', 'E'],
    // datasets: [{
    //   label: 'User Concept Score',
    //   xAxisID: 'positive-x',
    //   yAxisID: 'y-1',
    //   data: [{ value: 100, children: [90, 80]}, 90, 80, 70, 60],
    //   labels: ['1', '2', '3', '4', '5', '6'],
    //   backgroundColor: '#377EB8',
    //   hoverBackgroundColor: '#236EB8',
    //   barPercentage: 1.5,
    // }, {
    //   label: 'Cohort Concept Score',
    //   xAxisID: 'positive-x',
    //   yAxisID: 'y-1',
    //   data: [{ value: 50, children: [10, 20]}, 20, 84, 46, 71],
    //   backgroundColor: '#eee',
    //   hoverBackgroundColor: '#C8C8C8',
    //   barPercentage: 1.5,
    // }, {
    //   label: 'User Misconcept Score',
    //   xAxisID: 'negative-x',
    //   yAxisID: 'y-1',
    //   data: [-10, -9, -8, -70, -61],
    //   labels: ['x', 'y', 'z', 'a', 'b', 'c'],
    //   backgroundColor: '#de0000',
    //   hoverBackgroundColor: '#B40000',
    //   barPercentage: 1.5,
    // }, {
    //   label: 'Cohort Misconcept Score',
    //   xAxisID: 'negative-x',
    //   yAxisID: 'y-1',
    //   data: [-40, -19, -48, -50, -71],
    //   backgroundColor: '#eee',
    //   hoverBackgroundColor: '#C8C8C8',
    //   barPercentage: 1.5
    // }]
  };

  private loggingSubject = 'ConstructChart';

  constructor(private activityService: ActivityService,
              private route: ActivatedRoute,
              private collectionService: CollectionService,
              private translate: TranslateService,
              private loggingService: LoggingService) { }

  ngOnInit() {
    this.collectionService.withId(+this.route.snapshot.params.collectionId).subscribe(collection => {
      const settings = undefined; // (collection as any).settings.chart;

      this.chartType = this.route.snapshot.queryParams.chartType || settings && settings.chartType || 'radar';

      if (this.route.snapshot.queryParams.examIds) {
        this.examIds = this.route.snapshot.queryParams.examIds.map(value => +value); // convert from string to int
      } else {
        this.examIds = settings && settings.examId || [0];
      }

      if (this.route.snapshot.queryParams.isNegative) {
        this.isNegative = this.route.snapshot.queryParams.isNegative === 'true'; // convert from string to boolean
      } else {
        this.isNegative = settings && settings.isNegative || false;
      }

      this.parentId = +this.route.snapshot.queryParams.parentId || settings && settings.parentId || -1;
      if (this.parentId >= 0) { // If the chart is initialised for a child construct, give the user a jump back to top
        this.chartHistory.push({parentId: -1, chartType: this.chartType});
      }

      this.subjects = [
        {
          type: 'user'
        },
        {
          type: 'cohort'
        }
      ];
    });
  }

  datasetChange(newData) {
    this.setAvailableChartsFromDataset(newData);
  }

  setAvailableChartsFromDataset(data: {dataset, labels}) {
    this.radarDisabled = data.labels.length < 3;
  }

  constructClick(data: {$event: MouseEvent, construct: Construct}) {
    if (data.construct) {
      if (data.construct.head_constructs.length === 0) {
        console.log('navigate to construct entity viewer for construct ', data.construct);
      } else {
        this.chartHistory.push({parentId: this.parentId, chartType: this.chartType});
        this.parentId = data.construct.id;
      }
    }
  }

  backInChartHistory() {
    const previousChart = this.chartHistory.pop();
    this.chartType = previousChart.chartType;
    this.parentId = previousChart.parentId;

    this.loggingService.event(this.loggingSubject, 'BackBtn', previousChart);
  }

  changeChartType(chartType: ChartType) {
    this.chartType = chartType;

    this.loggingService.event(this.loggingSubject, 'TypeChange', {chartType});
  }

  setNegative(isNegative: boolean) {
    if (isNegative !== this.isNegative) {
      this.isNegative = isNegative;
      this.parentId = -1;

      this.loggingService.event(this.loggingSubject, 'NegativeChange', {isNegative});
    }
  }

}
