import { rand } from "@ngneat/falso";
import { Page } from "@playwright/test";

export async function randomOption(page: Page, selector: string) {
    await page.click(selector);
    try {
        await page.waitForSelector("mat-option", { timeout: 500 });
    } catch (e) {
        // Sometimes the animation isnt finished
        // Blocking the next events.
        await page.click(selector);
    }
    const options = await page.$$("mat-option span.mat-option-text");
    const availableOptions: Array<string> = [];

    for (const option of options) {
        availableOptions.push((await option.textContent()) as string);
    }

    const selectedOption = rand(availableOptions);

    await page.click(`mat-option :text("${selectedOption}")`);
    await page.waitForSelector("mat-option", { state: "detached" });
}

export async function selectByName(page: Page, selector: string, name: string) {
    await page.click(selector);

    await page.click(`mat-option :text("${name}")`);
}
