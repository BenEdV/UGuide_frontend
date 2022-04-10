import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationConstructComponent } from './administration-construct.component';

describe('AdministrationConstructComponent', () => {
  let component: AdministrationConstructComponent;
  let fixture: ComponentFixture<AdministrationConstructComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdministrationConstructComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationConstructComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
