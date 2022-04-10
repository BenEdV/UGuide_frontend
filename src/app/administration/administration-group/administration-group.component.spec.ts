import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationGroupComponent } from './administration-group.component';

describe('AdministrationGroupComponent', () => {
  let component: AdministrationGroupComponent;
  let fixture: ComponentFixture<AdministrationGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrationGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
