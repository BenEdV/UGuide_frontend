import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatmapChartTestComponent } from './heatmap-chart-test.component';

describe('HeatmapChartTestComponent', () => {
  let component: HeatmapChartTestComponent;
  let fixture: ComponentFixture<HeatmapChartTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatmapChartTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatmapChartTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
