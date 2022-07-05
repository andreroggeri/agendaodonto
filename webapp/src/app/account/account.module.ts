import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { DirectivesModule } from '../shared/directives/directives.module';
import { MaterialAppModule } from '../shared/material.app.module';
import { DentistService } from '../shared/services/dentist.service';
import { AccountComponent } from './account.component';

export const accountRoutes: Routes = [
    // { path: 'conta', component: AccountComponent, canActivate: [AuthGuard] }
];

@NgModule({
    imports: [CommonModule, MaterialAppModule, FlexLayoutModule, ReactiveFormsModule, RouterModule, DirectivesModule],
    declarations: [AccountComponent],
    providers: [DentistService],
})
export class AccountModule {

}
