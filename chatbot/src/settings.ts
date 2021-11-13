const browserless = process.env.BROWSERLESS_URL || 'docker.for.mac.localhost:3000';
export const settings = {
    REDIS_URL: process.env.REDIS_URL || 'localhost:6379',
    SESSION_DATA: JSON.parse(Buffer.from(process.env.WHATSAPP_SESSION, 'base64').toString()),
    TEST_MODE: JSON.parse((process.env.TEST_MODE || 'false').toLowerCase()) as boolean,
    BROWSERLESS_URL: `ws://${browserless}`,
    DEV_MODE: JSON.parse(process.env.DEV_MODE || 'false') as boolean
}