import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-checkbox-group',
  templateUrl: './checkbox-group.component.html',
  styleUrls: ['./checkbox-group.component.scss']
})
export class CheckboxGroupComponent implements OnInit {
  @Input() data: any[];
  @Input() nameKey: string;           // property that is used as label after the checkbox
  @Input() checked: boolean[] = [];   // pre-checked items, per index a boolean
  @Input() hideParent = true;

  @Output() checkedChange = new EventEmitter<{items: object[], list: boolean[]}>();

  parentCheckbox: boolean;

  constructor() { }

  ngOnInit() {
    if (this.checked.length < this.data.length) {
      const toAdd = this.data.length - this.checked.length;
      for (let i = 0; i < toAdd; i++) {
        this.checked.push(false);
      }
    }
  }

  updateParentCheckbox(childChecked: boolean = true) {
    if (!childChecked) {
      this.parentCheckbox = false;
    } else {
      this.parentCheckbox = this.checked.every(value => value);
    }
    this.emitChecked();
  }

  updateChildCheckboxes() {
    this.checked.fill(this.parentCheckbox);
    this.emitChecked();
  }

  emitChecked() {
    const result = [];
    for (let i = 0; i < this.checked.length; i++) {
      if (this.checked[i]) {
        result.push(this.data[i]);
      }
    }

    this.checkedChange.emit({items: result, list: this.checked});
  }

}
