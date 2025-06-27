import { TestBed } from '@angular/core/testing';

import { LiveResultService } from './live-result.service';

describe('LiveResultService', () => {
  let service: LiveResultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
