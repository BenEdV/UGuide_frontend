import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploadComponent,
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor {
  @ViewChild('fileInput', {static: true}) input: ElementRef;
  @Input() accept: string;
  @Input() multiple = false;
  private files: FileList = null;

  propagateChange = (_: any) => {};
  propagateTouch = (_: any) => {};

  @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
    this.files = event;
    this.propagateChange(this.files);
  }

  constructor() { }

  writeValue(value) {
    this.input.nativeElement.value = '';  // clear file input
    this.files = null;
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn) {
    this.propagateTouch = fn;
  }

}
