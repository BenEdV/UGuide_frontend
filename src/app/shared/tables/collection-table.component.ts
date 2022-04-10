import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Collection } from 'src/app/core/interfaces/collection';
import { LoggingService } from 'src/app/core/services/logging.service';
import { ToastService } from 'src/app/core/services/components/toast.service';
import { BaseTableComponent } from './base-table/base-table.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { CollectionStatic } from 'src/app/collections/collection.static';

@Component({
  selector: 'app-collection-table',
  templateUrl: './base-table/base-table.component.html',
  styleUrls: ['./base-table/base-table.component.scss']
})
export class CollectionTableComponent extends BaseTableComponent implements OnChanges {
  @Input() collections: Collection[];
  @Input() hierarchical = true;

  collectionHeaders = {
    activity_count: 'activities',
    construct_model_count: 'models',
    member_count: 'members',
    connectors_count: 'connectors'
  };

  collectionRouterLinks = {
    name: (collection: Collection) => {
      const maySeeUserResults = this.authService.checkPermissions(['see_user_results'], collection);
      const route = CollectionStatic.getColectionRoute(maySeeUserResults);
      return ['/', 'collections', collection.id, route];
    }
  };

  // Override @Input() from BaseTableComponent
  data; sliderKey; childKey; sliderMin; sliderMax;

  constructor(private logger: LoggingService,
              private toaster: ToastService,
              private authService: AuthService) {
    super(logger, toaster);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.keys) {
      this.keys = ['name', 'activity_count', 'construct_model_count', 'member_count', 'connectors_count'];
    }

    this.injectDefaults(this.headerOverrides, this.collectionHeaders);
    this.injectDefaults(this.routerLinks, this.collectionRouterLinks);

    if (this.hierarchical) {
      this.childKey = 'subcollections';

      const childCollectionIds = [];
      for (const collection of this.collections) {
        for (const childConstruct of collection[this.childKey]) {
          childCollectionIds.push(childConstruct.id);
        }
      }

      this.data = this.collections.filter(collection => childCollectionIds.indexOf(collection.id) === -1); // filter out children
    } else {
      this.data = this.collections;
    }

    super.ngOnChanges(changes);
  }

}
