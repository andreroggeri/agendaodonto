import { Injectable } from '@angular/core';

@Injectable()
export class TokenService {

    getToken(): string {
        const authToken = localStorage.getItem('auth_token');
        if (authToken == null) {
            throw new Error('Auth token not defined');
        } else {
            return authToken;
        }
    }

    setToken(token: string) {
        localStorage.setItem('auth_token', token);
    }

    isTokenAvailable(): boolean {
        return !!localStorage.getItem('auth_token');
    }

}
