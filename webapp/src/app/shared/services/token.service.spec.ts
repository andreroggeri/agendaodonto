import { inject, TestBed } from '@angular/core/testing';

import { configureTestSuite } from 'ng-bullet';
import { TokenService } from './token.service';

describe('TokenService', () => {

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [TokenService],
        });
    });

    beforeEach(() => {
        localStorage.clear();
    });

    it('should inject the service', inject([TokenService], (service: TokenService) => {
        expect(service).toBeTruthy();
    }));

    it('should get the auth token from localStorage', inject([TokenService], (service: TokenService) => {
        localStorage.setItem('auth_token', 'abc123');
        expect(service.getToken()).toBe('abc123');
    }));

    it('should save the auth token in the localStorage', inject([TokenService], (service: TokenService) => {
        service.setToken('abc123');
        expect(localStorage.getItem('auth_token')).toBe('abc123');
    }));

    it('should check the existence of the token in the localStorage', inject([TokenService], (service: TokenService) => {
        expect(service.isTokenAvailable()).toBeFalsy();
        service.setToken('abc123');
        expect(service.isTokenAvailable()).toBeTruthy();
    }));
});
