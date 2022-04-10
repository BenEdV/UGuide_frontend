import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartTestComponent } from './line-chart-test.component';

describe('LineChartTestComponent', () => {
  let component: LineChartTestComponent;
  let fixture: ComponentFixture<LineChartTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineChartTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
