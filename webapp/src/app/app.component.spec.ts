import { APP_BASE_HREF } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { configureTestSuite } from 'ng-bullet';
import { AppComponent } from './app.component';
import { LoginService } from './login/login.service';
import { MaterialAppModule } from './shared/material.app.module';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                MaterialAppModule,
                NoopAnimationsModule,
                HttpClientTestingModule,
                RouterTestingModule,
            ],
            declarations: [
                AppComponent,
            ],
            providers: [
                LoginService,
                { provide: APP_BASE_HREF, useValue: '/' },
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
    });

    it('should create the app', async(() => {
        expect(component).toBeTruthy();
    }));

    it('should change the display type to mobile when the screen has less than 1600px', async(() => {
        expect(component.displayType).toBe('desktop');
        const resizeEvent = {
            type: 'resize',
            target: { innerWidth: 1600 },
        };
        component.onResize(resizeEvent);
        expect(component.displayType).toBe('mobile');
    }));

    it('should change the display type to desktop when the screen has more than 1600px', async(() => {
        expect(component.displayType).toBe('desktop');
        const resizeEvent = {
            type: 'resize',
            target: { innerWidth: 1601 },
        };
        component.onResize(resizeEvent);
        expect(component.displayType).toBe('desktop');
    }));

    it('should check the display size onInit', () => {
        spyOn(component, 'onResize');

        component.ngOnInit();
        expect(component.onResize).toHaveBeenCalled();
    });

    it('should clear the localStorage and redirect to login after logout', async(() => {
        const loginService = fixture.debugElement.injector.get(LoginService);
        const router = fixture.debugElement.injector.get(Router);
        spyOn(loginService, 'logout');
        spyOn(router, 'navigate').and.returnValue(new Promise(() => true));
        component.logout();
        expect(loginService.logout).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should close the sidenav only for mobile', async(() => {
        spyOn(component.sideNav, 'close');
        component.closeSideNav();
        expect(component.sideNav.close).toHaveBeenCalledTimes(0);
        component.displayType = 'mobile';
        component.closeSideNav();
        expect(component.sideNav.close).toHaveBeenCalled();
    }));

    it('should only display menus that doesnt requires login', async(() => {
        const loginService = fixture.debugElement.injector.get(LoginService);
        const loggedMenu = { name: 'TestMenu', link: 'aLink', requiresLogin: true, hideWhenLogged: false };
        const nonLoggedMenu = { name: 'TestMenu2', link: 'aLink2', requiresLogin: false, hideWhenLogged: true };
        spyOn(loginService, 'isLogged').and.returnValue(false);

        expect(component.shouldDisplayMenu(loggedMenu)).toBeFalsy();
        expect(component.shouldDisplayMenu(nonLoggedMenu)).toBeTruthy();
    }));

    it('should hide menus that requires login', async(() => {
        const loginService = fixture.debugElement.injector.get(LoginService);
        const loggedMenu = { name: 'TestMenu', link: 'aLink', requiresLogin: true, hideWhenLogged: false };
        const nonLoggedMenu = { name: 'TestMenu2', link: 'aLink2', requiresLogin: false, hideWhenLogged: true };
        spyOn(loginService, 'isLogged').and.returnValue(true);

        expect(component.shouldDisplayMenu(loggedMenu)).toBeTruthy();
        expect(component.shouldDisplayMenu(nonLoggedMenu)).toBeFalsy();
    }));
});
