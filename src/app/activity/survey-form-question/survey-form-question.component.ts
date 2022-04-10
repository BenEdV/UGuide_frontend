import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Activity, SimpleActivity } from 'src/app/core/interfaces/activity';

@Component({
  selector: 'app-survey-form-question',
  templateUrl: './survey-form-question.component.html',
  styleUrls: ['./survey-form-question.component.scss']
})
export class SurveyFormQuestionComponent implements OnInit {
  @Input() question: Activity & SimpleActivity;
  @Input() form: FormGroup;
  @Input() formControlName: string | number;
  @Input() submitted = false;                 // whether the form has been submitted yet (to show control errors)
  @Input() id: string;                        // value for html property id, can be used to scroll element into view
  @Input() disabled = true;                   // disable the controls
  @Input() answerId: number = null;           // id of the answer that should be active

  isValid = true;
  type: string;

  constructor() { }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    if (!this.question) {
      console.error(`Received invalid question ${this.question}`);
      this.isValid = false;
      return;
    }

    if (!this.formControlName) {
      this.formControlName = this.question.id;
    }

    if (!this.form) {
      const controls = {};
      controls[this.formControlName] = new FormControl({value: this.answerId, disabled: this.disabled});
      this.form = new FormGroup(controls);
    }

    if (!this.id) {
      this.id = 'question' + this.question.id + 'answer';
    }
  }

}
