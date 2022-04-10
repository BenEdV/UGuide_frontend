import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color } from 'ng2-charts';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';
import { BaseChartComponent } from './base-chart/base-chart.component';
import 'chartjs-chart-matrix';

export interface HeatmapPoint {x: number; y: number; v: number; color: string; }

@Component({
  selector: 'app-heatmap-chart',
  templateUrl: './base-chart/base-chart.component.html',
  styleUrls: ['./base-chart/base-chart.component.scss']
})
export class HeatmapChartComponent extends BaseChartComponent implements OnChanges {
  @Input() items = [];          // list of objects whose frequency will be counted
  @Input() legend = false;      // display legend
  @Input() yLetters = false;    // label y-axis with letters
  @Input() hideZeroes = false;   // don't show cells with 0 value

  type: ChartType | string;
  datasets: ChartDataSets[] = [];
  xCount = 0;
  yCount = 0;
  highlightIndices = [];

  constructor(loggingService: LoggingService, toastService: ToastService) {
    super(loggingService, toastService);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.createChart();
    this.setChartOptions();
  }

  createChart() {
    this.validateDatasetsAndLabels();

    if (!this.invalidChart) {
      this.type = 'matrix';

      this.xCount = this.items.map(item => item.x).reduce((a, b) => a > b ? a : b);
      this.yCount = this.items.map(item => item.y).reduce((a, b) => a > b ? a : b);

      // Initialize chartDataset
      this.datasets = [
        {
          label: 'HeatMap',
          data: this.items,
          backgroundColor: ctx => {
            const point = (ctx.dataset.data[ctx.dataIndex] as HeatmapPoint);
            const color = point.color ? point.color : 'rgba(0,255,0,1)';
            const baseAlpha = 0.01;
            const alpha = point.v * (1 - baseAlpha) + baseAlpha;
            return this.addAlpha(color, alpha);
          },
          width: ctx => {
                const a = ctx.chart.chartArea;
                return (a.right - a.left) / (this.xCount) * 0.95;
          },
          height: ctx => {
              const a = ctx.chart.chartArea;
              return (a.bottom - a.top) / (this.yCount) * 0.95;
          },
          borderColor: ctx => {
            if (this.hideZeroes) {
              const point = (ctx.dataset.data[ctx.dataIndex] as HeatmapPoint);
              if (point.v === 0) {
                return 'rgba(0,0,0,0)';
              }
            }
            if (this.highlightIndices.includes(ctx.dataIndex)) {
              return '#000';
            }
            return '#CCC';
          },
          borderWidth: {bottom: 1, left: 0, right: 1, top: 0}
        }
      ] as any[];

      // Colors must have an index for each color
      this.colors = this.items.map(item => '#FFF' as Color);

      this.datasetChange.emit({chartDataset: this.datasets});
      this.logEvent('DataChange',
        {
          data: {dataset: this.datasets.map(
            dataset => ({data: dataset.data, label: dataset.label})), borderWidth: 3, tension: 0}
        }
      );
    }
  }

  validateDatasetsAndLabels() {
    this.invalidChart = false;
    if (!this.items || this.items.length === 0) {
      this.chartError(`Heatmap chart received invalid items: ${JSON.stringify(this.items)}`);
    }

    if (!this.labels || this.labels.length === 0) {
      this.chartError(`Heatmap chart received invalid chartLabels: ${JSON.stringify(this.labels)}`);
    }
  }

  getYLabel(yAxisIdx: number): string {
    if (this.yLetters) {
      return String.fromCharCode(yAxisIdx + 64);
    }
    return yAxisIdx.toString();
  }

  getChartOptions(): ChartOptions {
    return {
      title: {
        display: !!this.title,
        text: this.title
      },
      legend: {
        display: false
      },
      hover: {
        onHover: (event, points) => {
          if (this.chartClick.observers.length > 0) {
            (event.target as any).style.cursor = points.length ? 'pointer' : 'default';
          }
          this.emitHover({event, points});
        }
      },
      tooltips: {
        callbacks: {
          title: (tooltipItem, data) => {
            const v = data.datasets[tooltipItem[0]?.datasetIndex]?.data[tooltipItem[0].index] as HeatmapPoint;
            const labelIdx = v?.x;
            if (labelIdx) {
              return '' + data.labels[labelIdx - 1];
            }
          },
          label: (tooltipItem, data) => {
            const v = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] as HeatmapPoint;
            return `${this.getYLabel(+tooltipItem.yLabel)}: ${v.v}`;
          }
        }
      },
      scales: {
        xAxes: [{
          position: 'top',
          ticks: {
            display: true,
            min: 0.5,
            max: this.xCount + 0.5,
            stepSize: 1,
            callback: (value, index, values) => this.labels[index]
          },
          scaleLabel: {
            display: !!this.xLabel,
            labelString: this.xLabel
          },
          gridLines: {
            display: false
          },
          afterBuildTicks: (scale, ticks) => {
            return ticks.slice(1, ticks.length - 1);
          }
        }],
        yAxes: [{
          ticks: {
            display: true,
            min: 0.5,
            max: this.yCount + 0.5,
            stepSize: 1,
            reverse: true,
            callback: (value, index, values) => this.getYLabel(+value)
          },
          scaleLabel: {
            display: !!this.yLabel,
            labelString: this.yLabel
          },
          gridLines: {
            display: false
          },
          afterBuildTicks: (scale, ticks) => {
            return ticks.slice(1, ticks.length - 1);
          }
        }]
      }
    };
  }
}
