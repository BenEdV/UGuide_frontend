import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeMapComponent } from './knowledge-map.component';

describe('KnowledgeMapComponent', () => {
  let component: KnowledgeMapComponent;
  let fixture: ComponentFixture<KnowledgeMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnowledgeMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
