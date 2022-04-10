import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { LoggingService } from '../../../core/services/logging.service';

type limitType = number | 'line';

@Component({
  selector: 'app-read-more',
  templateUrl: './read-more.component.html',
  styleUrls: ['./read-more.component.scss']
})
export class ReadMoreComponent implements OnChanges, AfterViewInit {
  @ViewChild('ellipsisElement') ellipsesElement: ElementRef;
  @Input() content: string;
  @Input() limit: limitType = 'line';
  @Input() isCollapsed = true;
  @Input() loggingSubject = 'ReadMore';

  originalLength: number;
  charLimit: number;
  hideReadMore = false;

  constructor(private loggingService: LoggingService, private changeDetector: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.content) {
      this.content = '';
    }

    this.originalLength = this.content.length;

    if (this.limit !== 'line') {
      this.charLimit = this.limit;
    }
  }

  ngAfterViewInit() {
    if (this.limit === 'line') {
      this.updateShowReadMore();
      this.changeDetector.detectChanges();
    }
  }

  toggleView() {
    this.isCollapsed = !this.isCollapsed;
    if (this.limit !== 'line') {
      this.charLimit = this.isCollapsed ? this.limit : this.originalLength;
    }

    this.loggingService.event(this.loggingSubject, 'Toggle', {isCollapsed: this.isCollapsed});
  }

  updateShowReadMore() {
    this.hideReadMore = this.ellipsesElement.nativeElement.offsetWidth >= this.ellipsesElement.nativeElement.scrollWidth;
  }

}
