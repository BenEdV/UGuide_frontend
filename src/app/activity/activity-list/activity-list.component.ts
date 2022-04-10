import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Activity } from '../../core/interfaces/activity';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedStatic } from '@shared/shared.static';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit, AfterViewInit {
  activities: Activity[];
  activityType: string;         // set from router data to show only activities of one specific type

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.activityType = this.route.snapshot.data.activityKeys[0];
    this.activities = Object.values(this.route.snapshot.data.activities as {[key: string]: Activity[]})[0];
  }

  ngAfterViewInit() {
    SharedStatic.setInjectedElement(document.querySelector('.administration-link'), {
      bind: this,
      onclick: this.goToAdministration
    });
  }

  goToAdministration() {
    let link;
    if (this.activityType === 'exam') {
      link = 'exams';
    } else if (this.activityType === 'studyMaterial') {
      link = 'material';
    } else if (this.activityType === 'survey') {
      link = 'surveys';
    }

    this.router.navigate(['/', 'collections', this.route.snapshot.data.collection.id,  'administration', link]);
  }

}
