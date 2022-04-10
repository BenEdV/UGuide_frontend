import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { TableAction } from '../../core/interfaces/table-action';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-base-administration',
  templateUrl: './base-administration.component.html',
  styleUrls: ['./base-administration.component.scss']
})
export class BaseAdministrationComponent implements OnInit, OnDestroy {
  @ViewChild('addModal', {static: true}) addModal;
  @ViewChild('editModal', {static: true}) editModal;
  @ViewChild('deleteModal', {static: true}) deleteModal;

  addForm: FormGroup;
  editForm: FormGroup;

  editingItem;
  deletingItem;

  tableActions: TableAction[] = [
    {
      name: 'table.action.edit',
      icon: 'edit-icon',
      callback: item => {
        this.setEditingItem(item);
        if (this.editModal) {
          this.editModal.open();
        } else {
          console.error('Could not find app-modal component with #editModal template reference');
        }
      }
    },
    {
      name: 'table.action.delete',
      icon: 'delete-icon',
      callback: item => {
        this.setDeletingItem(item);
        if (this.deleteModal) {
          this.deleteModal.open();
        } else {
          console.error('Could not find app-modal component with #deleteModal template reference');
        }
      }
    }
  ];

  constructor(private baseRoute: ActivatedRoute, private modalService: NgbModal) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.modalService.dismissAll('Navigation');
  }

  get addC() {
    return this.addForm.controls;
  }

  get editC() {
    return this.editForm.controls;
  }

  setEditingItem(item) {
    this.editingItem = item;
  }

  setDeletingItem(item) {
    this.deletingItem = item;
  }

  validateForm(form: FormGroup): boolean {
    if (form.valid) {
      return true;
    } else {
      this.invalidateControls(form);
      return false;
    }
  }

  invalidateControls(form: FormGroup) {
    for (const controlKey of Object.keys(form.controls)) {
      const control = form.get(controlKey);
      control.markAsTouched({onlySelf: true});
    }
  }

  resetControls(form: FormGroup, patchValue: { [key: string]: any; }) {
    form.patchValue(patchValue);

    for (const key of Object.keys(patchValue)) {
      const control = form.controls[key];
      control.markAsPristine();
      control.markAsUntouched();
      control.updateValueAndValidity();
    }
  }

  resetFormValidation(form: FormGroup) {
    form.markAsUntouched();
    form.markAsPristine();
  }

  overwriteMemory(list: any[], res: any[]): any[] { // overwrites entries in the list
    for (const r of res) {
      let oldModel = list.find(model => model.id === r.id);

      if (oldModel) {
        oldModel = res;
      }
    }

    return [...list]; // return copy to trigger angular change detection
  }

  finaliseAdd() {
    this.addModal.close('Add Click');
    this.resetFormValidation(this.addForm);
  }

  finaliseEdit() {
    this.editModal.close('Edit Click');
  }

  add() {
    console.error('Add has not been implemented!');
  }

  edit() {
    console.error('Edit has not been implemented!');
  }

  delete() {
    console.error('Delete has not been implemented!');
  }

  resolveEditId(items: any[]) {
    let editId = this.baseRoute.snapshot.queryParams.editId;
    if (editId) {
      editId = +editId;
      return items.find(item => item.id === editId);
    }

    return null;
  }

  parseProperties(properties: AbstractControl) {
    const result = properties.value;
    for (const [key, value] of Object.entries(result)) {
      if (value === null) {
        delete result[key];
      }
    }

    return result;
  }
}
