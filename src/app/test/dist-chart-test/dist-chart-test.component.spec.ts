import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistChartTestComponent } from './dist-chart-test.component';

describe('DistChartTestComponent', () => {
  let component: DistChartTestComponent;
  let fixture: ComponentFixture<DistChartTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistChartTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistChartTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
