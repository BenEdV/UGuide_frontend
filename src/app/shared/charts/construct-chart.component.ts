import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';
import { RadarChartComponent } from './radar-chart.component';
import { Construct } from 'src/app/core/interfaces/construct';
import { ConstructStatic } from 'src/app/constructs/construct.static';
import { TranslateService } from '@ngx-translate/core';

type ConstructLayer = 'all' | 'root' | 'leaf';

@Component({
  selector: 'app-construct-chart',
  templateUrl: './base-chart/base-chart.component.html',
  styleUrls: ['./base-chart/base-chart.component.scss']
})
export class ConstructChartComponent extends RadarChartComponent implements OnChanges {
  @Input() constructs: Construct[];
  @Input() userIds: number[];
  @Input() isNegative = false;
  @Input() layer: ConstructLayer = 'all';
  @Input() showScore = true;
  @Input() showAverage = true;
  @Input() label = 'Score';
  @Input() loggingSubject = 'ConstructChart';

  visibleConstructs: Construct[];
  min = 0;
  max = 100;
  datasets; labels;

  // This component is just a quick setting to create a distribution chart for grades
  constructor(loggingService: LoggingService, toastService: ToastService, private translate: TranslateService) {
    super(loggingService, toastService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.constructs) {
      this.datasets = [];
      this.labels = [];

      if (this.showScore) {
        this.datasets.push({
          label: this.label,
          data: []
        });
      }

      if (this.showAverage) {
        this.datasets.push({
          label: this.translate.instant('construct.overview.concepts.chart.average_label'),
          data: []
        });
      }

      const scoreDatasetIdx = 0;
      const averageDatasetIdx = this.showScore ? 1 : 0;

      const typeFilter = this.isNegative ? ConstructStatic.isConstructNegative : ConstructStatic.isConstructPositive;
      let layerFilter;
      if (this.layer === 'root') {
        layerFilter = ConstructStatic.isConstructRoot;
      } else if (this.layer === 'leaf') {
        layerFilter = ConstructStatic.isConstructLeaf;
      } else {
        layerFilter = () => true;
      }

      const filteredConstructs = this.constructs.filter(c => {
        return layerFilter(c) && typeFilter(c);
      });

      this.visibleConstructs = [];
      for (const construct of filteredConstructs) {
        this.visibleConstructs.push(construct);
        if (this.showScore) {
          const score = ConstructStatic.getLatestScore(construct, this.userIds) || 0;
          this.datasets[scoreDatasetIdx].data.push(score * 100);
        }
        if (this.showAverage) {
          this.datasets[averageDatasetIdx].data.push(construct.latest_average_score && construct.latest_average_score.score * 100 || 0);
        }
        this.labels.push(construct.name);
      }

      if (this.visibleConstructs.length >= 3) {
        this.min = -3; // make sure dots on the radar chart do not overlap at 0%.
      }
    }

    super.ngOnChanges(changes);
  }

  emitClick($event) {
    let construct: Construct;
    if ($event.active && $event.active.length > 0) {
      construct = this.visibleConstructs[$event.active[0]._index];
    }
    $event.construct = construct;
    super.emitClick($event);
  }

}
