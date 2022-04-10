import { Component, Input, OnInit } from '@angular/core';
import { CardAction } from '../../../core/interfaces/card-action';

type CardHighlightType = 'primary' | 'correct' | 'incorrect';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() icon: string | string[];
  @Input() title: string;
  @Input() subtitle: string;
  @Input() actions: CardAction[];

  @Input() highlight: CardHighlightType;
  @Input() bordered = false;

  icons: string[];

  constructor() { }

  ngOnInit() {
    if (this.icon) {
      this.icons = this.icon instanceof Array ? this.icon : [this.icon];
    }
  }

  showActionList(actionList: HTMLDivElement) {
    actionList.hidden = false;
  }

}
