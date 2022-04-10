import { Component, OnInit } from '@angular/core';
import { ActivityComponent } from '../activity/activity.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity } from '../../core/interfaces/activity';
import { ToolbarService } from 'src/app/core/services/components/toolbar.service';
import { ActivityStatic } from '../activity.static';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent extends ActivityComponent implements OnInit {
  survey: Activity;

  static getQuestions(survey: Activity): Activity[] {
    if (!survey || !survey.head_activities) {
      return [];
    }

    return survey.head_activities.filter(ha => ha.relation_type === 'exam_question');
  }

  constructor(private route: ActivatedRoute, private router: Router, toolbarService: ToolbarService) {
    super(route, toolbarService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  setActivity(routeData) {
    this.survey = routeData.survey;

    const redirectUrl = ActivityStatic.routerLinkHelper(this.survey, routeData.collection.id);
    if (redirectUrl[0] === '/') {
      redirectUrl[0] = '';
    }

    if (redirectUrl.join('/') !== this.router.url) {
      this.router.navigate(redirectUrl);
    } else {
      this.addNavTab(this.survey, 'surveys');
    }
  }

}
