import { Component, OnInit } from '@angular/core';
import { BaseAdministrationComponent } from '../base-administration/base-administration.component';
import { ActivatedRoute } from '@angular/router';
import { Connector, ConnectorType } from '../../core/interfaces/connector';
import { ConnectorService } from '../../core/services/collection/connector.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-administration-connector',
  templateUrl: './administration-connector.component.html',
  styleUrls: ['./administration-connector.component.scss']
})
export class AdministrationConnectorComponent extends BaseAdministrationComponent implements OnInit {
  connectors: Connector[];
  connectorTypes: ConnectorType[];
  callbackURL: string;
  lrsInfo: any;

  addForm = new FormGroup({
    type: new FormControl(null, Validators.required),
    title: new FormControl('', Validators.required),
    remindo: new FormGroup({
      base_url: new FormControl('', Validators.required),
      uuid: new FormControl('', Validators.required),
      secret: new FormControl('', Validators.required)
    })
  });

  editForm = new FormGroup({
    title: new FormControl('', Validators.required),
    remindo: new FormGroup({
      base_url: new FormControl(''),
      uuid: new FormControl(''),
      secret: new FormControl('')
    })
  });

  constructor(private route: ActivatedRoute, private connectorService: ConnectorService, modal: NgbModal) {
    super(route, modal);
  }

  ngOnInit() {
    this.connectors = this.route.snapshot.data.connectors;
    this.connectorTypes = [{ // TODO: retrieve supported types
      name: 'remindo'
    }];

    const connector = super.resolveEditId(this.connectors);
    if (connector) {
      this.setEditingItem(connector);
      this.editModal.open();
    }
  }

  add() {
    if (this.validateForm(this.addForm)) {
      this.connectorService.add(
        this.addC.title.value,
        this.addC.type.value.name,
        this.addC.remindo.value
      ).subscribe(res => this.connectors = res.all);

      this.addForm.patchValue({
        title: '',
        type: null,
        remindo: {
          base_url: '',
          uuid: '',
          secret: ''
        }
      });
      this.finaliseAdd();
    }
  }

  setEditingItem(connector: Connector) {
    super.setEditingItem(connector);
    this.editForm.patchValue({
      type: connector.type,
      title: connector.title,
      remindo: {
        base_url: '',
        uuid: '',
        secret: ''
      }
    });
    if (connector.type === 'remindo') {
      this.editForm.patchValue({
        remindo: connector.settings
      });
      this.callbackURL = this.connectorService.callbackURL(connector);
    }
    if (connector.type === 'lrs') {
      this.lrsInfo = (connector as any).keys[0];
      this.lrsInfo.url = (connector as any).public_base_url;
    }
  }

  edit() {
    if (this.validateForm(this.editForm)) {
      if (this.editingItem.type === 'remindo') {
        this.connectorService.edit(
          this.editingItem.id,
          this.editC.title.value,
          this.editC.remindo.value
        ).subscribe((res: Connector) => this.connectors = this.overwriteMemory(this.connectors, [res]));
        this.finaliseEdit();
      } else {
        this.connectorService.edit(
          this.editingItem.id,
          this.editC.title.value
        ).subscribe((res: Connector) => this.connectors = this.overwriteMemory(this.connectors, [res]));
        this.finaliseEdit();
      }
    }
  }

  delete() {
    this.connectorService.delete(this.deletingItem.id).pipe(
        switchMap(() => this.connectorService.all()) // override default return value of all activities
      ).subscribe((res: Connector[]) => this.connectors = res);
  }
}
