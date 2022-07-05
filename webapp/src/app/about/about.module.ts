import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';

import { MaterialAppModule } from '../shared/material.app.module';
import { AboutComponent } from './about.component';

export const aboutRoutes: Routes = [
    { path: 'sobre', component: AboutComponent },
];

@NgModule({
    imports: [
        CommonModule, MaterialAppModule, RouterModule, FlexLayoutModule,
    ],
    declarations: [AboutComponent],
})
export class AboutModule { }
