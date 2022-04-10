import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxGroupTestComponent } from './checkbox-group-test.component';

describe('CheckboxGroupTestComponent', () => {
  let component: CheckboxGroupTestComponent;
  let fixture: ComponentFixture<CheckboxGroupTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckboxGroupTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxGroupTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
