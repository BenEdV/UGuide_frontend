import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalActivitiesListComponent } from './global-activities-list.component';

describe('GlobalActivitiesListComponent', () => {
  let component: GlobalActivitiesListComponent;
  let fixture: ComponentFixture<GlobalActivitiesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalActivitiesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalActivitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
