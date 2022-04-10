import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { BaseChartComponent } from './base-chart/base-chart.component';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';
import { Score } from 'src/app/core/interfaces/score';
import { ChartDataSets, ChartPoint } from 'chart.js';
import { DatePipe } from '@shared/pipes/date.pipe';

export interface ConstructProgressDataset {
  construct_ids: number[];
  scores: Score[];
  label: string;
  hidden?: boolean;
  colorIdx?: number;
}

@Component({
  selector: 'app-construct-progress-chart',
  templateUrl: './base-chart/base-chart.component.html',
  styleUrls: ['./base-chart/base-chart.component.scss']
})
export class ConstructProgressChartComponent extends BaseChartComponent implements OnChanges {
  @Input() loggingSubject = 'ConstructProgressChart';
  @Input() constructDatasets: ConstructProgressDataset[];
  type = 'line';
  max = 100;
  datasets; labels;

  constructor(loggingService: LoggingService, toastService: ToastService, private datePipe: DatePipe) {
    super(loggingService, toastService);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.validateDatasetsAndLabels();

    if (!this.invalidChart) {
      this.datasets = this.createConstructProgressDatasets(this.constructDatasets);
      if (!this.hasContent || this.datasets[0].data.length < 2) {
        this.chartError(
          `${this.loggingSubject} chart has not enough data: ${JSON.stringify(this.datasets)}`,
          'chart.error.not_enough_data'
        );
      } else {
        this.emitDatasetChange(this.datasets);
      }
    }
  }

  validateDatasetsAndLabels() {
    this.invalidChart = false;
    if (!this.constructDatasets || this.constructDatasets.length === 0) {
      this.chartError(
        `${this.loggingSubject} chart received invalid data: ${JSON.stringify(this.constructDatasets)}`,
        'chart.error.not_enough_data'
      );
    }
  }

  createConstructProgressDatasets(constructDatasets: ConstructProgressDataset[]): ChartDataSets[] {
    const result: ChartDataSets[] = [];
    for (const dataset of constructDatasets) {
      if (dataset.scores?.length > 0) {
        const chartDataset = {
            label: dataset.label,
            data: [],
            hidden: dataset.hidden
        };

        if (dataset.colorIdx) {
          Object.assign(chartDataset, this.colors[dataset.colorIdx]);
        }

        result.push(chartDataset);

        const idx = result.length - 1;
        const scoresPerDay = this.getScoresPerDay(dataset.scores);
        const constructScores = {}; // keep track of last seen score per construct
        for (const constructId of dataset.construct_ids) {
          constructScores[constructId] = 0; // last seen score is 0 for all constructs at the start
        }
        let movingAverage = 0; // moving average will be updated per day
        for (const [date, scores] of Object.entries(scoresPerDay)) {
          for (const score of scores) {
            movingAverage += (score.score - constructScores[score.construct_id]) / dataset.construct_ids.length;
            constructScores[score.construct_id] = score.score;
          }

          result[idx].data.push({
            t: date,
            y: movingAverage * 100
          } as number & ChartPoint);
        }
      }
    }
    return result;
  }

  getScoresPerDay(scores: Score[]): {[date: string]: Score[]} {
    const scoresPerDay: {[date: string]: Score[]} = {};
    for (const score of scores) {
      const date = this.convertDate(score.timestamp);
      if (scoresPerDay[date] === undefined) {
        scoresPerDay[date] = [score];
        continue;
      }
      // Only add the latest score per construct
      const addedIdx = scoresPerDay[date].findIndex(addedScore => addedScore.construct_id === score.construct_id);
      if (addedIdx === -1) {
        scoresPerDay[date].push(score);
      } else if (scoresPerDay[date][addedIdx].timestamp.localeCompare(score.timestamp) === -1) {
        scoresPerDay[date][addedIdx] = score;
      }
    }

    const orderedScoresPerDay = {}; // order properties on date, so Object.entries() will go in chronological order
    Object.keys(scoresPerDay).sort((a, b) => a.localeCompare(b)).forEach(key => orderedScoresPerDay[key] = scoresPerDay[key]);

    return orderedScoresPerDay;
  }

  convertDate(timestamp: string): string { // removes the hours, minutes & seconds
    const timestampDate = new Date(timestamp);
    return new Date(timestampDate.getFullYear(), timestampDate.getMonth(), timestampDate.getDate()).toISOString();
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
          ticks: {
            beginAtZero: true,
            min: this.min,
            max: this.max,
            stepSize: this.stepSize,
            callback: tick => tick.toString() + '%' // Adds a % sign at the end
          }
        }],
        xAxes: [{
          display: true,
          type: 'time',
          time: {
            unit: 'day'
          },
          scaleLabel: {
            display: !!this.xLabel,
            labelString: this.xLabel
          },
          ticks: {
            callback: tick => this.datePipe.transform(tick, 'monthDay')
          }
        }]
      },
      elements: {
        line: {
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
