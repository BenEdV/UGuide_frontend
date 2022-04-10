import { Directive, Input, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appMultiline]'
})
export class MultilineDirective implements OnChanges {
  @Input() appMultilineOf: string;

  constructor(private template: TemplateRef<any>, private viewContainer: ViewContainerRef) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.appMultilineOf) {
      this.viewContainer.clear();

      if (changes.appMultilineOf.currentValue) {
        const lines = this.getSplitLines(this.appMultilineOf);
        lines.forEach((line: string, index: number) => {
          this.viewContainer.createEmbeddedView(this.template, {
            $implicit: line,
            index
          });
        });
      }
    }
  }

  private getSplitLines(input: string) {
    return input.split('\n');
  }

}
