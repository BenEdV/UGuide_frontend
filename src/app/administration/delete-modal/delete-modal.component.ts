import { Component, EventEmitter, Input, OnChanges, Output, ViewChild, SimpleChanges } from '@angular/core';
import { Construct } from 'src/app/core/interfaces/construct';
import { Activity } from 'src/app/core/interfaces/activity';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss']
})
export class DeleteModalComponent implements OnChanges {
  @ViewChild('deleteModal', {static: true}) modal;
  @Input() deletingItem: Construct & Activity;
  @Output() delete = new EventEmitter();

  nLinkedConstructs = 0;
  nLinkedActivities = 0;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    this.nLinkedConstructs = 0;
    this.nLinkedActivities = 0;

    if (this.deletingItem) {
      this.nLinkedConstructs += this.deletingItem.constructs && this.deletingItem.constructs.length || 0;
      this.nLinkedConstructs += this.deletingItem.head_constructs && this.deletingItem.head_constructs.length || 0;
      this.nLinkedConstructs += this.deletingItem.tail_constructs && this.deletingItem.tail_constructs.length || 0;

      this.nLinkedActivities += this.deletingItem.activities && this.deletingItem.activities.length || 0;
      this.nLinkedActivities += this.deletingItem.head_activities && this.deletingItem.head_activities.length || 0;
      this.nLinkedActivities += this.deletingItem.tail_activities && this.deletingItem.tail_activities.length || 0;
    }
  }

  emitDelete() {
    this.delete.emit(this.deletingItem);
  }

  open() {
    this.modal.open();
  }

  close(reason: string) {
    this.modal.close(reason);
  }

}
