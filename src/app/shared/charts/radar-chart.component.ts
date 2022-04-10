import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseChartComponent } from './base-chart/base-chart.component';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-radar-chart',
  templateUrl: './base-chart/base-chart.component.html',
  styleUrls: ['./base-chart/base-chart.component.scss']
})
export class RadarChartComponent extends BaseChartComponent implements OnChanges {
  @Input() loggingSubject = 'RadarChart';
  type = 'radar';

  constructor(loggingService: LoggingService, toastService: ToastService) {
    super(loggingService, toastService);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.validateDatasetsAndLabels();

    if (!this.invalidChart) {
      for (const dataset of this.datasets) {
        if (dataset.data.length <= 2) {
          this.type = 'bar';
          break;
        }
      }

      if (changes.datasets || changes.labels) {
        this.emitDatasetChange(this.datasets);
      }
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
          fontSize: this.fontSize
        }
      },
      tooltips: {
        callbacks: {
          title: (tooltipItem, data) => '' + data.labels[tooltipItem[0].index],
          label: (tooltipItem, data) => [`${data.datasets[tooltipItem.datasetIndex].label} score: ` + Number(tooltipItem.value).toFixed(1) + '%']
        },
        footerFontStyle: 'normal'
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
      maintainAspectRatio: true
    };

    let additionalOptions: ChartOptions = {};
    if (this.type === 'radar') {
      additionalOptions = {
        scale: {
          ticks: {
            min: this.min,
            max: this.max,
            stepSize: this.stepSize,
            fontSize: this.fontSize,
            callback: tick => tick.toString() + '%' // Adds a % sign at the end
          },
          pointLabels: {
            fontSize: this.fontSize,
            callback: (item) => {
              item = '' + item;
              return item.length > this.labelLengthLimit ? item.substring(0, this.labelLengthLimit) + '...' : item;
            }
          }
        },
        elements: {
          line: {tension: 0.05},
          point: {
            pointStyle: 'circle',
            radius: 5,
            hitRadius: 0,
            hoverRadius: 8
          }
        }
      };
    } else {
      additionalOptions = {
        scales: {
          yAxes: [{
            display: true,
            ticks: {
              min: this.min,
              max: this.max,
              stepSize: this.stepSize,
              fontSize: this.fontSize,
              callback: tick => tick.toString() + '%' // Adds a % sign at the end
            },
            scaleLabel: {
              display: !!this.yLabel,
              labelString: this.yLabel
            },
          }],
          xAxes: [{
            ticks: {
              fontSize: this.fontSize,
              callback: (item) => {
                item = '' + item;
                return item.length > this.labelLengthLimit ? item.substring(0, this.labelLengthLimit) + '...' : item;
              }
            },
            gridLines: {
              display: false
            },
            scaleLabel: {
              display: !!this.xLabel,
              labelString: this.xLabel
            }
          }]
        },
        elements: {
          rectangle: {
            borderWidth: 3
          }
        }
      };
    }

    return Object.assign(options, additionalOptions);
  }

}
