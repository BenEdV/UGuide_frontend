import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationMappingComponent } from './administration-mapping.component';

describe('AdministrationMappingComponent', () => {
  let component: AdministrationMappingComponent;
  let fixture: ComponentFixture<AdministrationMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrationMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
