import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { BaseChartComponent } from './base-chart/base-chart.component';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';
import { environment } from 'src/environments/environment';
import * as pluginDatalabels from 'chartjs-plugin-datalabels';

type PolarType = 'Radius' | 'Area';

@Component({
  selector: 'app-polar-chart',
  templateUrl: './base-chart/base-chart.component.html',
  styleUrls: ['./base-chart/base-chart.component.scss']
})
export class PolarChartComponent extends BaseChartComponent implements OnChanges, AfterViewInit {
  @Input() polarType: PolarType = 'Radius';
  @Input() startAngle: number;
  @Input() angles: number[] = [];
  @Input() activeDataIndices: number[] = [];

  @Input() loggingSubject = 'PolarChart';

  @Output() labelClick = new EventEmitter();
  @Output() labelHover = new EventEmitter();

  type = 'polarArea';
  private chartHeight: number;
  private isHovering: boolean;

  constructor(loggingService: LoggingService, toastService: ToastService) {
    super(loggingService, toastService);
    this.requiredPlugins = [pluginDatalabels];
  }

  ngOnChanges(changes: SimpleChanges) {
    this.validateDatasetsAndLabels();

    if (!this.invalidChart && (changes.datasets || changes.labels)) {
      this.emitDatasetChange(this.datasets);
    }
  }

  ngAfterViewInit() {
    if (this.chart) {
      this.updateChartHeight(this.chart.chart.height);
    }
  }

  updateChartHeight(height: number) {
    this.chartHeight = height;
    super.setChartOptions(); // update chart options based on the height
  }

  getChartOptions(): ChartOptions {
    const options = {
      title: {
        display: !!this.title,
        text: this.title
      },
      startAngle: this.startAngle,
      scale: {
        ticks: {
          min: this.min,
          max: this.max,
          stepSize: this.stepSize,
          fontSize: this.fontSize
        }
      },
      elements: {
        arc: {
          angle: angle => this.angles[angle.dataIndex]
        }
      },
      hover: {
        intersect: true,
        onHover: (event, points) => {
          if (this.chartClick.observers.length > 0) {
            (event.target as any).style.cursor = points.length ? 'pointer' : 'default';
          }
          this.emitHover({event, points});
        }
      },
      tooltips: {
        intersect: true,
        filter: () => true,
        displayColors: false,
        callbacks: {
          label: (tooltipItem, data) => [data.labels[tooltipItem.index] + ': ' + Number(tooltipItem.yLabel).toFixed(0) + '%'],
        }
      },
      plugins: {
        datalabels: {
          align: 'end',
          anchor: this.chartHeight ? 'start' : undefined,
          clamp: true,
          offset: this.chartHeight / 2.3 || undefined,
          formatter: (value, context) => this.labels[context.dataIndex],
          font: {
            size: this.fontSize
          },
          color: context => {
            if (this.labelClick.observers.length > 0 && (context.hovered || context.active ||
                this.activeDataIndices?.indexOf(context.dataIndex) !== -1)) {
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
              const dataset = this.datasets[context.datasetIndex];
              const datasetLabel = dataset.label;
              const value = dataset.data[context.dataIndex];
              const label = this.labels[context.dataIndex];
              setTimeout(() => {
                if (context.hovered) {
                  this.logEvent('LabelHover', {datasetLabel, value, label});
                }
              }, environment.hover_log_timeout);
              this.labelHover.emit(context);
              return true;
            },
            leave: context => {
              context.hovered = false;
              this.labelHover.emit(context);
              return true;
            }
          }
        }
      }
    };

    if (this.polarType === 'Area') {
      console.log('Do something to convert to area-based');
    }

    return options as any;
  }

}
