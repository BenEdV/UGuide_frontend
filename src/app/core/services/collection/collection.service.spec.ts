import { TestBed } from '@angular/core/testing';

import { CollectionService } from './collection.service';

describe('CollectionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CollectionService = TestBed.inject(CollectionService);
    expect(service).toBeTruthy();
  });
});
