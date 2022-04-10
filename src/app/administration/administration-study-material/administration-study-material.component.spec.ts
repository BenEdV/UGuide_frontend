import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationStudyMaterialComponent } from './administration-study-material.component';

describe('AdministrationStudyMaterialComponent', () => {
  let component: AdministrationStudyMaterialComponent;
  let fixture: ComponentFixture<AdministrationStudyMaterialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrationStudyMaterialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationStudyMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
