import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { cloneDeep } from 'lodash';
import { BaseChartDirective, Color } from 'ng2-charts';
import { LoggingService } from '../../../core/services/logging.service';
import { CardAction } from '../../../core/interfaces/card-action';
import { ToastService } from '../../../core/services/components/toast.service';

@Component({
  selector: 'app-chart',
  template: 'No-UI'
})
export class BaseChartComponent implements OnInit {
  @Input() title: string;
  @Input() yLabel: string;
  @Input() yType: string;
  @Input() xLabel: string;
  @Input() xType: string;
  @Input() legend = true;
  @Input() datasets: ChartDataSets[];
  @Input() type: string;
  @Input() labels: string[];
  @Input() options: ChartOptions & any; // & any to support plugin options, will be merged with default chart options
  @Input() plugins = [];
  @Input() colors: Color[] = [
    {
      backgroundColor: 'rgba(55, 126, 184, 0.6)',
      borderColor: 'rgba(55, 126, 184, 0.6)',
      hoverBackgroundColor: 'rgba(55, 126, 184, 0.7)',
      hoverBorderColor: 'rgba(55, 126, 184, 0.7)',
      pointBackgroundColor: 'rgba(55, 126, 184, 0.6)',
      pointBorderColor: 'rgba(55, 126, 184, 0.6)',
      pointHoverBackgroundColor: 'rgba(55, 126, 184, 0.7)',
      pointHoverBorderColor: 'rgba(55, 126, 184, 0.7)'
    },
    {
      backgroundColor: 'rgba(200, 200, 200, 0.6)',
      borderColor: 'rgba(200, 200, 200, 0.6)',
      hoverBackgroundColor: 'rgba(200, 200, 200, 0.7)',
      hoverBorderColor: 'rgba(200, 200, 200, 0.7)',
      pointBackgroundColor: 'rgba(200, 200, 200, 0.6)',
      pointBorderColor: 'rgba(200, 200, 200, 0.6)',
      pointHoverBackgroundColor: 'rgba(200, 200, 200, 0.7)',
      pointHoverBorderColor: 'rgba(200, 200, 200, 0.7)'
    },
    {
      backgroundColor: 'rgba(77, 175, 74, 0.6)',
      borderColor: 'rgba(77, 175, 74, 0.6)',
      hoverBackgroundColor: 'rgba(77, 175, 74, 0.7)',
      hoverBorderColor: 'rgba(77, 175, 74, 0.7)',
      pointBackgroundColor: 'rgba(77, 175, 74, 0.6)',
      pointBorderColor: 'rgba(77, 175, 74, 0.6)',
      pointHoverBackgroundColor: 'rgba(77, 175, 74, 0.7)',
      pointHoverBorderColor: 'rgba(77, 175, 74, 0.7)'
    },
    {
      backgroundColor: 'rgba(152, 78, 163, 0.6)',
      borderColor: 'rgba(152, 78, 163, 0.6)',
      hoverBackgroundColor: 'rgba(152, 78, 163, 0.7)',
      hoverBorderColor: 'rgba(152, 78, 163, 0.7)',
      pointBackgroundColor: 'rgba(152, 78, 163, 0.6)',
      pointBorderColor: 'rgba(152, 78, 163, 0.6)',
      pointHoverBackgroundColor: 'rgba(152, 78, 163, 0.7)',
      pointHoverBorderColor: 'rgba(152, 78, 163, 0.7)'
    },
    {
      backgroundColor: 'rgba(235, 163, 252, 0.6)',
      borderColor: 'rgba(235, 163, 252, 0.6)',
      hoverBackgroundColor: 'rgba(235, 163, 252, 0.7)',
      hoverBorderColor: 'rgba(235, 163, 252, 0.7)',
      pointBackgroundColor: 'rgba(235, 163, 252, 0.6)',
      pointBorderColor: 'rgba(235, 163, 252, 0.6)',
      pointHoverBackgroundColor: 'rgba(235, 163, 252, 0.7)',
      pointHoverBorderColor: 'rgba(235, 163, 252, 0.7)'
    }
  ];
  @Input() min: number;
  @Input() max: number;
  @Input() stepSize: number;
  @Input() fontSize = 13;
  @Input() yScale;

  @Input() containerHeight: string;
  @Input() containerWidth: string;

  @Input() loggingSubject = 'UnsetChartSubject';

  @Output() chartClick = new EventEmitter();
  @Output() chartHover = new EventEmitter();
  @Output() datasetChange = new EventEmitter();

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  mergedOptions: ChartOptions & any; // options that are passed to ng2-charts
  labelLengthLimit = 16;
  requiredPlugins = [];

  invalidChart = true;
  chartErrorMsg = 'chart.error.cannot_display';

  cardActions: CardAction[] = [
    {
      name: 'card.action.export_png',
      permissions: ['use_card_actions'],
      callback: (() => {
        if (this.chart) {
          const dataURL = this.chart.toBase64Image();
          const link = document.createElement('a'); // create 'a' element
          link.setAttribute('href', dataURL);
          link.setAttribute('download', this.loggingSubject || 'file');
          link.click();
        } else {
          this.toastService.showDanger('card.action.could_not_convert_png');
        }
      })
    }
  ];

  constructor(protected loggingService: LoggingService, private toastService: ToastService) { }

  get hasContent(): boolean {
    return this.datasets && this.datasets.length > 0 && this.datasets[0].data.length > 0;
  }

  ngOnInit() {
    this.setChartOptions();
    if (this.type !== 'matrix' && this.datasets && this.datasets[0] && (this.datasets[0].backgroundColor || this.datasets[0].borderColor)) {
      this.colors = undefined;
    }
    for (const plugin of this.requiredPlugins) {
      if (!this.plugins.find(chartPlugin => chartPlugin.id === (plugin as any).id)) {
        this.plugins.push(plugin);
      }
    }
  }

  invalidate() { // redraw the chart
    this.labels = [...this.labels];
  }

  setChartOptions() {
    if (!this.options) {
      this.mergedOptions = this.getChartOptions();
    } else {
      this.mergedOptions = cloneDeep(this.options); // deep copy Note: breaks on functions
      this.mergeOptions(this.mergedOptions, this.getChartOptions());
    }
  }

  mergeOptions(options, defaults, keyPath: string[] = []) {
    let optionsOfInterest = options;
    let defaultsOfInterest = defaults;
    for (const key of keyPath) {
      optionsOfInterest = optionsOfInterest[key];
      defaultsOfInterest = defaultsOfInterest[key];
    }

    if (typeof defaultsOfInterest !== 'object') { // Prevent infinite recursion due to Object.keys glitching on strings
      return;
    }

    for (const key of Object.keys(defaultsOfInterest)) {
      if (optionsOfInterest[key] === undefined) {
        optionsOfInterest[key] = defaultsOfInterest[key];
      } else {
        this.mergeOptions(options, defaults, [...keyPath, key]);
      }
    }
  }

  multiplyColor(inputColor: string, a: number) {
    const color = inputColor.match(/([0-9.]+)/g);
    for (let i = 0; i < 3; i++) { // do not change the alpha
      color[i] = Math.min(Math.round(+color[i] * a), 255).toString();
    }
    return `rgba(${color[0]},${color[1]},${color[2]},${color[3] || 1})`;
  }

  addAlpha(inputColor: string, alpha: number) {
    const color = inputColor.match(/([0-9.]+)/g);
    return `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
  }

  validateDatasetsAndLabels() {
    this.invalidChart = false;
    if (!this.datasets || this.datasets.length === 0 || !this.datasets[0].data || this.datasets[0].data.length === 0) {
      this.chartError(`${this.loggingSubject} chart received invalid data: ${JSON.stringify(this.datasets)}`);
    }

    if (this.type !== 'scatter' && this.type !== 'line' && (!this.labels || this.labels.length === 0)) {
      this.chartError(`${this.loggingSubject} chart received invalid labels: ${this.labels}`);
    }
  }

  chartError(errorMsg: string, userFacingErrorMsg?: string): void {
    this.invalidChart = true;
    this.logEvent('Invalid', errorMsg);
    if (userFacingErrorMsg) {
      this.chartErrorMsg = userFacingErrorMsg;
    }
    console.warn(errorMsg);
  }

  getChartOptions(): ChartOptions {
    if (this.title !== null) {
      return {title: {display: true, text: this.title}};
    }
    return {};
  }

  simulateHover(dataset: number, index: number): void {
    const meta = this.chart.chart.getDatasetMeta(dataset);
    const rect = this.chart.chart.canvas.getBoundingClientRect();
    const point = (meta.data[index] as any).getCenterPoint();
    const evt = new MouseEvent('mousemove', {
      clientX: rect.left + (point.x || 0), // convert NaN to 0
      clientY: rect.top + (point.y || 0)
    });
    const node = this.chart.chart.canvas;
    node.dispatchEvent(evt);
  }

  emitClick($event) {
    let datasetLabel;
    let value;
    let label;
    if ($event.active.length > 0) {
      const dataset = this.datasets[$event.active[0]._datasetIndex];
      const dataIndex = $event.active[0]._index;
      datasetLabel = dataset.label;
      value = dataset.data[dataIndex];
      label = this.labels?.[dataIndex];

      this.logEvent('Click', {datasetLabel, value, label});
    }

    Object.assign($event, {datasetLabel, value, label});
    this.chartClick.emit($event);
  }

  emitDatasetChange(data) {
    this.datasetChange.emit(data);

    const payload = { data: [] };
    for (const dataset of this.datasets) {
      payload.data.push({
        label: dataset.label,
        data: dataset.data,
        labels: this.labels
      });
    }

    this.logEvent('DataChange', payload);
  }

  emitHover($event) { // should be called from onHover chart options
    this.chartHover.emit($event); // hover triggers too often to log to the back-end
  }

  logEvent(eventName: string, details: any) {
    return this.loggingService.event(this.loggingSubject, eventName, details);
  }

}
