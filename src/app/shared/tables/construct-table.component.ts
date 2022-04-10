import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Construct } from '../../core/interfaces/construct';
import { BaseTableComponent } from './base-table/base-table.component';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@shared/pipes/date.pipe';
import { ConstructStatic } from '../../constructs/construct.static';
import { PercentPipe } from '@angular/common';

@Component({
  selector: 'app-construct-table',
  templateUrl: './base-table/base-table.component.html',
  styleUrls: ['./base-table/base-table.component.scss']
})
export class ConstructTableComponent extends BaseTableComponent implements OnChanges {
  @Input() constructs: Construct[];
  @Input() minimal = false;
  @Input() hierarchical = false;
  @Input() showTimestamp = false;
  @Input() isRelation = false; // must be true if the constructs are of type ActivityConstruct
  @Input() sliderEnabled: boolean;
  @Input() userIds: number[];

  @Input() loggingSubject = 'ConstructTable';

  constructHeaders = {
    average_score: 'average',
    relation_type: 'relation',
    timestamp: 'updated'
  };
  constructValues = {
    score: ((construct: Construct) => this.percentPipe.transform(ConstructStatic.getLatestScore(construct, this.userIds))),
    average_score: ((construct: Construct) => this.percentPipe.transform(construct.latest_average_score?.score)),
    timestamp: ((construct: Construct) => {
      return construct.latest_average_score && this.datePipe.transform(construct.latest_average_score.timestamp);
    })
  };
  constructSortValues = {
    name: ((construct: Construct) => construct.name && construct.name.toLowerCase()),
    score: ((construct: Construct) => ConstructStatic.getLatestScore(construct, this.userIds) * 100 || 0),
    average_score: ((construct: Construct) => construct.latest_average_score?.score * 100 || 0),
    timestamp: ((construct: Construct) => construct.latest_average_score?.timestamp)
  };
  classes = {
    name: (construct => ConstructStatic.isConstructNegative(construct) ? 'negative-color' : '')
  };
  constructLinks = {};

  // Override @Input() from BaseTableComponent
  data; sliderKey; childKey;
  sliderMin = 0;
  sliderMax = 100;

  constructor(private route: ActivatedRoute,
              private datePipe: DatePipe,
              private percentPipe: PercentPipe,
              logger: LoggingService,
              toaster: ToastService) {
    super(logger, toaster);
    Object.assign(this.constructLinks, {
      name: (construct => ['/', 'collections', this.route.snapshot.params.collectionId, 'constructs', construct.id])
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.keys) {
        this.keys = ['name', 'score', 'average_score'];
    }

    if (this.minimal) {
      this.sliderEnabled = this.sliderEnabled || false;
    }

    const averageScoreIdx = this.keys.indexOf('average_score');
    if (averageScoreIdx !== -1) {
      if (this.constructs.find(construct => construct.latest_average_score)) {
        if (this.sliderEnabled === undefined || this.sliderEnabled) {
          this.sliderKey = 'average_score';
        }
      } else {
        this.keys.splice(averageScoreIdx, 1);
      }
    }

    const userScoreIdx = this.keys.indexOf('score');
    if (userScoreIdx !== -1) {
      if (this.constructs.find(construct => ConstructStatic.getLatestScore(construct, this.userIds))) {
        if (this.sliderEnabled === undefined || this.sliderEnabled) {
          this.sliderKey = 'score';
        }
      } else {
        this.keys.splice(userScoreIdx, 1);
      }
    }

    if (this.showTimestamp && this.keys.indexOf('timestamp') === -1) {
      this.keys.push('timestamp');
    }

    if (this.isRelation && this.keys.indexOf('relation_type') === -1) {
      this.keys.push('relation_type');

      // Remove description, because this property is not set on relations
      const descriptionIdx = this.keys.indexOf('description');
      if (descriptionIdx !== -1) {
        this.keys.splice(descriptionIdx, 1);
      }
    }

    this.injectDefaults(this.headerOverrides, this.constructHeaders);
    this.injectDefaults(this.valueOverrides, this.constructValues);
    this.injectDefaults(this.sortValueOverrides, this.constructSortValues);
    this.injectDefaults(this.routerLinks, this.constructLinks);

    if (this.hierarchical) {
      this.childKey = 'head_constructs';

      const childConstructIds = [];
      for (const construct of this.constructs) {
        for (const childConstruct of construct[this.childKey]) {
          childConstructIds.push(childConstruct.id);
        }
      }

      this.data = this.constructs.filter(construct => childConstructIds.indexOf(construct.id) === -1); // filter out child constructs
    } else {
      this.data = this.constructs;
    }

    super.ngOnChanges(changes);
  }

}
