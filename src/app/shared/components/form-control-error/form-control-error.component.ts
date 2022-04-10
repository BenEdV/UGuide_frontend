import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-control-error',
  templateUrl: './form-control-error.component.html',
  styleUrls: ['./form-control-error.component.scss']
})
export class FormControlErrorComponent implements OnInit {
  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() displayName: string;

  constructor() { }

  ngOnInit() {
    if (!this.displayName) {
      this.displayName = this.controlName;
    }
  }

  get c() { return this.form.controls[this.controlName]; }

  get invalid() {
    if (!this.form || !this.c) {
      return false;
    }

    return this.c.invalid && (this.c.dirty || this.c.touched);
  }

}
