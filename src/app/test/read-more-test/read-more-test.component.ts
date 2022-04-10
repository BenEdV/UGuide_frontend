import { Component, OnInit } from '@angular/core';
import { ConstructStatic } from '../../constructs/construct.static';
import { FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-read-more-test',
  templateUrl: './read-more-test.component.html',
  styleUrls: ['./read-more-test.component.scss']
})
export class ReadMoreTestComponent implements OnInit {

  constructs = [
    {
      id: 1,
      name: 'Anxiety',
      model: 2,
      type: 'negative_trait'
    },
    {
      id: 2,
      name: 'Something',
      model: 2,
      type: 'negative_trait'
    },
    {
      id: 3,
      name: 'Else',
      model: 2,
      type: 'positive_trait'
    },
    {
      id: 4,
      name: 'Other',
      model: 1,
    type: 'positive_trait'
    },
    {
      id: 5,
      name: 'Extra',
      model: 3,
      type: 'positive_trait'
    },
    {
      id: 6,
      name: 'Boo',
      model: 3,
      type: 'positive_trait'
    },
  ];

  formX = new FormGroup({
    x: new FormControl(null, {})
  });

  test = 3;
  isNegative = ConstructStatic.isConstructNegative;

  multilineTest = '1\n2';

  constructor() { }

  ngOnInit() {
    // setInterval(() => {
    //   this.multilineTest = '';
    //
    //   for (let i = 0; i < 10; i++) {
    //     if (Math.random() < 0.7) {
    //       this.multilineTest += Math.random().toFixed(2) + '\n';
    //     }
    //   }
    // }, 5000);
  }

  update() {
    this.formX.patchValue({
      x: 3
    });
  }

}
