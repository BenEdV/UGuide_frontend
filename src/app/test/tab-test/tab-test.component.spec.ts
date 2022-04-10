import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabTestComponent } from './tab-test.component';

describe('TabTestComponent', () => {
  let component: TabTestComponent;
  let fixture: ComponentFixture<TabTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
