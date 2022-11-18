import { randJobTitle } from "@ngneat/falso";
import { test, expect } from "@playwright/test";
import {
    cleanupAuth,
    createUserWithData,
    setupAuth,
    TestUser,
} from "../utils/authentication";

test.describe("Clinic", () => {
    let user: TestUser;

    test.beforeAll(async () => {
        user = await createUserWithData();
    });

    test.beforeEach(async ({ page }) => {
        await setupAuth(page, user);
        await page.click('mat-sidenav :text("Clinicas")');

        await page.waitForSelector("app-clinic table");
        await page.waitForSelector("app-clinic mat-progress-bar", {
            state: "detached",
        });
    });

    test.afterAll(async () => {
        await cleanupAuth(user.token, user.password);
    });

    test("should list clinics", async ({ page }) => {
        const rows = await page.$$("table tbody > tr");

        expect(rows.length).toBeGreaterThan(0);
    });

    test("should create clinic", async ({ page }) => {
        await page.click('a :text("Novo")');

        const newClinicName = randJobTitle().slice(0, 40);

        await page.type('input[formcontrolname="name"]', newClinicName);

        await page.click('button :text("Salvar")');

        await page.waitForNavigation();

        await page.waitForSelector("mat-progress-bar", { state: "detached" });

        const table = await page.$("app-clinic table");

        expect(await table?.textContent()).toContain(newClinicName);
    });

    test("should edit clinic", async ({ page }) => {
        const firstRow = await page.$("app-clinic table tbody > tr");
        const firstCol = await firstRow?.$("td");
        const actionsButton = await firstRow?.$("button");
        const oldClinicName = await firstCol?.textContent();
        const newClinicName = randJobTitle();

        await actionsButton?.click();

        await page.waitForSelector("mat-spinner", { state: "detached" });

        await page.type('input[formcontrolname="name"]', newClinicName);

        await page.click('button :text("Salvar")');

        await page.waitForNavigation();

        await page.waitForSelector("mat-progress-bar", { state: "detached" });

        const table = await page.$("app-clinic table");

        expect(await table?.textContent()).toContain(newClinicName);
        expect(await table?.textContent()).not.toContain(oldClinicName);
    });

    test("should delete clinic", async ({ page }) => {
        const firstRow = await page.$("app-clinic table tbody > tr");
        const firstCol = await firstRow?.$("td");
        const actionsButton = await firstRow?.$("button");
        const deletedClinicName = await firstCol?.textContent();

        await actionsButton?.click();

        await page.click('button :text("Apagar")');

        await page.click('button :text("Sim")');

        await page.waitForSelector("mat-progress-bar", { state: "detached" });

        const table = await page.waitForSelector("app-clinic table");

        expect(await table.textContent()).not.toContain(deletedClinicName);
    });
});
