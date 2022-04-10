import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Construct } from '../../core/interfaces/construct';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityStatic } from '../../activity/activity.static';
import { Collection } from '../../core/interfaces/collection';
import { ScoreService } from '../../core/services/collection/constructs/score.service';
import { map } from 'rxjs/operators';
import { Score } from '../../core/interfaces/score';
import { LoggingService } from '../../core/services/logging.service';
import { Activity } from '../../core/interfaces/activity';
import { TranslateService } from '@ngx-translate/core';

interface ChartConstructType {
  type: string;
  isNegative: boolean;
}

interface ChartComparisonType {
  name: string;
  collection_id: number;
  active: boolean;
}

@Component({
  selector: 'app-knowledge-map-component',
  templateUrl: './knowledge-map.component.html',
  styleUrls: ['./knowledge-map.component.scss']
})
export class KnowledgeMapComponent implements OnInit, AfterViewInit {
  @ViewChild('tooltip') socialComparisonTooltip;
  collection: Collection;
  constructs: Construct[];
  childKey = 'head_constructs';

  constructTypes: ChartConstructType[] = [
    {
      type: 'concept',
      isNegative: false
    },
    {
      type: 'misconception',
      isNegative: true
    }
  ];

  socialComparisonGroups: ChartComparisonType[] = [];

  datasetsByType = {};
  labelsByType = {};
  containerHeightByType = {};

  selectedConstruct;
  selectedActivities;

  ignoreChartClick = false; // ignore the first chart click that will be automatically triggered after a label click

  routerLinkHelper = ActivityStatic.routerLinkHelper;

  constructor(public route: ActivatedRoute,
              private router: Router,
              private scoreService: ScoreService,
              private translate: TranslateService,
              private loggingService: LoggingService) { }

  ngOnInit() {
    this.constructs = this.route.snapshot.data.constructs;
    this.constructs = this.constructs.filter(construct => construct.my_latest_score || construct.latest_average_score);
    this.collection = this.route.snapshot.data.collection;

    this.socialComparisonGroups.push(
      {
        name: 'construct.knowledge.course_average',
        collection_id: +this.collection.id,
        active: this.collection.user_settings && this.collection.id === this.collection.user_settings.comparison_collection_id
      }
    );

    for (const subcollection of this.collection.subcollections) {
      this.socialComparisonGroups.push(
        {
          name: 'construct.knowledge.' + subcollection.name, // add 'construct.knowledge.' prefix for translation
          collection_id: +subcollection.id,
          active: this.collection.user_settings && subcollection.id === this.collection.user_settings.comparison_collection_id
        }
      );
    }

    if (!this.socialComparisonGroups.some(group => group.active)) {
      this.socialComparisonGroups[0].active = true;
    }

    this.prefetchAllScores();

    this.updateCharts();
  }

  ngAfterViewInit() {
    if (this.socialComparisonTooltip) {
      this.socialComparisonTooltip.open();
    }
  }

  prefetchAllScores() {
    for (const group of this.socialComparisonGroups) {
      this.scoreService.get(null, [group.collection_id], null, 'all').subscribe();
    }
  }

  updateCharts() {
    for (const constructType of this.constructTypes) {
      const parents = this.getParentConstructsOfType(constructType.type);
      if (!this.labelsByType[constructType.type]) {
        this.labelsByType[constructType.type] = this.getLabelTree(parents);
      }
      this.datasetsByType[constructType.type] = this.getDatasetTree(parents, constructType);
      this.setContainerHeight(constructType.type, this.countLabels(this.labelsByType[constructType.type]));
    }
  }

  getParentConstructsOfType(type: string): Construct[] {
    const constructsOfType = this.constructs.filter(construct => construct.type === type);

    const childConstructIds = [];
    for (const construct of constructsOfType) {
      for (const childConstruct of construct[this.childKey]) {
        childConstructIds.push(childConstruct.id);
      }
    }

    return constructsOfType.filter(construct => childConstructIds.indexOf(construct.id) === -1);
  }

  getLabelTree(constructs: Construct[], idsOfExpanded: number[] = []) {
    return this.createTree(constructs, (construct => construct.name), 'label', this.childKey, idsOfExpanded);
  }

  getDatasetTree(constructs: Construct[], constructType: ChartConstructType, idsOfExpanded: number[] = []) {
    const activeComparisonGroup = this.socialComparisonGroups.find(group => group.active);

    return this.scoreService.get(null, [activeComparisonGroup.collection_id], null, 'all')
      .pipe(
        map(scores => {
          return [
            {
              label: 'Score',
              data: this.createTree(
                constructs,
                (construct => construct.my_latest_score ? (constructType.isNegative ? -1 : 1) * construct.my_latest_score.score * 100 : 0),
                'value',
                this.childKey,
                idsOfExpanded
              )
            },
            {
              label: this.translate.instant(activeComparisonGroup.name) +  ' score',
              data: this.createTree(
                constructs,
                (construct => {
                  const score: Score = (scores as Score[]).find(constructScore => constructScore.construct_id === construct.id);

                  if (!score) {
                    return 0;
                  }

                  return (constructType.isNegative ? -1 : 1) * score.score * 100;
                }),
                'value',
                this.childKey,
                idsOfExpanded
              )
            }
          ];
        }
      )
    );
  }

  createTree(constructs: Construct[], valueCallback: ((construct: Construct) => any), nodeKey: string,
             childKey: string, idsOfExpanded: number[] = [], level: number = 0, parentId: number = -1) {
    const tree = [];
    for (const construct of constructs) {
      const node = {
        id: construct.id,
        parentId,
        barThickness: 15 - (5 * level),
      };

      if (idsOfExpanded.indexOf(construct.id) !== -1) {
        Object.assign(node, {expand: true}); // 'expand' can also be 'focus' to only show this node (and its children)
      }

      node[nodeKey] = valueCallback(construct);

      if (construct[childKey].length > 0) {
        Object.assign(node, {
          children: this.createTree(construct[childKey], valueCallback, nodeKey, childKey, idsOfExpanded,
            level + 1, construct.id)
        });
      }

      tree.push(node);
    }

    return tree;
  }

  expandLabel(label) {
    const construct = this.findConstructWithId(label.id);

    const listOfExpanded = this.idsOfExpanded(this.labelsByType[construct.type]);
    listOfExpanded.push(label.id);

    const parents = this.getParentConstructsOfType(construct.type);
    this.labelsByType[construct.type] = this.getLabelTree(parents, listOfExpanded);
    this.setContainerHeight(construct.type, this.countLabels(this.labelsByType[construct.type]));
  }

  updateLabelsFromNodes(chart, type: string) {
    if (chart && chart.chart) {
      const listOfExpanded = this.idsOfExpanded(chart.chart.scales['y-axis-0']._nodes);

      const parents = this.getParentConstructsOfType(type);
      this.labelsByType[type] = this.getLabelTree(parents, listOfExpanded);
      this.setContainerHeight(type, this.countLabels(this.labelsByType[type]));
    }
  }

  idsOfExpanded(labels) {
    const result = [];

    for (const label of labels) {
      if (label.expand) {
        result.push(label.id);
      }

      if (label.parentId !== -1) {
        result.push(label.parentId);
      }

      if (label.children) {
        result.concat(this.idsOfExpanded(label.children));
      }
    }

    return result;
  }

  labelClick($event) {
    this.ignoreChartClick = true;
    const constructLabel = $event.chart.config.data.labels[$event.dataIndex];
    if (constructLabel.children && constructLabel.children.length > 0) {
      this.expandLabel(constructLabel);
    } else {
      this.router.navigate(
        ['/', 'collections', this.route.snapshot.params.collectionId, 'constructs', constructLabel.id]
      );
    }
  }

  chartClick($eventAndChart, type: string) {
    if (this.ignoreChartClick) {
      this.ignoreChartClick = false;
      return;
    }

    const $event = $eventAndChart[0];
    if ($event.active.length > 0) {
      const constructLabel = $event.active[0]._view.label;

      if (constructLabel.children && constructLabel.children.length > 0) {
        this.expandLabel(constructLabel);
      } else {
        this.router.navigate(
          ['/', 'collections', this.route.snapshot.params.collectionId, 'constructs', constructLabel.id]
        );
      }
    } else {
      const chart = $eventAndChart[1];
      this.updateLabelsFromNodes(chart, type);
    }
  }

  labelHover($event) {
    this.setActivities($event.chart.config.data.labels[$event.dataIndex].id);
  }

  chartHover($event) {
    if ($event.points.length > 0) {
      this.setActivities($event.points[0]._view.label.id);
    }
  }

  findConstructWithId(id: number) {
    return this.constructs.find(construct => construct.id === id);
  }

  setActivities(constructId) {
    const construct = this.findConstructWithId(constructId);
    this.selectedConstruct = construct;
    if (construct) {
      this.selectedActivities = construct.activities.filter(activity => activity.type.split('.')[0] === 'material');
    }
  }

  setSocialComparison(comparison: ChartComparisonType) {
    if (comparison.active) { // if the comparison is already active, we can ignore the event
      return;
    }

    this.socialComparisonGroups.map(socialComparison => socialComparison.active = false);
    comparison.active = true;

    this.loggingService.event('SocialComparison', 'Change', comparison);

    this.updateCharts();
  }

  countLabels(labels): number {
    let expandedLabels = labels.length;

    for (const label of labels) {
      if (label.expand && label.children) {
        expandedLabels--; // remove the parent that is open
        expandedLabels += this.countLabels(label.children);
      }
    }

    return expandedLabels;
  }

  setContainerHeight(type: string, barCount: number) {
    const heightForBars = 60;
    this.containerHeightByType[type] = barCount * heightForBars + 'px';
  }

  logActivityClick(activity: Activity) {
    this.loggingService.event('StudyMaterialList', 'Click', {
      construct_id: this.selectedConstruct.id,
      activity_id: activity.id
    });
  }

}
