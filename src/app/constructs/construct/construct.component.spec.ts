import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstructComponent } from './construct.component';

describe('ConstructComponent', () => {
  let component: ConstructComponent;
  let fixture: ComponentFixture<ConstructComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConstructComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstructComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
