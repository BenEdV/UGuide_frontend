import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-dropdown',
  templateUrl: './base-dropdown.component.html',
  styleUrls: ['./base-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => BaseDropdownComponent),
    }
  ]
})
export class BaseDropdownComponent implements ControlValueAccessor, OnInit {
  @Input() items: any[];
  @Input() selectedItem;
  @Input() placeholder = '';
  @Input() bindLabel = 'name';
  @Input() bindValue;
  @Input() multiple = false;
  @Input() groupByFn: (item: any) => any;
  @Input() getCSS: (item: any) => string = (item => '');
  @Input() getLabel: (item: any) => any;

  @Output() selectionChange = new EventEmitter();
  @Output() remove = new EventEmitter();

  propagateChange = (_: any) => {};
  propagateTouch = (_: any) => {};

  constructor() { }

  ngOnInit() {
    if (this.getLabel) {
      return;
    }

    if (this.bindLabel) {
      this.getLabel = item => item[this.bindLabel];
    }

    if (!this.getLabel) {
      this.getLabel = item => item;
    }
  }

  writeValue(value: any) {
    this.selectedItem = value;
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn) {
    this.propagateTouch = fn;
  }

  registerChange($event) {
    this.propagateChange($event);
    this.selectionChange.emit($event);
  }

  propagateRemove($event) {
    this.remove.emit($event);
  }

}
