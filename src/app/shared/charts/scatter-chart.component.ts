import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { BaseChartComponent } from './base-chart/base-chart.component';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';

@Component({
  selector: 'app-scatter-chart',
  templateUrl: './base-chart/base-chart.component.html',
  styleUrls: ['./base-chart/base-chart.component.scss']
})
export class ScatterChartComponent extends BaseChartComponent implements OnChanges {
  @Input() loggingSubject = 'ScatterChart';
  type = 'scatter';
  labels = [];

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
    const options = {
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
          ticks: {
            maxTicksLimit: 9
          },
          type: this.yType,
          scaleLabel: {
            display: !!this.yLabel,
            labelString: this.yLabel
          },
        }],
        xAxes: [{
          display: true,
          scaleLabel: {
            display: !!this.xLabel,
            labelString: this.xLabel
          },
          ticks: {
            min: 0,
            max: 10,
            minRotation: 0,
            maxRotation: 25,
            callback: (item, index) => item.length > this.labelLengthLimit ? item.substring(0, this.labelLengthLimit) + '...' : item
          }
        }]
      },
      tooltips: {
        callbacks: {
          label: (tooltipItem, data) => [`x: ${tooltipItem.xLabel}`, `y: ${this.epoch_to_hh_mm_ss(tooltipItem.yLabel)}`]
        }
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

    return options as any;
  }

  epoch_to_hh_mm_ss(epoch) {
    return new Date(epoch * 1000).toISOString().substr(12, 7);
  }

}
