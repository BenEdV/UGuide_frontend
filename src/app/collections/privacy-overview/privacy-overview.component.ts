import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Collection } from '../../core/interfaces/collection';
import { Activity } from '../../core/interfaces/activity';
import { Construct } from '../../core/interfaces/construct';

@Component({
  selector: 'app-privacy-overview',
  templateUrl: './privacy-overview.component.html',
  styleUrls: ['./privacy-overview.component.scss']
})
export class PrivacyOverviewComponent implements OnInit {
  collection: Collection;

  constructor(private route: ActivatedRoute) {
    this.collection = this.route.snapshot.data.collection;
    console.log(this.collection);
  }

  ngOnInit() {
  }

}
