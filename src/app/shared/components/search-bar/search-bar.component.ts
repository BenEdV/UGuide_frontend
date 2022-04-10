import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnChanges {
  @Input() text = '';
  @Input() placeholder = '';
  @Output() textChange = new EventEmitter<{text: string, exact: boolean, raw: string}>();

  private previousText: string;

  static makeFilterAbsolute(filter: string): string {
    return '"' + filter + '"';
  }

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.text && this.text && this.text.length > 0 && this.text !== this.previousText) {
      this.updateText();
    }
  }

  keyUp($event) {
    if ($event.key === 'Escape') {
      this.text = '';
    }

    if (this.text !== this.previousText) { // only emit if there have been changes
      this.updateText();
    }
  }

  updateText() {
    let exact = false;
    let filterText = this.text;

    if (this.text.length > 2 && this.text[0] === '"' && this.text[this.text.length - 1] === '"') {
      exact = true;
      filterText = this.text.slice(1, this.text.length - 1);
    }

    this.previousText = this.text;
    this.textChange.emit({text: filterText, exact, raw: this.text});
  }

}
