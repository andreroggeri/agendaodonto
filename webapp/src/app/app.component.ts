import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { Md5 } from 'ts-md5/dist/md5';

import { LoginService } from './login/login.service';

interface IMenu {
    name: string;
    link?: string;
    requiresLogin: boolean;
    hideWhenLogged: boolean;
    submenus?: ISubmenu[];
}

interface ISubmenu {
    name: string;
    link?: string;
}

type Display = 'desktop' | 'mobile';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    @ViewChild('sidenav', { static: true }) sideNav: MatSidenav;
    displayType: Display = 'desktop';
    sideNavMenus: IMenu[] = [
        { name: 'Dashboard', link: '/dashboard', requiresLogin: true, hideWhenLogged: false },
        { name: 'Clinicas', link: '/clinicas', requiresLogin: true, hideWhenLogged: false },
        { name: 'Planos', link: '/planos', requiresLogin: true, hideWhenLogged: false },
        { name: 'Pacientes', link: '/pacientes', requiresLogin: true, hideWhenLogged: false },
        {
            name: 'Financeiro', requiresLogin: true, hideWhenLogged: false, submenus: [
                { name: 'Tipos de Despesas', link: '/tipo-transacao' },
            ],
        },
        { name: 'Agenda', link: '/agenda', requiresLogin: true, hideWhenLogged: false },
        { name: 'Login', link: '/login', requiresLogin: false, hideWhenLogged: true },
        { name: 'Sobre', link: '/sobre', requiresLogin: false, hideWhenLogged: false },
        // { name: 'Minha Conta', link: '/conta', requiresLogin: true, hideWhenLogged: false },
    ];

    constructor(public loginService: LoginService, private router: Router) {

    }

    ngOnInit() {
        window.dispatchEvent(new Event('resize'));
    }

    logout() {
        this.loginService.logout();
        this.router.navigate(['/login']);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (event.type === 'resize') {
            if (event.target.innerWidth > 1600) {
                this.displayType = 'desktop';
                this.sideNav.mode = 'side';
                this.sideNav.toggle(true);
            } else {
                this.displayType = 'mobile';
                this.sideNav.mode = 'over';
                this.sideNav.toggle(false);
            }
        }
    }

    closeSideNav() {
        if (this.displayType === 'mobile') {
            this.sideNav.close();
        }
    }

    getProfileUrl() {
        const userInfo = this.loginService.getLocalUserInfo();
        if (userInfo) {
            return Md5.hashAsciiStr(userInfo.email);
        } else {
            return Md5.hashAsciiStr('');
        }
    }

    shouldDisplayMenu(menu: IMenu): boolean {
        if (this.loginService.isLogged()) {
            return !menu.hideWhenLogged;
        } else {
            return !menu.requiresLogin;
        }
    }
}
