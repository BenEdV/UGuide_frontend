import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'grade'
})
export class GradePipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): string {
    if (!value) {
      return '0';
    }

    return (+value).toFixed(1);
  }

}
