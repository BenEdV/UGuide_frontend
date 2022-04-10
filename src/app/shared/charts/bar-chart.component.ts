import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { BaseChartComponent } from './base-chart/base-chart.component';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './base-chart/base-chart.component.html',
  styleUrls: ['./base-chart/base-chart.component.scss']
})
export class BarChartComponent extends BaseChartComponent implements OnChanges {
  @Input() loggingSubject = 'BarChart';
  type = 'bar';

  constructor(loggingService: LoggingService, toastService: ToastService) {
    super(loggingService, toastService);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.validateDatasetsAndLabels();

    if (!this.invalidChart) {
      this.emitDatasetChange(this.datasets);
    }
  }

  getChartOptions(): ChartOptions {
    return {
      title: {
        display: !!this.title,
        text: this.title
      },
      legend: {
        onHover: e => (e.target as any).style.cursor = 'pointer',
        onLeave: e => (e.target as any).style.cursor = 'default',
        labels: {
          fontSize: this.fontSize + 1
        }
      },
      hover: {
        mode: 'nearest',
        onHover: (event, points) => {
          if (this.chartClick.observers.length > 0) {
            (event.target as any).style.cursor = points.length ? 'pointer' : 'default';
          }
          this.emitHover({event, points});
        }
      },
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        yAxes: [{
          display: true,
          scaleLabel: {
            display: !!this.yLabel,
            labelString: this.yLabel
          },
          type: this.yType,
          ticks: {
            beginAtZero: true,
            min: this.min,
            max: this.max,
            stepSize: this.stepSize
          }
        }],
        xAxes: [{
          display: true,
          scaleLabel: {
            display: !!this.xLabel,
            labelString: this.xLabel
          },
          ticks: {
            minRotation: 0,
            maxRotation: 25,
            callback: (item, index) =>
              (item as string).length > this.labelLengthLimit ? (item as string).substring(0, this.labelLengthLimit) + '...' : item
          }
        }]
      }
    };
  }

}
