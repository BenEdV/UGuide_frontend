import { TestBed } from '@angular/core/testing';

import { ScoreService } from './score.service';

describe('ScoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScoreService = TestBed.inject(ScoreService);
    expect(service).toBeTruthy();
  });
});
