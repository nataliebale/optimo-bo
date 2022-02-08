import { TestBed } from '@angular/core/testing';

import { PasswordStrengthService } from './password-strength.service';

describe('PasswordStrengthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PasswordStrengthService = TestBed.get(PasswordStrengthService);
    expect(service).toBeTruthy();
  });
});
