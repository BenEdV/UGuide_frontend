import { TestBed } from '@angular/core/testing';

import { ConnectorService } from './connector.service';

describe('ConnectorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConnectorService = TestBed.inject(ConnectorService);
    expect(service).toBeTruthy();
  });
});
