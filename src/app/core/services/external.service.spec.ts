import { TestBed } from '@angular/core/testing';

import { ExternalService } from './external.service';

describe('ExternalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ExternalService = TestBed.inject(ExternalService);
    expect(service).toBeTruthy();
  });
});
