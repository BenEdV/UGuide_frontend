import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSetComponent } from './student-set.component';

describe('StudentSetComponent', () => {
  let component: StudentSetComponent;
  let fixture: ComponentFixture<StudentSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentSetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
