import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThermosResultComponent } from './thermos-result.component';

describe('ThermosResultComponent', () => {
  let component: ThermosResultComponent;
  let fixture: ComponentFixture<ThermosResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThermosResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThermosResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
