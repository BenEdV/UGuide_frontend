import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Collection } from 'src/app/core/interfaces/collection';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.scss']
})
export class CourseListComponent implements OnInit {
  collections: Collection[];

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.collections = this.route.snapshot.data.collections;
  }

}
