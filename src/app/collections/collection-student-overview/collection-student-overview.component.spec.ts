import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionStudentOverviewComponent } from './collection-student-overview.component';

describe('CollectionStudentOverviewComponent', () => {
  let component: CollectionStudentOverviewComponent;
  let fixture: ComponentFixture<CollectionStudentOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionStudentOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionStudentOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
