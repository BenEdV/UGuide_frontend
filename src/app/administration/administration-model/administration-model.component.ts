import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Model } from '../../core/interfaces/model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseAdministrationComponent } from '../base-administration/base-administration.component';
import { ModelService } from '../../core/services/collection/constructs/model.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-administration-construct-list',
  templateUrl: './administration-model.component.html',
  styleUrls: ['./administration-model.component.scss']
})
export class AdministrationModelComponent extends BaseAdministrationComponent implements OnInit {
  models: Model[];
  modelTypes: any[];

  addForm = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
    method: new FormControl(null, Validators.required)
  });

  editForm = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
    method: new FormControl(null, Validators.required)
  });

  constructor(private route: ActivatedRoute, private modelService: ModelService, modal: NgbModal) {
    super(route, modal);
  }

  ngOnInit() {
    this.models = this.route.snapshot.data.models;
    this.modelTypes = this.route.snapshot.data.types.models;

    const model = super.resolveEditId(this.models);
    if (model) {
      this.setEditingItem(model);
      this.editModal.open();
    }
  }

  add() {
    if (this.validateForm(this.addForm)) {
      this.modelService.add(
        this.addC.name.value,
        this.addC.description.value,
        this.addC.method.value.name
      ).subscribe(res => this.models = res.all);
      this.addForm.patchValue({
        name: '',
        description: '',
        method: null
      });
      this.finaliseAdd();
    }
  }

  setEditingItem(model: Model) {
    super.setEditingItem(model);

    this.editForm.patchValue({
      name: model.name,
      description: model.description,
      method: model.method,
    });
  }

  edit() {
    if (this.validateForm(this.editForm)) {
      if (this.editForm.dirty) {
        this.modelService.edit(
          this.editingItem.id,
          this.editC.name.value,
          this.editC.description.value,
          this.editC.method.value.name
        ).subscribe((res: Model) => this.models = this.overwriteMemory(this.models, [res]));
      }
      this.finaliseEdit();
    }
  }

  delete() {
    this.modelService.delete(this.deletingItem.id).subscribe((res: Model[]) => this.models = res);
  }
}
