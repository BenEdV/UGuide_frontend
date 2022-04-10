import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Model } from '../../core/interfaces/model';

@Component({
  selector: 'app-construct-overview',
  templateUrl: './model-overview.component.html',
  styleUrls: ['./model-overview.component.scss']
})
export class ModelOverviewComponent implements OnInit {
  models: Model[];

  constructor(private route: ActivatedRoute) {
    this.models = this.route.snapshot.data.models;
  }

  ngOnInit() {
  }

}
