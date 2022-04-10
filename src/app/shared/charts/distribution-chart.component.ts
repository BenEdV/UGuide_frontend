import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';
import { BaseChartComponent } from './base-chart/base-chart.component';
import { TranslateService } from '@ngx-translate/core';

export interface DistributionPoint {x: number; y: number; helper: boolean; }

@Component({
  selector: 'app-distribution-chart',
  templateUrl: './base-chart/base-chart.component.html',
  styleUrls: ['./base-chart/base-chart.component.scss']
})
export class DistributionChartComponent extends BaseChartComponent implements OnChanges {
  @Input() items = []; // list of objects whose frequency will be counted
  @Input() legend = false; // display legend
  @Input() cumulative = false;
  @Input() maxX = 1; // The maximum value
  @Input() valueLambda: ((item: any) => string | number) = (item => item.score); // must return value that is used for counting frequency
  @Input() labelLambda: ((label: any) => string) = (label => '' + label); // x-axis labels override (e.g. null => 'N.D.')
  @Input() colorLambda: ((x: number, y: number) => string) = (() => 'rgba(55, 126, 184, 0.6)'); // color bar based on value
  @Input() tooltipLambda: ((obj: any) => string); // text to display in tooltip
  @Input() tooltipItemLengthLimit = 3;

  @Input() pointWidth = 3;
  @Input() pointBorderWidth = 3;
  @Input() pointHighlightWidth = 8;
  @Input() pointHighlightBorderWidth = 5;

  @Input() loggingSubject = 'DistributionChart';

  type: ChartType;
  groupedItems = {};
  datasets: ChartDataSets[] = [];
  colors = undefined; // Colors should be defined in datasets for this chart
  chartColorKeys: string[] = ['backgroundColor', 'hoverBackgroundColor', 'borderColor', 'hoverBorderColor', 'pointBackgroundColor'];
  colorSections = [
    {min: 0, max: 1, color: 'rgba(55, 126, 184, 0.6)', pointColor: 'rgba(55, 126, 184, 0.9)'}
  ];

  constructor(loggingService: LoggingService, toastService: ToastService, private translate: TranslateService) {
    super(loggingService, toastService);

    this.cardActions.push({
      name: 'toggle.cumulative',
      permissions: ['use_card_actions'],
      callback: () => {
        this.cumulative = !this.cumulative;
        this.options = this.getChartOptions();
        this.createChart();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.createChart();
  }

  createChart() {
    this.validateDatasetsAndLabels();

    if (!this.invalidChart) {
      this.type = this.cumulative ? 'scatter' : 'bar';

      // Initialize chartDataset
      this.datasets = [];
      this.getGroupedItems();
      this.labels = this.labels || Object.keys(this.groupedItems);

      if (this.cumulative) {
        let curY = 0;
        const adjPoints = this.getPoints(this.groupedItems);
        for (const colorSection of this.colorSections) {
          const dataset = {
            data: [],
            label: this.yLabel || 'Frequency',
            borderWidth: this.pointBorderWidth,
            tension: 0,
            showLine: true,
            borderColor: colorSection.color,
            backgroundColor: colorSection.color,
            pointBackgroundColor: 'rgba(0,0,0,0)',
            pointRadius: [],
            pointBorderWidth: [],
            pointBorderColor: [],
            pointHoverBorderColor: [],
            pointHoverBackgroundColor: []
          };
          dataset.data.push({
            x: colorSection.min,
            y: curY,
            helper: true
          });
          if (colorSection.max === this.maxX) {
            dataset.data = dataset.data.concat(adjPoints.filter(point => point.x >= colorSection.min && point.x <= colorSection.max));
          } else {
            dataset.data = dataset.data.concat(adjPoints.filter(point => point.x >= colorSection.min && point.x < colorSection.max));
          }
          curY = dataset.data[dataset.data.length - 1].y;
          dataset.data.push({
            x: colorSection.max,
            y: curY,
            helper: true
          });

          for (let i = 0; i <= dataset.data.length - 1; i++) {
            dataset.pointRadius[i] = dataset.data[i].helper ? 0 : this.pointWidth;
            dataset.pointBorderColor[i] = colorSection.pointColor;
          }
          this.datasets.push(dataset);
        }
      } else {
        const dataset = {
          data: [],
          label: this.yLabel || 'Frequency',
          backgroundColor: [],
          hoverBackgroundColor: []
        };

        for (let i = 0; i < this.labels.length; i++) {
          const label = '' + this.labels[i];
          dataset.data.push(this.groupedItems[label].length);
          dataset.backgroundColor.push(this.colorLambda(i, this.groupedItems[label].length));
        }

        this.datasets.push(dataset);
      }

      this.datasetChange.emit({groupedItems: this.groupedItems, chartDataset: this.datasets});
      this.logEvent('DataChange',
        {
          cumulative: this.cumulative,
          data: {dataset: this.datasets.map(
            dataset => ({data: dataset.data, label: dataset.label})), borderWidth: 3, tension: 0}
        }
      );
    }
  }

  getGroupedItems() {
    this.groupedItems = {};

    if (this.labels && this.labels.length > 0 && !this.cumulative) {
      for (const label of this.labels) {
        this.groupedItems['' + label] = [];
      }
    }

    for (const item of this.items) {
      const key = '' + this.valueLambda(item);
      if (this.groupedItems[key]) {
        this.groupedItems[key].push(item);
      } else {
        this.groupedItems[key] = [item];
      }
    }
  }

  getPoints(groupedItems: object) {
    const points = [];

    for (const [key, value] of Object.entries(groupedItems)) {
      points.push({
        x: parseFloat(key),
        y: (value as any[]).length
      });
    }

    points.sort((a, b) => {
      return a.x - b.x;
    });

    const cumulPoints: DistributionPoint[] = [];
    let acc = 0;
    for (const point of points) {
      cumulPoints.push({
        x: point.x,
        y: acc,
        helper: true
      });
      acc += point.y;
      cumulPoints.push({
        x: point.x,
        y: acc,
        helper: false
      });
    }

    const adjPoints = cumulPoints.map(point => ({
      x: point.x,
      y: point.y * 100 / acc,
      helper: point.helper
    }));

    return adjPoints;
  }

  emitClick($event) {
    let items;
    let label;
    let labelText;
    if ($event.active.length > 0) {
      label = this.labels[$event.active[0]._index];
      if (this.labelLambda) {
        labelText = this.labelLambda(label);
      }
      items = this.groupedItems[label];
    }
    $event.items = items;
    $event.labelText = labelText;
    super.emitClick($event);
  }

  validateDatasetsAndLabels() {
    this.invalidChart = false;
    if (!this.items || this.items.length === 0) {
      this.chartError(`Distribution chart received invalid items: ${JSON.stringify(this.items)}`);
    }
  }

  highlightItem(value: number): void {
    for (let datasetIndex = 0; datasetIndex < this.datasets.length; datasetIndex++) {
      for (let index = 0; index < this.datasets[datasetIndex].data.length; index++) {
        const point = this.datasets[datasetIndex].data[index] as DistributionPoint;
        if (point.x === value && point.helper === false) {
          this.simulateHover(datasetIndex, index);
        }
      }
    }
  }

  unhighlightItem(value: number): void {
    for (const dataset of this.datasets) {
      for (let index = 0; index < dataset.data.length; index++) {
        const point = dataset.data[index] as DistributionPoint;
        if (point.x === value && point.helper === false) {
          dataset.pointRadius[index] = this.pointWidth;
          dataset.pointBorderWidth[index] = this.pointBorderWidth;
        }
      }
    }
    this.datasetChange.emit({groupedItems: this.groupedItems, chartDataset: this.datasets});
    this.chart.update();
  }

  getChartOptions(): ChartOptions {
    if (this.cumulative) {
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
        tooltips: {
          filter: (tooltipItem) => {
            const indice = tooltipItem.index;
            const datasetIndice = tooltipItem.datasetIndex;
            return !(this.datasets[datasetIndice].data[indice] as DistributionPoint).helper;
          },
          callbacks: {
            title: (tooltipItem, data) => {
              const indice = tooltipItem[0].index;
              const datasetIndice = tooltipItem[0].datasetIndex;
              const item = data.datasets[datasetIndice].data[indice] as DistributionPoint;
              const x = item.x;
              const y = item.y.toFixed(2);
              return this.translate.instant('chart.distribution.students_scored_lower', {studentCount: y, grade: x});
            },
            label: (tooltipItem, data) => null
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
              min: 0,
              padding: 10
            },
            scaleLabel: {
              display: !!this.yLabel,
              labelString: this.yLabel
            }
          }],
          xAxes: [{
            type: 'linear',
            scaleLabel: {
              display: !!this.xLabel,
              labelString: this.xLabel
            }
          }]
        },
        elements: {
          point: {
            pointStyle: 'circle',
            borderWidth: this.pointBorderWidth,
            hitRadius: 0,
            hoverBorderWidth: this.pointHighlightBorderWidth,
            hoverRadius: this.pointHighlightWidth
          }
        }
      };
    } else {
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
        tooltips: {
          callbacks: {
            title: (item, data) => {
              if (this.xLabel) {
                return `${this.xLabel}: ${this.labelLambda(item[0].xLabel)}`;
              }
              return this.labelLambda(item[0].xLabel);
            },
            footer: (item, data) => {
              if (this.tooltipLambda) {
                if (!this.groupedItems || !item || item.length === 0) {
                  return null;
                }

                const key = this.labels[item[0].index];
                const items = this.groupedItems && this.groupedItems[key];
                if (items && items.length > 0) {
                  const result = ['', ''];

                  const showableItemLength = Math.min(items.length, this.tooltipItemLengthLimit);
                  for (let i = 0; i < showableItemLength - 1; i++) {
                    result[1] += this.tooltipLambda(items[i]) + ', ';
                  }
                  result[1] += this.tooltipLambda(items[items.length - 1]); // add final item without the ', '

                  if (items.length > this.tooltipItemLengthLimit) {
                    result[1] += this.translate.instant('chart.distribution.and_n_more', {n: items.length - this.tooltipItemLengthLimit});
                  }

                  return result;
                }
              }

              return null;
            }
          }
        },
        hover: {
          mode: 'nearest',
          onHover: (event, points) => {
            if (this.chartClick.observers.length > 0) {
              (event.target as any).style.cursor = points.length ? 'pointer' : 'default';
            }
            this.emitHover({event, points});
          },
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
              stepSize: 5
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
              autoSkip: true,
              autoSkipPadding: 50,
              callback: (item, index) => {
                item = this.labelLambda(item); // convert to string (toString doesn't work if item === null)
                if (item) {
                  return item.length > this.labelLengthLimit ? item.substring(0, this.labelLengthLimit) + '...' : item;
                }
              }
            }
          }]
        },
        elements: {
          line: {
            borderWidth: 4,
            stepped: true,
            fill: true
          },
          point: {
            pointStyle: 'circle',
            radius: 5,
            hitRadius: 0,
            hoverRadius: 8
          }
        }
      };
    }
  }
}
