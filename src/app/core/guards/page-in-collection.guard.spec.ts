import { TestBed, async, inject } from '@angular/core/testing';

import { PageInCollectionGuard } from './page-in-collection.guard';

describe('PageInCollectionGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PageInCollectionGuard]
    });
  });

  it('should ...', inject([PageInCollectionGuard], (guard: PageInCollectionGuard) => {
    expect(guard).toBeTruthy();
  }));
});
