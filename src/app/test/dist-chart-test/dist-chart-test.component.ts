import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dist-chart-test',
  templateUrl: './dist-chart-test.component.html',
  styleUrls: ['./dist-chart-test.component.scss']
})
export class DistChartTestComponent implements OnInit {
  items = [
    // { score: null, name: 'a' },
    { score: 8.5, name: 'b' },
    { score: 8.5, name: 'c' },
    { score: 8.5, name: 'd' },
    { score: 1, name: 'e' },
    { score: 1, name: 'f' },
    { score: 3, name: 'g' },
    { score: 2, name: 'h' },
    { score: 2, name: 'i' },
    { score: 3.5, name: 'j' },
    { score: 3.2, name: 'k' },
    { score: 7, name: 'g' },
    { score: 3, name: 'h' },
    { score: 5, name: 'i' },
    { score: 4.1, name: 'j' },
    { score: 9, name: 'k' },
    { score: 7, name: 'f' },
    { score: 8, name: 'g' },
    { score: 7, name: 'k' },
    { score: 0, name: 'z' }
  ];
  testLambda = item => item;

  constructor() { }

  ngOnInit() {
  }

  log($event) {
    console.log($event);
  }

}
