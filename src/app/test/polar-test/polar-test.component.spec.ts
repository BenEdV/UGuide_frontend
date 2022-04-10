import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PolarTestComponent } from './polar-test.component';

describe('PolarTestComponent', () => {
  let component: PolarTestComponent;
  let fixture: ComponentFixture<PolarTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PolarTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolarTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
