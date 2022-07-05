import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { TokenService } from '../services/token.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(private tokenService: TokenService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            setHeaders: {
                'Content-Type': 'application/json',
            },
        });
        if (this.tokenService.isTokenAvailable()) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Token ${this.tokenService.getToken()}`,
                },
            });
        }
        return next.handle(request);
    }
}
