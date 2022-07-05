import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseService } from '../shared/services/base.service';

@Injectable()
export class LoginService extends BaseService {

    constructor(private http: HttpClient) {
        super();
    }

    authenticate(formData: { email: string, password: string }): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.http.post(BaseService.API_AUTH_URL + 'token/login/', JSON.stringify(formData), { headers });
    }

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
    }

    isLogged(): boolean {
        return !!localStorage.getItem('auth_token');
    }

    getUserInfo() {
        this.http.get(BaseService.API_AUTH_URL + 'users/me/').subscribe(
            response => {
                localStorage.setItem('user_info', JSON.stringify(response));
                return response;
            },
        );
    }

    getLocalUserInfo() {
        const userInfo = localStorage.getItem('user_info');

        if (userInfo === null) {
            return null;
        } else {
            return JSON.parse(userInfo);
        }
    }
}
