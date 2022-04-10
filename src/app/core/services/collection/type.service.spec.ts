import { TestBed } from '@angular/core/testing';

import { TypeService } from './type.service';

describe('TypeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TypeService = TestBed.inject(TypeService);
    expect(service).toBeTruthy();
  });
});
