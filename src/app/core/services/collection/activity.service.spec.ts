import { TestBed } from '@angular/core/testing';

import { ActivityService } from './activity.service';

describe('ActivityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ActivityService = TestBed.inject(ActivityService);
    expect(service).toBeTruthy();
  });
});
