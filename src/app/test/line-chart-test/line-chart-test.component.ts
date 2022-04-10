import { Component, OnInit } from '@angular/core';
import { ChartDataSets } from 'chart.js';

@Component({
  selector: 'app-line-chart-test',
  templateUrl: './line-chart-test.component.html',
  styleUrls: ['./line-chart-test.component.scss']
})
export class LineChartTestComponent implements OnInit {
  chartDataset: ChartDataSets[] = [
      {
        data: [5.5, 8, 1],
        label: 'Behaalde score'
      },
      {
        data: [7, 7, 8],
        label: 'Gemiddelde score'
      }
    ];
  chartLabels: string[] = ['Toets 1', 'Toets 2', 'Toets 3'];

  constructor() { }

  ngOnInit() { }

  log($event) {
    console.log($event);
  }

}
