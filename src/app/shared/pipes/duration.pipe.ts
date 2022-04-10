import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import * as moment from 'moment';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {

  constructor(private translate: TranslateService) { }

  transform(value: string, ...args: unknown[]) {
    const locale = new HumanizeDurationLanguage();
    const humanizer = new HumanizeDuration(locale);

    const durationInMilliseconds = moment.duration(value).asMilliseconds();

    const options = {
      language: this.translate.currentLang,
      largest: 2,
      round: true
    };
    return humanizer.humanize(durationInMilliseconds, options);
  }
}
