import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-permission-test',
  templateUrl: './permission-test.component.html',
  styleUrls: ['./permission-test.component.scss']
})
export class PermissionTestComponent implements OnInit {
  counter = 0;
  permissions: string[];

  constructor(private router: Router) { }

  ngOnInit() {
  }

  triggerChangeDetection() {
    this.counter++;
    if (this.counter % 2 === 0) {
      this.permissions = ['wooptiedoop'];
    } else {
      this.permissions = ['see_users'];
    }
    console.log(this.permissions);
  }

  goToChart() {
    this.router.navigate(['collections', 1, 'chart'], {queryParams: {chartType: 'bar', isNegative: true, parentId: 2, examIds: [1, 2, 3]}});
  }

}
