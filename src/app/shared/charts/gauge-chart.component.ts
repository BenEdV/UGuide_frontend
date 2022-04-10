import { Component, Input, Output, OnChanges, SimpleChanges, EventEmitter, AfterViewInit } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { BaseChartComponent } from './base-chart/base-chart.component';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';
import { textPlugin } from './chart-plugins';
import * as pluginDatalabels from 'chartjs-plugin-datalabels';

type textType = 'percentage' | 'label';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './base-chart/base-chart.component.html',
  styleUrls: ['./base-chart/base-chart.component.scss']
})
export class GaugeChartComponent extends BaseChartComponent implements OnChanges, AfterViewInit {
  @Input() percentage: number; // percentage of the gauge that should be filled, will override datasets
  @Input() normPercentage: number; // percentage of the gauge that should be filled, will override datasets
  @Input() showText: textType;
  @Input() isActive = false;
  @Input() loggingSubject = 'GaugeChart';

  @Output() labelClick = new EventEmitter();
  @Output() labelHover = new EventEmitter();

  type = 'doughnut';
  private isHovered = false;
  private blockChartHoverUpdate = false;
  private chartWidth: number;

  constructor(loggingService: LoggingService, toastService: ToastService) {
    super(loggingService, toastService);
    this.legend = false;
    this.requiredPlugins = [textPlugin, pluginDatalabels];
  }

  ngOnChanges(changes: SimpleChanges) {
    this.validateDatasetsAndLabels();

    if (!this.invalidChart) {
      if (this.percentage !== null && this.percentage !== undefined) {
        this.datasets = [
          { data: [this.percentage, 100 - this.percentage, 0] }, // add 0 for constant alignment of the datalabel
        ];
        this.colors = [
          {
            backgroundColor: [this.colors[0].backgroundColor as string],
            hoverBackgroundColor: [
              this.colors[0].hoverBackgroundColor as string || this.multiplyColor(this.colors[0].backgroundColor as string, 0.75)
            ]
          }
        ];
      }

      if (changes.percentage || changes.labels) {
        this.emitDatasetChange(this.datasets);
      }
    }
  }

  ngAfterViewInit() {
    if (this.chart) {
      this.updateChartWidth(this.chart.chart.width);
    }
  }

  updateChartWidth(width: number) {
    this.chartWidth = width;
    super.setChartOptions(); // update chart options based on the height
  }

  validateDatasetsAndLabels() {
    this.invalidChart = false;
    if (this.percentage === null || this.percentage === undefined) {
      if (!this.datasets || this.datasets.length === 0 ||
        !this.datasets[0].data || this.datasets[0].data.length === 0) {
        this.chartError(`${this.type} chart received invalid data: ${JSON.stringify(this.datasets)}`);
      }
    }

    if (!this.labels || this.labels.length === 0) {
      this.chartError(`${this.type} chart received invalid labels: ${this.labels}`);
    }
  }

  getChartOptions(): ChartOptions {
    const options = {
      title: {
        display: !!this.title,
        position: 'top',
        text: this.title,
        fontStyle: 'normal',
        fontColor: 'black',
        fontSize: this.fontSize
      },
      layout: {
        padding: {
          top: 10,
          bottom: 25
        }
      },
      tooltips: {
        position: 'average',
        filter: tooltipItem => tooltipItem.index === 0,
        displayColors: false,
        callbacks: {
          // title: (tooltipItem, data) => tooltipItem.length > 0 ? data.labels[0] : null,
          label: (tooltipItem, data) => {
            if (this.normPercentage) {
              const normName = sessionStorage.getItem('norms') === 'peer' ? 'Peer reference' : 'Criterion reference';
              return [`${data.labels[0]}: ${Number(data.datasets[0].data[0]).toFixed(0)}%`,
                `(${normName}: ${Number(this.normPercentage).toFixed(0)}%)`];
            } else {
              return [`${data.labels[0]}: ${Number(data.datasets[0].data[0]).toFixed(0)}%`];
            }
          }
          // footer: (tooltipItem, data) => tooltipItem.length > 0 ? tooltipFooter(tooltipItem, 1, construct_idx) : null,
        }
      },
      hover: {
        onHover: (event, points) => {
          if (this.chartClick.observers.length > 0) {
            (event.target as any).style.cursor = points[0] && points[0]._index === 0 ? 'pointer' : 'default';
          }

          this.isHovered = points.length > 0 && points[0]._index === 0;
          if (!this.blockChartHoverUpdate) {
            this.chart.chart.update();
          }

          this.emitHover({event, points});
        }
      },
      plugins: {
        text: [],
        datalabels: {}
      },
      elements: {
        arc: {
          borderWidth: 0,
          hoverBorderWidth: 0
        }
      },
      circumference: Math.PI,
      rotation: Math.PI,
      cutoutPercentage: 70,
      weight: 10
    };

    if (this.showText === 'percentage') {
      Object.assign(options.plugins.text, [
          {
            text: Number(this.datasets && this.datasets[0].data && this.datasets[0].data[0]).toFixed(0) + '%',
            fontSize: this.fontSize + 2,
            x: 0.5,
            y: 0.7
          }
        ]
      );
    } else if (this.showText === 'label') {
      Object.assign(options.plugins.datalabels, {
          align: 0,
          anchor: 'start', // this.chartHeight ? 'start' : undefined,
          clamp: false,
          offset: -this.chartWidth / 3 - this.labels[0].length * 2.25, // magic numbers that seem to center the text
          formatter: (value, context) => {
            if (context.dataIndex === 0 || context.dataIndex === 1) {
              return null;
            }

            return '\n\n' + this.labels[0]; // add whitespace for vertical offset (padding & lineheight are broken)
          },
          font: {
            size: this.fontSize
          },
          color: context => {
            if (this.labelClick.observers.length > 0 && (context.hovered || this.isActive || this.isHovered)) {
              return 'black';
            }

            return '#787878';
          },
          listeners: {
            click: context => {
              this.labelClick.emit(context);
              const dataset = this.datasets[context.datasetIndex];
              const datasetLabel = dataset.label;
              const value = dataset.data[context.dataIndex];
              const label = this.labels[context.dataIndex];
              this.logEvent('LabelClick', {datasetLabel, value, label});
            },
            enter: context => {
              context.hovered = true;
              context.chart.canvas.style.cursor = 'pointer !important';
              this.blockChartHoverUpdate = true;
              this.labelHover.emit(context);
              return true;
            },
            leave: context => {
              context.hovered = false;
              this.blockChartHoverUpdate = false;
              this.labelHover.emit(context);
              return true;
            }
          }
        }
      );
    }

    return (options as any);
  }

}
