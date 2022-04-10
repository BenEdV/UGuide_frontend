import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationExamComponent } from './administration-exam.component';

describe('AdministrationExamComponent', () => {
  let component: AdministrationExamComponent;
  let fixture: ComponentFixture<AdministrationExamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrationExamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
