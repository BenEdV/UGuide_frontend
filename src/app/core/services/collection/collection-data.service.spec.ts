import { TestBed } from '@angular/core/testing';

import { CollectionDataService } from './collection-data.service';

describe('CollectionDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CollectionDataService = TestBed.inject(CollectionDataService);
    expect(service).toBeTruthy();
  });
});
