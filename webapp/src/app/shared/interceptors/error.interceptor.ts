import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private snackBar: MatSnackBar) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                // Do nothing for now
            }
        }, (err: any) => {
            if (err instanceof HttpErrorResponse) {
                if (err.status !== 400) {
                    this.snackBar.open('Aconteceu algo errado. Tente efetuar login novamente', 'Fechar', { duration: 3000 });
                }
            }
        }));
    }
}
