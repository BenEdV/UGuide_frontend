import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationCollectionComponent } from './administration-collection.component';

describe('AdministrationCollectionComponent', () => {
  let component: AdministrationCollectionComponent;
  let fixture: ComponentFixture<AdministrationCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministrationCollectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
