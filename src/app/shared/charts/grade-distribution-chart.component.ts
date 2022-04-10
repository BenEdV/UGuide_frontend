import { Component, Input } from '@angular/core';
import { DistributionChartComponent } from './distribution-chart.component';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-grade-distribution-chart',
  templateUrl: './base-chart/base-chart.component.html',
  styleUrls: ['./base-chart/base-chart.component.scss']
})
export class GradeDistributionChartComponent extends DistributionChartComponent {
  @Input() items;
  @Input() gradeKey = 'grade';
  @Input() loggingSubject = 'GradeDistributionChart';
  labels = [null, '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  valueLambda = (item => {
    if (this.cumulative) {
      return item[this.gradeKey];
    }

    return item[this.gradeKey] && Math.round(item[this.gradeKey]);
  });
  colorSections = [
    {min: 0, max: 4, color: 'rgba(217, 83, 79, 0.6)', pointColor: 'rgba(217, 83, 79, 0.9)'},
    {min: 4, max: 6, color: 'rgba(255, 205, 0, 0.6)', pointColor: 'rgba(255, 205, 0, 0.9)'},
    {min: 6, max: 8, color: 'rgba(160, 210, 90, 0.6)', pointColor: 'rgba(160, 210, 90, 0.9)'},
    {min: 8, max: 10, color: 'rgba(30, 222, 180, 0.6)', pointColor: 'rgba(30, 222, 180, 0.9)'}
  ];
  colorLambda = ((x: number, y: number) => {
    if (x === 0) {
      return 'rgba(55, 126, 184, 0.6)';
    }
    if (x <= 4) {
      return 'rgba(217, 83, 79, 0.6)';
    } else if (x < 6) {
      return 'rgba(255, 205, 0, 0.6)';
    } else {
      return 'rgba(30, 222, 180, 0.6)';
    }
  });
  labelLambda = (label => label === null ? 'N.D.' : label);
  tooltipLambda = (obj => obj.name);

  // This component is just a quick setting to create a distribution chart for grades
  constructor(loggingService: LoggingService, toastService: ToastService, translate: TranslateService) {
    super(loggingService, toastService, translate);
  }

}
