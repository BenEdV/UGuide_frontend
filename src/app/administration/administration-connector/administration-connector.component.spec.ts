import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationConnectorComponent } from './administration-connector.component';

describe('AdministrationConnectorComponent', () => {
  let component: AdministrationConnectorComponent;
  let fixture: ComponentFixture<AdministrationConnectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrationConnectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
