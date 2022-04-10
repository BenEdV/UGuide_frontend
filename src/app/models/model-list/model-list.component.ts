import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Model } from '../../core/interfaces/model';

@Component({
  selector: 'app-construct-list',
  templateUrl: './model-list.component.html',
  styleUrls: ['./model-list.component.scss']
})
export class ModelListComponent implements OnInit {
  models: Model[];

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.models = this.route.snapshot.data.models;
  }

}
