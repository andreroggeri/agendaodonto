import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import localePtExtras from '@angular/common/locales/extra/pt';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { NgxMaskModule } from 'ngx-mask';
import { environment } from 'src/environments/environment';

import { AboutModule, aboutRoutes } from './about/about.module';
import { AccountModule, accountRoutes } from './account/account.module';
import { AppComponent } from './app.component';
import { ClinicModule, clinicRoutes } from './clinic/clinic.module';
import { DashboardModule, dashboardRoutes } from './dashboard/dashboard.module';
import { DentalPlanModule, dentalPlanRoutes } from './dental-plan/dental-plan.module';
import { FinanceModule } from './finance/finance.module';
import { LoginModule, loginRoutes } from './login/login.module';
import { PatientModule, patientRoutes } from './patient/patient.module';
import { RegisterModule, registerRoutes } from './register/register.module';
import { ScheduleModule, scheduleRoutes } from './schedule/schedule.module';
import { ErrorInterceptor } from './shared/interceptors/error.interceptor';
import { TokenInterceptor } from './shared/interceptors/token.interceptor';
import { MaterialAppModule } from './shared/material.app.module';
import { TokenService } from './shared/services/token.service';

registerLocaleData(localePt, localePtExtras);

export const routes: Routes = [
    ...dashboardRoutes,
    ...clinicRoutes,
    ...loginRoutes,
    ...registerRoutes,
    ...patientRoutes,
    ...scheduleRoutes,
    ...aboutRoutes,
    ...accountRoutes,
    ...dentalPlanRoutes,
];

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot(routes),
        HttpClientModule,
        // 3rd Party Modules
        MatMomentDateModule,
        MaterialAppModule,
        NgxMaskModule.forRoot(),
        StoreModule.forRoot({}, {}),
        EffectsModule.forRoot([]),
        StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !environment.production }),
        // App Modules
        DashboardModule,
        RegisterModule,
        ClinicModule,
        LoginModule,
        PatientModule,
        ScheduleModule,
        AboutModule,
        AccountModule,
        DentalPlanModule,
        FinanceModule,
    ],
    providers: [
        TokenService,
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
