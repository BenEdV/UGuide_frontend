import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationCourseComponent } from './administration-course.component';

describe('AdministrationCourseComponent', () => {
  let component: AdministrationCourseComponent;
  let fixture: ComponentFixture<AdministrationCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrationCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
