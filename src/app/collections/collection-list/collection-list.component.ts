import { Component, OnInit } from '@angular/core';
import { Collection } from '../../core/interfaces/collection';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.scss']
})
export class CollectionListComponent implements OnInit {
  collections: Collection[];

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.collections = this.route.snapshot.data.collections;
  }

}
