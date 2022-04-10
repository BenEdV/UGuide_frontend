import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConstructProgressDataset } from '@shared/charts/construct-progress-chart.component';
import { Construct } from '../../core/interfaces/construct';
import { ConstructStatic } from '../construct.static';
import { DatePipe } from '@shared/pipes/date.pipe';

@Component({
  selector: 'app-construct-overview',
  templateUrl: './construct-overview.component.html',
  styleUrls: ['./construct-overview.component.scss']
})
export class ConstructOverviewComponent implements OnInit {
  constructs: Construct[];
  positiveLeafConstructs: Construct[];
  negativeLeafConstructs: Construct[];
  positiveHardConstructs: Construct[];
  negativeHardConstructs: Construct[];

  sortKey: string;
  warningKey: string;
  positiveHardConstructThreshold: number;
  negativeHardConstructThreshold: number;
  constructProgressDatasets: ConstructProgressDataset[];
  constructProgressOptions = {
    aspectRatio: 1.4,
    tooltips: {
      callbacks: {
        title: (tooltipItem, data) => null,
        label: (tooltipItem, data) => {
          return this.translate.instant('construct.overview.construct_progress.chart.callback', {
            date: this.datePipe.transform(tooltipItem.xLabel),
            score: tooltipItem.yLabel.toFixed(0)
          });
        }
      }
    }
  };

  showConstructs = false;
  showMisconstructs = false;
  showScore: boolean;

  constructor(private route: ActivatedRoute, private router: Router, private translate: TranslateService, private datePipe: DatePipe) { }

  ngOnInit() {
    this.constructs = this.route.snapshot.data.constructs;
    this.positiveLeafConstructs = ConstructStatic.getPositiveLeafs(this.constructs);
    this.negativeLeafConstructs = ConstructStatic.getNegativeLeafs(this.constructs);

    this.showConstructs = this.positiveLeafConstructs.length > 0;
    this.showMisconstructs = this.negativeLeafConstructs.length > 0;

    if (!this.showConstructs && !this.showMisconstructs) {
      this.showConstructs = true;
    }

    const collection = this.route.snapshot.data.collection;
    // TODO: Remove hardcoded threshold fallbacks
    this.positiveHardConstructThreshold = collection.settings?.positiveHardConstructThreshold || 0.5;
    this.negativeHardConstructThreshold = collection.settings?.negativeHardConstructThreshold || 0.3;

    if (this.constructs.find(construct => construct.my_latest_score)) {
      this.sortKey = 'score';
      this.warningKey = 'my_score';
      this.showScore = true;
    } else {
      this.sortKey = 'average_score';
      this.warningKey = 'average_score';
      this.showScore = false;
    }

    this.positiveHardConstructs = this.getHardConstructs(this.positiveLeafConstructs);
    this.negativeHardConstructs = this.getHardConstructs(this.negativeLeafConstructs);

    this.createConstructProgressCharts(this.positiveLeafConstructs, this.negativeLeafConstructs);
  }

  createConstructProgressCharts(positiveConstructs: Construct[], negativeConstructs: Construct[]) {
    const positiveScores = []; // all average scores of all positive constructs
    positiveConstructs.forEach(construct => construct.average_scores && positiveScores.push(...construct.average_scores));

    const negativeScores = []; // all average scores of all negative constructcs
    negativeConstructs.forEach(construct => construct.average_scores && negativeScores.push(...construct.average_scores));

    this.constructProgressDatasets = [
      {
        scores: positiveScores,
        construct_ids: positiveConstructs.map(construct => construct.id),
        label: this.translate.instant('construct.overview.construct_progress.construct_average'),
        colorIdx: 0
      },
      {
        scores: negativeScores,
        construct_ids: negativeConstructs.map(construct => construct.id),
        label: this.translate.instant('construct.overview.construct_progress.misconsruct_average'),
        colorIdx: 1
      }
    ];
  }

  handleConstructChartClick($event) {
    if ($event.construct) {
      this.router.navigate(['..', $event.construct.id], {relativeTo: this.route});
    }
  }

  getHardConstructs(constructs: Construct[]): Construct[] {
    return constructs.filter(construct => {
      if (!construct[this.warningKey]) { // if no score is available, then we cannot determine if it is hard
        return false;
      }

      if (ConstructStatic.isConstructPositive(construct)) {
        return construct[this.warningKey].score < this.positiveHardConstructThreshold;
      } else {
        return construct[this.warningKey].score > this.negativeHardConstructThreshold;
      }
    });
  }

}
