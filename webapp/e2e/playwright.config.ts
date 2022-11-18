import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
    projects: [
        {
            name: "Chrome Stable",
            use: {
                browserName: "chromium",
                viewport: { width: 1920, height: 1080 },
                channel: "chrome",
                screenshot: "only-on-failure",
            },
            timeout: 15000,
        },
    ],
};
export default config;
