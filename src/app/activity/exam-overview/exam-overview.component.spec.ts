import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamOverviewComponent } from './exam-overview.component';

describe('ActivityOverviewComponent', () => {
  let component: ExamOverviewComponent;
  let fixture: ComponentFixture<ExamOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExamOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
