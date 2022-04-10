import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationSurveyComponent } from './administration-survey.component';

describe('AdministrationSurveyComponent', () => {
  let component: AdministrationSurveyComponent;
  let fixture: ComponentFixture<AdministrationSurveyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrationSurveyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
