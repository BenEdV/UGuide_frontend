import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationSurveyFormComponent } from './administration-survey-form.component';

describe('AdministrationSurveyFormComponent', () => {
  let component: AdministrationSurveyFormComponent;
  let fixture: ComponentFixture<AdministrationSurveyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrationSurveyFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationSurveyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
