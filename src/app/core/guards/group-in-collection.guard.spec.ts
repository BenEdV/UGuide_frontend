import { TestBed, async, inject } from '@angular/core/testing';

import { GroupInCollectionGuard } from './group-in-collection.guard';

describe('GroupInCollectionGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroupInCollectionGuard]
    });
  });

  it('should ...', inject([GroupInCollectionGuard], (guard: GroupInCollectionGuard) => {
    expect(guard).toBeTruthy();
  }));
});
