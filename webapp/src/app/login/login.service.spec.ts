import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import { configureTestSuite } from 'ng-bullet';
import { LoginService } from './login.service';

describe('LoginService', () => {

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                LoginService,
            ],

        });
    });

    it('should ...', inject([LoginService], (service: LoginService) => {
        expect(service).toBeTruthy();
    }));
});
