import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SamlLogoutComponent } from './saml-logout.component';

describe('SamlLogoutComponent', () => {
  let component: SamlLogoutComponent;
  let fixture: ComponentFixture<SamlLogoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SamlLogoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SamlLogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
