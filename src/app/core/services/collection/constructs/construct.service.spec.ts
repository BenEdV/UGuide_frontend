import { TestBed } from '@angular/core/testing';

import { ConstructService } from './construct.service';

describe('ConstructService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConstructService = TestBed.inject(ConstructService);
    expect(service).toBeTruthy();
  });
});
