import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionTestComponent } from './permission-test.component';

describe('PermissionTestComponent', () => {
  let component: PermissionTestComponent;
  let fixture: ComponentFixture<PermissionTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermissionTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
