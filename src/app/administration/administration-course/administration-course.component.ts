import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Collection } from '../../core/interfaces/collection';
import { BaseAdministrationComponent } from '../base-administration/base-administration.component';
import { CollectionService } from '../../core/services/collection/collection.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-administration-course',
  templateUrl: './administration-course.component.html',
  styleUrls: ['./administration-course.component.scss']
})
export class AdministrationCourseComponent extends BaseAdministrationComponent implements OnInit {
  collection: Collection;
  settings = {
    logging: false,
    social: {
      see_averages: false
    },
    experimental: {
      results: false,
      shift: false
    },
    allow_widgets: false
  };

  constructor(private route: ActivatedRoute, private collectionService: CollectionService, modal: NgbModal) {
    super(route, modal);
  }

  ngOnInit() {
    this.collection = this.route.snapshot.data.collection;

    if (!this.collection.settings) {
      this.collection.settings = {};
    }
    this.mergeOptions(this.collection.settings, this.settings);

    this.settings = this.collection.settings;
  }

  saveChanges() {
    this.collectionService.edit(this.collection.id, this.settings).subscribe();
  }

  mergeOptions(options, defaults, keyPath: string[] = []) {
    let optionsOfInterest = options;
    let defaultsOfInterest = defaults;
    for (const key of keyPath) {
      optionsOfInterest = optionsOfInterest[key];
      defaultsOfInterest = defaultsOfInterest[key];
    }

    if (typeof defaultsOfInterest !== 'object') { // Prevent infinite recursion due to Object.keys glitching on strings
      return;
    }

    for (const key of Object.keys(defaultsOfInterest)) {
      if (optionsOfInterest[key] === undefined) {
        optionsOfInterest[key] = defaultsOfInterest[key];
      } else {
        this.mergeOptions(options, defaults, [...keyPath, key]);
      }
    }
  }
}
