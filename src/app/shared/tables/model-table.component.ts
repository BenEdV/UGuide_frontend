import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseTableComponent } from './base-table/base-table.component';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';
import { ActivatedRoute } from '@angular/router';
import { Model } from '../../core/interfaces/model';

@Component({
  selector: 'app-model-table',
  templateUrl: './base-table/base-table.component.html',
  styleUrls: ['./base-table/base-table.component.scss']
})
export class ModelTableComponent extends BaseTableComponent implements OnChanges {
  @Input() models: Model[];

  @Input() loggingSubject = 'ModelTable';

  allKeys = ['name', 'description'];
  modelLinks = {};

  // Override @Input() from BaseTableComponent
  data; sliderKey;

  constructor(private route: ActivatedRoute,
              private logger: LoggingService,
              private toaster: ToastService) {
    super(logger, toaster);
    Object.assign(this.modelLinks, {
      name: (model => ['/', 'collections', this.route.snapshot.params.collectionId, 'models', model.id])
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.keys = this.allKeys;

    this.injectDefaults(this.routerLinks, this.modelLinks);

    this.data = this.models;
    super.ngOnChanges(changes);
  }

}
