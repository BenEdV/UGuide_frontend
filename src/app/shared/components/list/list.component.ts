import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnChanges {
  @Input() items: any[];
  @Input() headers: string[] = [];
  @Input() showHeaders = false;
  @Input() label = 'name';
  @Input() getLabel: {[header: string]: (item) => any} = {};

  @Output() delete = new EventEmitter<any>();
  showDelete = false;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    this.showDelete = this.delete.observers.length > 0;
    if (this.headers.length === 0 && this.items.length > 0 && this.label) {
      if (this.items[0][this.label] || this.getLabel[this.label]) {
        this.headers = [this.label];
      }
    }
  }

  emitDelete(item: any) {
    this.delete.emit(item);
  }

}
