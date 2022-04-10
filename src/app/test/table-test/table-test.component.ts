import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-table-test',
  templateUrl: './table-test.component.html',
  styleUrls: ['./table-test.component.scss']
})
export class TableTestComponent implements OnInit {
  fakeData: any;
  fakeClasses = {
    title: title => title[0] === 'v' ? 'text-danger' : '',
    completed: completed => completed ? 'text-success' : 'text-danger'
  };
  fakeKeys = ['userId', 'title', 'completed'];
  fakeLinks = {
    title: (obj) => `${obj.id}`
  };
  fakeIconify = {
    completed: completed => completed ? 'fa fa-check' : 'fa fa-times'
  };
  headerOverrides = {
    completed: 'woop'
  };

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.fakeData = [
      {
        userId: 1,
        title: 'Test Child',
        completed: false
      },
      {
        userId: 2,
        title: 'Test Child 2',
        completed: true
      },
      {
        userId: 3,
        title: 'Sub 3',
        completed: false,
        children: [
          {
            userId: 3,
            title: 'Test 1',
            completed: false
          }
        ]
      }
    ];
  }

}
