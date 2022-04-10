import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

// This pipe translates string from the backend
@Pipe({
  name: 'contentTranslate'
})
class ContentTranslatePipeProxy implements PipeTransform {

  constructor(private translate: TranslateService) { }

  public transform(value: any): string {
    try {
      const content = JSON.parse(value);
      const translatedContent = content[this.translate.currentLang];
      return translatedContent;
    } catch (e) {
      return value;
    }
  }

}

export {ContentTranslatePipeProxy as ContentTranslatePipe};
