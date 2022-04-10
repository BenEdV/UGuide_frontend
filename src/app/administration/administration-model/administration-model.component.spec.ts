import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationModelComponent } from './administration-model.component';

describe('AdministrationModelComponent', () => {
  let component: AdministrationModelComponent;
  let fixture: ComponentFixture<AdministrationModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrationModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
