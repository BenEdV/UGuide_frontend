import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

// This pipe hijacks the angular default `date` pipe to allow localization
@Pipe({
    name: 'date'
})
class DatePipeProxy implements PipeTransform {

    constructor(private translate: TranslateService) { }

    public transform(value: any, pattern: string = 'mediumDate'): string {
        const ngPipe = new DatePipe(this.translate.currentLang);
        if (pattern === 'monthDay') {
          if (this.translate.currentLang === 'en') {
            pattern = 'MMM d';
          } else if (this.translate.currentLang === 'nl') {
            pattern = 'd MMM';
          }
        }
        return ngPipe.transform(value, pattern);
    }

}

export {DatePipeProxy as DatePipe};
