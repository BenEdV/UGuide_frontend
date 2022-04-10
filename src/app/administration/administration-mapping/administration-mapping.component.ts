import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Model } from 'src/app/core/interfaces/model';
import { Construct } from 'src/app/core/interfaces/construct';
import { Activity } from 'src/app/core/interfaces/activity';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { ConstructService } from 'src/app/core/services/collection/constructs/construct.service';
import { BaseAdministrationComponent } from '../base-administration/base-administration.component';
import { ConstructStatic } from 'src/app/constructs/construct.static';
import { ActivityService } from 'src/app/core/services/collection/activity.service';
import { switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExamStatic } from 'src/app/activity/exam.static';
import { ExamQuestionComponent } from 'src/app/activity/exam-question/exam-question.component';

@Component({
  selector: 'app-administration-mapping',
  templateUrl: './administration-mapping.component.html',
  styleUrls: ['./administration-mapping.component.scss']
})
export class AdministrationMappingComponent extends BaseAdministrationComponent implements OnInit {
  models: Model[];
  constructs: Construct[];
  exams: Activity[];
  relationTypes: any[];

  exam: Activity;
  questions: Activity[];
  getQuestionNumber = ExamQuestionComponent.getQuestionNumber;
  getQuestions = ExamStatic.getQuestions;

  examLevelForm = new FormGroup({
    constructs: new FormControl(null),
    weight: new FormControl(1)
  });

  questionLevelForm = new FormGroup({
    constructs: new FormArray([]),
    weights: new FormArray([])
  });

  answerLevelForm = new FormGroup({
    constructs: new FormControl(null),
    weights: new FormArray([])
  });

  linkLevels = [
    {
      name: 'admin.mapping.switch_exam',
      type: 'exam',
      explanation: 'admin.mapping.switch_exam_explanation',
      active: false
    },
    {
      name: 'admin.mapping.switch_question',
      type: 'question',
      explanation: 'admin.mapping.switch_question_explanation',
      active: false
    }
  ];
  possibleConstructLinks: {[id: number]: Construct[]} = {};
  currentLevelType: string;
  longestAnswers = [];
  hoverQuestion: Activity;
  linking = false;

  constructor(private route: ActivatedRoute,
              private activityService: ActivityService,
              private constructService: ConstructService,
              modal: NgbModal) {
    super(route, modal);
  }

  ngOnInit() {
    this.models = this.route.snapshot.data.models;
    this.constructs = this.route.snapshot.data.constructs;
    this.exams = this.route.snapshot.data.activities.examList;
    this.relationTypes = this.route.snapshot.data.types.construct_activity_relations;

    const exam = super.resolveEditId(this.exams);
    if (exam) {
      this.setExam(exam);
    }
  }

  setExam(exam: Activity) {
    this.exam = exam;

    if (!this.exam) {
      return;
    }

    this.longestAnswers = [];
    this.hoverQuestion = null;

    this.questions = ExamStatic.getQuestions(exam);
    if (this.exam.constructs.length > 0 || !this.questions.find(q => q.constructs.length > 0)) {
      this.setLinkLevel(this.linkLevels[0]);
    } else {
      this.setLinkLevel(this.linkLevels[1]);
    }
  }

  setPossibleConstructLinks(activity: Activity) {
    this.possibleConstructLinks[activity.id] = this.constructs.filter(c => !activity.constructs.find(ec => c.id === ec.id));
  }

  initializeForm() {
    if (this.currentLevelType === 'exam') {
      this.initializeExamForm();
    } else {
      this.initializeQuestionForm();
    }
  }

  initializeExamForm() {
    this.examLevelForm.patchValue({
      constructs: null
    });
    this.setPossibleConstructLinks(this.exam);
  }

  initializeQuestionForm() {
    const constructs = this.questionLevelForm.get('constructs') as FormArray;
    const weights = this.questionLevelForm.get('weights') as FormArray;

    constructs.clear();
    weights.clear();

    for (const question of this.questions) {
      constructs.push(new FormControl(null));
      weights.push(new FormControl(1));
      this.setPossibleConstructLinks(question);
    }
  }

  initializeAnswersForm(question: Activity) {
    const weights = this.answerLevelForm.get('weights') as FormArray;
    weights.clear();
    if (question.properties.answers.length === 0) { // if it is an open question, add a single weight
      weights.push(new FormControl(1));
    } else {
      for (const answer of question.properties.answers) {
        const initialValue = answer.correct ? 1 : 0;
        weights.push(new FormControl(initialValue));
      }
    }
  }

  resetQuestionForm() {
    const constructs = this.questionLevelForm.get('constructs') as FormArray;
    const weights = this.questionLevelForm.get('weights') as FormArray;

    for (let i = 0; i < this.questions.length; i++) {
      constructs.controls[i].patchValue(null);
      weights.controls[i].patchValue(1);
      this.setPossibleConstructLinks(this.questions[i]);
    }
  }

  resetAnswerForm(question: Activity) {
    this.answerLevelForm.controls.constructs.patchValue(null);
    this.setPossibleConstructLinks(question);
  }

  setLinkLevel(linkLevel) {
    for (const level of this.linkLevels) {
      if (level.type === linkLevel.type) {
        level.active = true;
        this.currentLevelType = linkLevel.type;
        this.initializeForm();
      } else {
        level.active = false;
      }
    }
  }

  getRelationType(construct: Construct) {
    if (ConstructStatic.isConstructPositive(construct)) {
      return this.relationTypes.find(type => type.name === 'tests');
    }

    return this.relationTypes.find(type => type.name === 'exhibits');
  }

  getCorrectValuePair(question: Activity, weight: number = 1) {
    const result = {};
    for (const answer of question.properties.answers) {
      if (answer.correct) {
        result[answer.id] = weight;
      }
    }

    if (Object.keys(result).length === 0) {
      console.warn('Could not find correct answers for question ', question);
    }

    return result;
  }

  linkExam() {
    this.linking = true;
    if (this.validateForm(this.examLevelForm)) {
      const properties = {
        weight: 1
      };

      const actions = [];
      for (const construct of this.examLevelForm.controls.constructs.value) {
        const relationType = this.getRelationType(construct);

        actions.push(
          this.constructService.linkActivity(
            construct.id,
            this.exam.id,
            relationType && relationType.id,
            properties
          )
        );
      }

      forkJoin(actions).pipe(
        switchMap(() => this.activityService.exams())
      ).subscribe(
        (res: Activity[]) => {
          this.exams = res;
          this.initializeExamForm();
          this.linking = false;
        },
        () => {
          this.linking = false;
        }
      );
    } else {
      this.linking = false;
    }
  }

  linkQuestions() {
    this.linking = true;
    if (this.validateForm(this.questionLevelForm)) {
      const actions = [];
      let questionIdx = 0;
      for (const constructs of this.questionLevelForm.controls.constructs.value) {
        if (constructs && constructs.length > 0) {
          for (const construct of constructs) {
            const relationType = this.getRelationType(construct);
            const properties: any = {};
            if (this.questions[questionIdx].properties.answers.length === 0) {
              properties.weight = 1;
            } else {
              properties.value_pairs = this.getCorrectValuePair(this.questions[questionIdx]);
            }
            actions.push(
              this.constructService.linkActivity(
                construct.id,
                this.questions[questionIdx].id,
                relationType && relationType.id,
                properties
              )
            );
          }
        }
        questionIdx++;
      }

      if (actions.length > 0) {
        forkJoin(actions).subscribe(
          (res) => {
            this.linking = false;
            this.resetQuestionForm();
          },
          () => {
            this.linking = false;
          }
        );
      } else {
        this.linking = false;
      }
    } else {
      this.linking = false;
    }
  }

  linkAnswers(question: Activity) {
    this.linking = true;
    if (this.validateForm(this.answerLevelForm)) {
      const actions = [];
      for (const construct of this.answerLevelForm.controls.constructs.value) {
        const relationType = this.getRelationType(construct);
        const properties: any = {};
        if (question.properties.answers.length === 0) {
          properties.weight = this.answerLevelForm.controls.weights.value[0];
        } else {
          properties.value_pairs = {};
          for (let i = 0; i < this.answerLevelForm.controls.weights.value.length; i++) {
            const weight = this.answerLevelForm.controls.weights.value[i];
            if (weight > 0) {
              properties.value_pairs[question.properties.answers[i].id] = weight;
            }
          }
        }

        actions.push(
          this.constructService.linkActivity(
            construct.id,
            question.id,
            relationType && relationType.id,
            properties
          )
        );
      }

      if (actions.length > 0) {
        forkJoin(actions).subscribe(
          (res) => {
            this.linking = false;
            this.resetAnswerForm(question);
          },
          (error) => this.linking = false
        );
      } else {
        this.linking = false;
      }
    } else {
      this.linking = false;
    }
  }

  deleteLink(activity: Activity, construct: Construct) {
    this.constructService.deleteActivityLink(construct.id, activity.id)
      .subscribe(() => this.setPossibleConstructLinks(activity));
  }

}
