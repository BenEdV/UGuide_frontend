import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import { LoggingService } from '../../core/services/logging.service';
import { BaseChartComponent } from './base-chart/base-chart.component';
import { ToastService } from '../../core/services/components/toast.service';
import * as pluginHierarchical from 'chartjs-plugin-hierarchical';
import * as pluginDatalabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-hierarchical-chart',
  templateUrl: './base-chart/base-chart.component.html',
  styleUrls: ['./base-chart/base-chart.component.scss']
})
export class HierarchicalChartComponent extends BaseChartComponent implements OnChanges {
  @Input() loggingSubject = 'HierarchicalChart';
  @Input() isNegative = false;

  @Output() labelClick = new EventEmitter();
  @Output() labelHover = new EventEmitter();

  type = 'horizontalBar';

  constructor(loggingService: LoggingService, toastService: ToastService) {
    super(loggingService, toastService);
    this.requiredPlugins = [pluginHierarchical, pluginDatalabels];
  }

  ngOnChanges(changes: SimpleChanges) {
    this.validateDatasetsAndLabels();

    if (!this.invalidChart) {
      this.invalidate();
      if (changes.datasets || changes.labels) {
        this.emitDatasetChange(this.datasets);
      }
    }
  }

  emitClick($event) {
    this.chartClick.emit([$event, this.chart]);
    if ($event.active.length > 0) {
      const dataIndex = $event.active[0]._index;
      const payload = { data: [] };
      for (const dataset of this.datasets) {
        payload.data.push({
          label: dataset.label,
          value: dataset.data[dataIndex],
          dataLabel: this.labels[dataIndex]
        });
      }

      this.logEvent('Click', payload);
    }
  }

  createLabelPayload($event) {
    const node = $event.chart.scales['y-axis-0']._nodes[$event.dataIndex];

    const payload = {
      id: node.id,
      label: node.label,
    };

    for (const dataset of this.chart.datasets) {
      payload[dataset.label] = dataset.data[$event.dataIndex];
    }
    return payload;
  }

  emitLabelHover($event) {
    this.labelHover.emit($event);
    this.logEvent('LabelHover', this.createLabelPayload($event));
  }

  emitLabelClick($event) {
    this.labelClick.emit($event);
    this.logEvent('LabelClick', this.createLabelPayload($event));
  }

  getChartOptions(): any {
    if (this.isNegative) {
      this.colors[0] = {
        backgroundColor: 'rgba(250, 0, 0, 0.7)',
        borderColor: 'rgba(250, 0, 0, 0.7)',
      };
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      title: {
        display: !!this.title,
        text: this.title
      },
      legend: {
        display: false,
        position: 'right'
      },
      layout: {
        padding: {
          top: 5,
          right: this.isNegative ? 65 : 0,
          bottom: 5,
          left: this.isNegative ? 0 : 65, // add more space at the left of the chart to prevent clipping
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
      tooltips: {
        callbacks: {
          label: (tooltipItem, data) => {
            let label = data.datasets[tooltipItem.datasetIndex].label || '';

            if (label) {
                label += ': ';
            }
            label += tooltipItem.xLabel.toFixed(2) + '%';
            return label;
          }
        }
      },
      scales: {
        xAxes: [{
          display: true,
          ticks: {
            beginAtZero: false,
            min: this.isNegative ? -100 : 0,
            max: this.isNegative ? 0 : 100,
            display: false
          },
          scaleLabel: {
            display: !!this.xLabel,
            labelString: this.xLabel
          },
          gridLines: {
            display: true,
            color: 'transparent',
            drawBorder: false,
            zeroLineColor: '#ccc',
            zeroLineWidth: 1
          }
        }],
        yAxes: [{
          position: this.isNegative ? 'right' : 'left',
          attributes: {
            barThickness: 5
          },
          // barPercentage: 1.6,
          // categoryPercentage: 0.3,
          padding: this.isNegative ? -25 : 5,
          type: 'hierarchical',
          offset: true, // offset setings, for centering the categorical axis in the bar chart case
          ticks: {
            display: false
          },
          scaleLabel: {
            display: !!this.yLabel,
            labelString: this.yLabel
          },
          gridLines: {
            display: false,
            offsetGridLines: true
          }
        }]
      },
      plugins: {
        datalabels: {
          align: this.isNegative ? 'start' : 'end',
          anchor: this.isNegative ? 'end' : 'start',
          padding: {
            top: 0,
            bottom: 0
          },
          font: {
            size: this.fontSize
          },
          formatter: (value, context) => context.chart.scales['y-axis-0'].ticks[context.dataIndex] + '\n\n',
          display: context => context.datasetIndex === 0,
          color: context => {
            if (this.labelClick.observers.length > 0 && context.hovered) {
              return '#007bff';
            } else {
              return undefined;
            }
          },
          listeners: {
            click: context => {
              this.emitLabelClick(context);
            },
            enter: context => {
              context.hovered = true;
              context.chart.canvas.style.cursor = 'pointer !important';
              this.emitLabelHover(context);
              return true;
            },
            leave: context => {
              context.hovered = false;
              return true;
            }
          }
        }
      }
    };
  }

}
