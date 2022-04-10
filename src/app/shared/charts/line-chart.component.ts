import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { BaseChartComponent } from './base-chart/base-chart.component';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';
import { DatePipe } from '@shared/pipes/date.pipe';

@Component({
  selector: 'app-line-chart',
  templateUrl: './base-chart/base-chart.component.html',
  styleUrls: ['./base-chart/base-chart.component.scss']
})
export class LineChartComponent extends BaseChartComponent implements OnChanges {
  @Input() loggingSubject = 'LineChart';
  @Input() timeXAxis = false;
  type = 'line';

  constructor(loggingService: LoggingService, toastService: ToastService, private datePipe: DatePipe) {
    super(loggingService, toastService);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.validateDatasetsAndLabels();

    if (!this.invalidChart) {
      this.emitDatasetChange(this.datasets);
    }
  }

  getChartOptions(): ChartOptions {
    const options: ChartOptions = {
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
      },
      elements: {
        line: {
          fill: false
        },
        point: {
          pointStyle: 'circle',
          radius: 5,
          hitRadius: 0,
          hoverRadius: 8
        }
      }
    };

    if (this.timeXAxis) {
      Object.assign(options.scales.xAxes[0], {
        type: 'time',
        time: {
          unit: 'day'
        },
        ticks: {
          callback: tick => this.datePipe.transform(tick, 'monthDay')
        }
      });
      Object.assign(options.scales.yAxes[0], {
        ticks: {
          precision: 0
        }
      });
    }

    return options;
  }

}
