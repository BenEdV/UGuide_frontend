import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivityComponent } from '../activity/activity.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Activity, SimpleActivity } from '../../core/interfaces/activity';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivityService } from '../../core/services/collection/activity.service';
import { mergeMap } from 'rxjs/operators';
import { ToolbarService } from 'src/app/core/services/components/toolbar.service';
import { ActivityStatic } from '../activity.static';

@Component({
  selector: 'app-survey-form',
  templateUrl: './survey-form.component.html',
  styleUrls: ['./survey-form.component.scss']
})
export class SurveyFormComponent extends ActivityComponent implements OnInit {
  @Input() survey: Activity;
  @Input() showTitle = true;
  @Input() allowScroll = true;
  @Output() completed = new EventEmitter();
  questions: (SimpleActivity & Activity)[];
  comments: (SimpleActivity & Activity)[];

  pages: (SimpleActivity & Activity)[][] = [];
  pageForms = [];
  itemsPerPage = 5;
  currentPage = 0;

  submitted = false;
  addingResults = false;

  constructor(private route: ActivatedRoute,
              toolbarService: ToolbarService,
              private fb: FormBuilder,
              private activityService: ActivityService,
              private router: Router) {
    super(route, toolbarService);
  }

  setActivity(routeData) {
    this.survey = this.survey || routeData.survey;

    const completionResultIdx = ActivityStatic.indexOfCompleted(this.survey.my_results);
    const completionResult = completionResultIdx !== -1 ? this.survey.my_results[completionResultIdx] : null;
    const latestSurveyCompletionTimestamp = completionResult && new Date(completionResult.timestamp);
    const isRetake = latestSurveyCompletionTimestamp !== undefined;

    if (isRetake && !this.survey.properties.retake) { // if retake is not allowed
      this.router.navigate(
        ActivityStatic.routerLinkHelper(this.survey, this.route.snapshot.params.collectionId),
        {queryParamsHandling: 'preserve'}
      );
    }

    if (!this.survey.my_latest_result ||
        (isRetake && completionResult && completionResultIdx < ActivityStatic.indexOfInitialized(this.survey.my_results))) {
      this.activityService.markAsStarted(this.survey.id).subscribe(() => {
        if (this.survey.constructs.length > 0) {
          this.activityService.updateScores(this.survey.id).subscribe();
        }
      });
    }

    this.questions = this.survey.head_activities.filter(activity => activity.relation_type === 'exam_question');
    // TODO: find better way to order comments
    this.comments = this.survey.head_activities.filter(activity => activity.relation_type === 'exam_comment').reverse();

    const allHeads = [...this.questions, ...this.comments].sort(this.sortOnNumberOrId);
    const pageCount = Math.ceil(allHeads.length / this.itemsPerPage);
    for (let i = 0; i < pageCount; i++) {
      this.pages[i] = allHeads.slice(i * this.itemsPerPage, (i + 1) * this.itemsPerPage);

      const pageQuestions = this.pages[i].filter(activity => activity.relation_type === 'exam_question');
      const formGroup = {};
      if (pageQuestions.length > 0) {
        let answeredQuestionCount = 0;
        for (const question of pageQuestions) {
          formGroup[question.id] = [];

          if (question.my_latest_result?.result?.response &&
              (!isRetake || new Date(question.my_latest_result.timestamp) >= latestSurveyCompletionTimestamp)) {
            let response = question.my_latest_result.result.response;
            if (!isNaN(+response)) {
              response = +response;
            }
            formGroup[question.id].push(response);
            answeredQuestionCount++;
          } else {
            formGroup[question.id].push(null);
          }

          if (question.properties.required) {
            formGroup[question.id].push(Validators.required);
          }
        }

        if (answeredQuestionCount === pageQuestions.length && i === this.currentPage) {
          this.currentPage++;
        }
      }
      this.pageForms.push(this.fb.group(formGroup));
    }

    if (this.currentPage > 0 && this.currentPage === this.pages.length) {
      this.currentPage--;
    }

    if (!isRetake && this.currentPage === 0 && this.survey.properties.modals) {
      const startModals = this.survey.properties.modals.filter(modal => modal.location === 'start');
      for (const modal of startModals) {
        this.showModal(modal.body);
      }
    }

    this.addNavTab(this.survey, 'surveys');
  }

  ngOnInit() {
    super.ngOnInit();
  }

  get f() { return this.pageForms[this.currentPage].controls; }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.pageForms[this.currentPage].valid) {
      const results = this.createResults();

      if (this.currentPage < this.pages.length - 1) { // Go to next page
        this.submitted = false;
        if (results.length > 0) {
          this.activityService.addResult(results, true).subscribe();
        }
        this.currentPage++;
        if (this.allowScroll) {
          window.scrollTo({top: 0});
        }
      } else {
        this.addingResults = true;
        this.activityService.addResult(results) // submit results & mark as complete
          .pipe(
            mergeMap(() => this.activityService.markAsComplete(this.survey.id)),
            mergeMap(() => {
              if (this.survey.constructs.length > 0) {
                return this.activityService.updateScores(this.survey.id);
              }

              return [false];
            })
          )
          .subscribe(
            () => {
              this.completed.emit('success');
              this.router.navigate(
                ActivityStatic.routerLinkHelper(this.survey, this.route.snapshot.params.collectionId),
                {queryParamsHandling: 'preserve'}
              );
              this.addingResults = false;
            },
            (error: any) => {
              this.submitted = false;
              this.addingResults = false;
            }
          );
      }
    } else if (this.allowScroll) {
      // Scroll to first error message.
      for (const key of Object.keys(this.f)) {
        if (this.f[key].invalid) {
          const elementRect = document.getElementById(key).getBoundingClientRect().top;
          const bodyRect = document.body.getBoundingClientRect().top;
          const offset = 50;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          break;
        }
      }
    }
  }

  createResults() {
    const result = [];
    for (const entry of Object.entries(this.f)) {
      const activityId: number = +entry[0];
      const control: FormControl = entry[1] as FormControl;

      if (!control.pristine) {
        result.push(
          {
            activity_id: +activityId,
            answer_id: control.value,
            timestamp: new Date().toISOString()
          }
        );

        control.markAsPristine();
        control.markAsUntouched();
      }
    }

    return result;
  }

  sortOnNumberOrId(a: (SimpleActivity & Activity), b: (SimpleActivity & Activity)) {
    if (a.relation_properties.number !== undefined && b.relation_properties.number !== undefined) {
      return (a.relation_properties.number > b.relation_properties.number) ? 1 : -1;
    }
    return a.id > b.id ? 1 : -1;
  }

  showModal(body: string) {
    // TODO: implement
  }

  goToAdministration() {
    this.router.navigate(['collections', this.route.snapshot.data.collection.id, 'administration', 'surveys', this.survey.id]);
  }

}
