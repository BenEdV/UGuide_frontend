import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstructListComponent } from './construct-list.component';

describe('ConstructListComponent', () => {
  let component: ConstructListComponent;
  let fixture: ComponentFixture<ConstructListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConstructListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstructListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
