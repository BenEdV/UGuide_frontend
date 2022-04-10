import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyOverviewComponent } from './privacy-overview.component';

describe('PrivacyOverviewComponent', () => {
  let component: PrivacyOverviewComponent;
  let fixture: ComponentFixture<PrivacyOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivacyOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
