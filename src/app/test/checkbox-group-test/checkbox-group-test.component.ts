import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-checkbox-group-test',
  templateUrl: './checkbox-group-test.component.html',
  styleUrls: ['./checkbox-group-test.component.scss']
})
export class CheckboxGroupTestComponent implements OnInit {
  data = [
    {name: 'test1'},
    {name: 'test2'},
    {name: 'test3'},
    {name: 'test4'},
    {name: 'test5'},
    {name: 'test6'},
    {name: 'test7'},
  ];
  checked = [true];
  nameKey = 'name';

  constructor() { }

  ngOnInit() {
  }

  log(thing) {
    console.log(thing);
  }

}
