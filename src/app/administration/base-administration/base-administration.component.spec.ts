import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseAdministrationComponent } from './base-administration.component';

describe('BaseAdministrationComponent', () => {
  let component: BaseAdministrationComponent;
  let fixture: ComponentFixture<BaseAdministrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseAdministrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
