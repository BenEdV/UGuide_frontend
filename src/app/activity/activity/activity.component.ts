import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Activity, ActivityAttachment } from '../../core/interfaces/activity';
import { environment } from '../../../environments/environment';
import { ToolbarService } from 'src/app/core/services/components/toolbar.service';
import { ActivityStatic } from '../activity.static';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit, OnDestroy {
  protected dataSubscription;

  constructor(private currentRoute: ActivatedRoute, private toolbarService: ToolbarService) { }

  setActivity(routeData) {
  }

  addNavTab(activity: Activity, navItemKey: string, closeLink?: string[]) {
    this.toolbarService.addTab(
      {
        name: activity.title,
        link: ActivityStatic.routerLinkHelper(activity, this.currentRoute.snapshot.params.collectionId)
      },
      this.currentRoute.snapshot.data.collection
    );
  }

  ngOnInit() {
    this.dataSubscription = this.currentRoute.data.subscribe(routeData => this.setActivity(routeData));
  }

  ngOnDestroy() {
    this.dataSubscription.unsubscribe();
  }

  getDataUrl(attachment: ActivityAttachment): string {
    return `${environment.api_url}${this.currentRoute.snapshot.params.collectionId}/activities/attachment/${attachment.id}`;
  }
}
