import {
    randEmail,
    randFirstName,
    randLastName,
    randNumber,
    randPassword,
} from "@ngneat/falso";
import { Page } from "@playwright/test";
import { IDentistResponse } from "../../src/app/shared/interfaces/services/dentist.model";
import { createBaseData } from "./data/base.data";
import { makeRequest } from "./request";
import { baseAppUrl, baseBackendUrl } from "./vars";

export interface TestUser {
    token: string;
    email: string;
    password: string;
}

async function generateToken(email: string, password: string): Promise<string> {
    const payload = { email, password };
    const loginResponse = await makeRequest<{ auth_token: string }>(
        `${baseBackendUrl}/auth/token/login/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    return loginResponse.auth_token;
}

async function getUserData(token: string) {
    return makeRequest<IDentistResponse>(`${baseBackendUrl}/auth/users/me`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        },
        method: "GET",
    });
}

export async function createUser(): Promise<TestUser> {
    const url = `${baseBackendUrl}/auth/users/`;
    const body = {
        first_name: randFirstName(),
        last_name: randLastName(),
        cro: randNumber().toString(),
        cro_state: "SP",
        sex: "M",
        email: randEmail(),
        password: randPassword(),
    };

    await makeRequest(url, {
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(body),
    });

    const token = await generateToken(body.email, body.password);

    return { token, email: body.email, password: body.password };
}

export async function createUserWithData() {
    const user = await createUser();
    const userData = await getUserData(user.token);
    await createBaseData(user.token, userData.id);

    return user;
}

export async function setupAuth(page: Page, user: TestUser) {
    await page.goto(`${baseAppUrl}/login`);
    await page.type('input[name="email"]', user.email);
    await page.type('input[name="password"]', user.password);
    await page.click("app-login button");
    await page.waitForSelector("app-dashboard mat-card");
}

export async function cleanupAuth(token: string, password: string) {
    const url = `${baseBackendUrl}/auth/users/me`;
    const body = {
        current_password: password,
    };

    return makeRequest(url, {
        method: "DELETE",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
        },
        raw: true,
    });
}
