import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes } from '@angular/router';

import { DirectivesModule } from '../shared/directives/directives.module';
import { MaterialAppModule } from '../shared/material.app.module';
import { DentistService } from '../shared/services/dentist.service';
import { ConfirmComponent } from './confirm.component';
import { RegisterComponent } from './register.component';

export const registerRoutes: Routes = [
    { path: 'cadastro', component: RegisterComponent },
    { path: 'cadastro/ativar/:uid/:token', component: ConfirmComponent },
];

@NgModule({
    imports: [
        CommonModule, MaterialAppModule, FlexLayoutModule, ReactiveFormsModule, DirectivesModule,
    ],
    declarations: [RegisterComponent, ConfirmComponent],
    exports: [RegisterComponent, ConfirmComponent],
    providers: [DentistService],
})
export class RegisterModule { }
