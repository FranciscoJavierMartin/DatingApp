import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addSpaceBetweenComma'
})
export class AddSpaceBetweenCommaPipe implements PipeTransform {

  transform(values: string[]): string {
    return values.join(', ');
  }

}
