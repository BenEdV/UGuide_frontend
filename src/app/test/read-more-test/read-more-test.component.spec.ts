import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadMoreTestComponent } from './read-more-test.component';

describe('ReadMoreTestComponent', () => {
  let component: ReadMoreTestComponent;
  let fixture: ComponentFixture<ReadMoreTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadMoreTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadMoreTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
