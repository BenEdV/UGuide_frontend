import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { mergeMap, switchMap } from 'rxjs/operators';
import { SurveyComponent } from 'src/app/activity/survey/survey.component';
import { Activity, ActivityType } from 'src/app/core/interfaces/activity';
import { Construct } from 'src/app/core/interfaces/construct';
import { Model } from 'src/app/core/interfaces/model';
import { ActivityService } from 'src/app/core/services/collection/activity.service';
import { ConstructService } from 'src/app/core/services/collection/constructs/construct.service';
import { BaseAdministrationComponent } from '../base-administration/base-administration.component';

@Component({
  selector: 'app-administration-survey-form',
  templateUrl: './administration-survey-form.component.html',
  styleUrls: ['./administration-survey-form.component.scss']
})
export class AdministrationSurveyFormComponent extends BaseAdministrationComponent implements OnInit {
  survey: Activity;
  models: Model[];
  constructs: Construct[];
  adding = false;
  showNewQuestion = true;

  addForm = new FormGroup({
    body: new FormControl('', Validators.required),
    type: new FormControl(null, Validators.required),
    answers: new FormArray([]),
    required: new FormControl(false, Validators.required)
  });

  private supportedTypes = ['multiple_choice', 'multiple_selection', 'likert', 'open', 'comment'];
  questionTypes: ActivityType[] = [];
  relationTypes: ActivityType[] = [];
  questionTypeLabelFn = (type: ActivityType) => this.translate.instant('admin.survey_content.question_types.' + type.name);

  constructor(private route: ActivatedRoute,
              private activityService: ActivityService,
              private constructService: ConstructService,
              modal: NgbModal,
              private translate: TranslateService) {
    super(route, modal);
  }

  get c() {
    return this.addForm.controls;
  }

  ngOnInit(): void {
    this.survey = this.route.snapshot.data.survey;
    this.models = this.route.snapshot.data.models;
    this.constructs = this.route.snapshot.data.constructs;
    this.relationTypes = this.route.snapshot.data.types.activity_relations;

    for (const type of this.supportedTypes) {
      for (const activityRelation of this.route.snapshot.data.types.activities) {
        if (activityRelation.name.indexOf(type) !== -1) {
          this.questionTypes.push(activityRelation);
          break;
        }
      }
    }

    console.log(this.survey);
    console.log(this.models);
    console.log(this.constructs);
    console.log(this.questionTypes);
    console.log(this.relationTypes);
  }

  isType(type: string): boolean {
    return this.c.type.value?.name.endsWith(type);
  }

  updateQuestionType(type: ActivityType) {
    const answers = this.addForm.get('answers') as FormArray;
    answers.clear();

    if (!type) {
      return;
    }

    if (type.name.endsWith('multiple_choice') || type.name.endsWith('multiple_selection')) {
      answers.push(new FormControl('A'));
      answers.push(new FormControl('B'));
      answers.push(new FormControl('C'));
    } else if (type.name.endsWith('likert')) {
      // TODO
    } else {
      // TODO
    }
  }

  addAnswer() {
    const answers = this.addForm.get('answers') as FormArray;
    answers.push(new FormControl(''));
  }

  deleteAnswer(index: number) {
    const answers = this.addForm.get('answers') as FormArray;
    answers.removeAt(index);
  }

  transformAnswers(answers: string): {id: number, body: string}[] {
    const result = [];
    for (let i = 0; i < answers.length; i++) {
      result.push({
        id: i,
        body: answers[i]
      });
    }
    return result;
  }

  addQuestion() {
    if (this.validateForm(this.addForm)) {
      this.adding = true;

      let relationTypeId: number;
      if (this.c.type.value.name === 'comment') {
        relationTypeId = this.relationTypes.find((type: ActivityType) => type.name === 'exam_comment')?.id;
      } else {
        relationTypeId = this.relationTypes.find((type: ActivityType) => type.name === 'exam_question')?.id;
      }

      this.activityService.addSurveyQuestion(
        this.survey.id,
        this.c.body.value,
        this.c.type.value.id,
        relationTypeId,
        this.transformAnswers(this.c.answers.value),
        this.survey.visible,
        this.c.required.value,
        SurveyComponent.getQuestions(this.survey).length
      ).subscribe();
      this.adding = false;
      this.addForm.patchValue({
        body: '',
        type: null,
        required: false
      });
      this.resetFormValidation(this.addForm);
    }
  }

  editQuestion(id: number) {
    console.log(id);
  }

  deleteQuestion(id: number) {
    this.activityService.delete(id).pipe(
      mergeMap(() => this.activityService.withId(this.survey.id))
    ).subscribe(res => this.survey = res);
  }

}
