import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets } from 'chart.js';
import { linePlugin, textPlugin } from '../../shared/charts/chart-plugins';

@Component({
  selector: 'app-polar-test',
  templateUrl: './polar-test.component.html',
  styleUrls: ['./polar-test.component.scss']
})
export class PolarTestComponent implements OnInit, AfterViewInit {
  @ViewChild('constructChart') constructChart;

  chartDataset: ChartDataSets[] = [
      {
        data: [55, 80, 70, 60, 40, 15, 22, 70, 63, 91, 44],
        label: 'Behaalde score',
      }
    ];
  chartLabels: string[] = ['Anxiety', 'Self belief', 'Motivation', '4', '5', '6', '7', '8', '9', '10', '11'];
  angles: number[] = [];

  plugins = [linePlugin, textPlugin];
  options = {
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

  constructor() { }

  ngOnInit() {
    const smallStep = Math.PI / 6;
    const bigStep = Math.PI / 4;
    for (let i = 0; i < this.chartLabels.length; i++) {
      this.angles.push(i < 9 ? smallStep : bigStep);
    }
  }

  ngAfterViewInit() {

  }

  log(thing) {
    console.log(thing);
  }

}
