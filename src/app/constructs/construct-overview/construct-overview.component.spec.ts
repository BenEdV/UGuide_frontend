import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstructOverviewComponent } from './construct-overview.component';

describe('ConstructOverviewComponent', () => {
  let component: ConstructOverviewComponent;
  let fixture: ComponentFixture<ConstructOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConstructOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstructOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
