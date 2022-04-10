import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-heatmap-chart-test',
  templateUrl: './heatmap-chart-test.component.html',
  styleUrls: ['./heatmap-chart-test.component.scss']
})
export class HeatmapChartTestComponent implements OnInit {
  items = [
    { x: 1, y: 1, v: 1 },
    { x: 1, y: 2, v: 0 },
    { x: 1, y: 3, v: 1 },
    { x: 2, y: 1, v: 1 },
    { x: 2, y: 2, v: 0 },
    { x: 2, y: 3, v: 1 },
    { x: 3, y: 1, v: 1 },
    { x: 3, y: 2, v: 0 },
    { x: 3, y: 3, v: 0 },
    { x: 4, y: 1, v: 0 },
    { x: 4, y: 2, v: 1 },
    { x: 4, y: 3, v: 0 },
    { x: 5, y: 1, v: 1 },
    { x: 5, y: 2, v: 0 },
    { x: 5, y: 3, v: 1 },
    { x: 6, y: 1, v: 1 },
    { x: 6, y: 2, v: 0 },
    { x: 6, y: 3, v: 0 },
  ];

  items2 = [
    { x: 1, y: 1, v: 1 },
    { x: 1, y: 2, v: 0 },
    { x: 1, y: 3, v: 1 },
    { x: 2, y: 1, v: 1 },
    { x: 2, y: 2, v: 0 },
    { x: 2, y: 3, v: 1 },
    { x: 3, y: 1, v: 1 },
    { x: 3, y: 2, v: 0 },
    { x: 3, y: 3, v: 0 },
  ];

  items3 = [];

  labels = [
    'A',
    'B',
    'C'
  ];

  constructor() {
    for (let x = 1; x <= 30; x++) {
      for (let y = 1; y <= 20; y++) {
        const v = Math.random();
        this.items3.push({x, y, v});
      }
    }
  }

  ngOnInit() {
  }

  log($event) {
    console.log($event);
  }

}
