import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LoggingService } from '../../../core/services/logging.service';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})

export class ModalComponent implements OnInit {
  @ViewChild('modalTmpl', {static: true}) modalTmpl;
  @Input() title: string;
  @Input() loggingSubject = 'Modal';
  @Input() size: ModalSize = 'md';

  @Output() closed = new EventEmitter<string>();

  private modal: NgbModalRef;
  private opened = false;

  private timeOpened: Date = null;

  constructor(public modalService: NgbModal, private loggingService: LoggingService) { }

  ngOnInit() {
  }

  get isOpen() {
    return this.opened;
  }

  open(autoOpen: boolean = false) {
    this.modal = this.modalService.open(this.modalTmpl, { size: this.size});
    this.opened = true;
    this.timeOpened = new Date();

    this.modal.result.then( // Log Dismiss
      () => {}, // Ignore success
      (eventNr) => {
        const reason = eventNr === 0 ? 'Backdrop' : 'EscPress';
        this.closed.emit(reason);
        const endTime = new Date();
        const timeWasOpen = endTime.getTime() - this.timeOpened.getTime();
        this.loggingService.event(this.loggingSubject, 'Close', { reason, timeWasOpen });
      }
    );
    this.loggingService.event(this.loggingSubject, 'Open', { autoOpen });
  }

  close(reason: string) {
    this.modal.close(reason);
    this.closed.emit(reason);
    this.opened = false;
    const endTime = new Date();
    const timeWasOpen = endTime.getTime() - this.timeOpened.getTime();
    this.loggingService.event(this.loggingSubject, 'Close', { reason, timeWasOpen });
  }

}
