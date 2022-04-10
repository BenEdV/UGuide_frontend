import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Connector } from '../../core/interfaces/connector';
import { BaseTableComponent } from './base-table/base-table.component';
import { LoggingService } from '../../core/services/logging.service';
import { ToastService } from '../../core/services/components/toast.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@shared/pipes/date.pipe';

@Component({
  selector: 'app-connector-table',
  templateUrl: './base-table/base-table.component.html',
  styleUrls: ['./base-table/base-table.component.scss']
})
export class ConnectorTableComponent extends BaseTableComponent implements OnChanges {
  @Input() connectors: Connector[];
  @Input() minimal = false;
  @Input() hierarchical = false;
  @Input() showTimestamp = false;
  @Input() showRelation = false;

  @Input() loggingSubject = 'connectorTable';

  connectorHeaders = {

  };
  connectorValues = {

  };
  connectorSortValues = {

  };
  connectorLinks = {};


  constructor(private route: ActivatedRoute,
              private datePipe: DatePipe,
              private logger: LoggingService,
              private toaster: ToastService) {
    super(logger, toaster);
    Object.assign(this.connectorLinks, {
      name: (connector => ['/', 'collections', this.route.snapshot.params.collectionId, 'connectors', connector.id])
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.keys) {
      this.keys = ['title'];
    }

    this.injectDefaults(this.headerOverrides, this.connectorHeaders);
    this.injectDefaults(this.valueOverrides, this.connectorValues);
    this.injectDefaults(this.sortValueOverrides, this.connectorSortValues);
    this.injectDefaults(this.routerLinks, this.connectorLinks);

    this.data = this.connectors;

    super.ngOnChanges(changes);
  }

}
