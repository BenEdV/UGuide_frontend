import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Model } from '../../core/interfaces/model';
import { ToolbarService } from 'src/app/core/services/components/toolbar.service';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss']
})
export class ModelComponent implements OnInit, OnDestroy {
  model: Model;
  private dataSubscription;

  constructor(private route: ActivatedRoute, private toolbarService: ToolbarService) { }

  setModel(routeData) {
    this.model = routeData.model;

    this.toolbarService.addTab(
      {
        name: this.model.name,
        link: ['collections', routeData.collection.id, 'models', this.model.id]
      },
      routeData.collection
    );
  }

  ngOnInit() {
    this.dataSubscription = this.route.data.subscribe(routeData => this.setModel(routeData));
  }

  ngOnDestroy() {
    this.dataSubscription.unsubscribe();
  }

}
