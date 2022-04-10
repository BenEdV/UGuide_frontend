import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyFormQuestionComponent } from './survey-form-question.component';

describe('SurveyFormQuestionComponent', () => {
  let component: SurveyFormQuestionComponent;
  let fixture: ComponentFixture<SurveyFormQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyFormQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyFormQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
