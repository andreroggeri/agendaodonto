import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { DirectivesModule } from '../shared/directives/directives.module';
import { MaterialAppModule } from '../shared/material.app.module';
import { TokenService } from '../shared/services/token.service';
import { LoginComponent } from './login.component';
import { LoginService } from './login.service';

export const loginRoutes: Routes = [
    { path: 'login', component: LoginComponent },
];

@NgModule({
    imports: [
        CommonModule,
        MaterialAppModule,
        FlexLayoutModule,
        ReactiveFormsModule,
        RouterModule,
        DirectivesModule,
    ],
    declarations: [LoginComponent],
    providers: [LoginService, TokenService],
})
export class LoginModule {
}
