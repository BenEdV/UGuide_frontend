import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Activity } from '../../core/interfaces/activity';

@Component({
  selector: 'app-global-activities-list',
  templateUrl: './global-activities-list.component.html',
  styleUrls: ['./global-activities-list.component.scss']
})
export class GlobalActivitiesListComponent implements OnInit {
  activities: Activity[];

  constructor(private route: ActivatedRoute) {
    this.activities = route.snapshot.data.activities;
  }

  ngOnInit() {
  }

}
