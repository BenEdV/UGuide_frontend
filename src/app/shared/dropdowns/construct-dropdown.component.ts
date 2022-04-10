import { Component, Input, forwardRef, SimpleChanges, OnChanges } from '@angular/core';
import { Model } from '../../core/interfaces/model';
import { ConstructStatic } from '../../constructs/construct.static';
import { BaseDropdownComponent } from './base-dropdown/base-dropdown.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Construct } from 'src/app/core/interfaces/construct';

@Component({
  selector: 'app-construct-dropdown',
  templateUrl: './base-dropdown/base-dropdown.component.html',
  styleUrls: ['./base-dropdown/base-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ConstructDropdownComponent),
    }
  ]
})
export class ConstructDropdownComponent extends BaseDropdownComponent implements OnChanges {
  @Input() models: Model[];
  @Input() constructs: Construct[];

  items = [];
  groupByFn = (item) => item.model.name;
  getCSS = (item) => ConstructStatic.isConstructNegative(item) ? 'negative-color' : '';

  constructor() {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.items = [];
    if (this.models && this.constructs) {
      for (const model of this.models) {
        for (const construct of model.constructs) {
          const realConstruct = this.constructs.find(c => c.id === construct.id);
          if (this.constructs && !realConstruct) { // if a construct is purposely left out
            continue;
          }
          const constructCopy = realConstruct ? {...realConstruct} : {...construct};
          Object.assign(constructCopy, {model});
          this.items.push(constructCopy);
        }
      }
    }
  }

}
