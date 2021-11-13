import Redis = require("ioredis");
import { settings } from "./settings";


const [REDIS_HOST, REDIS_PORT] = settings.REDIS_URL.split(':')

export const redis = new Redis({
    host: REDIS_HOST,
    port: parseInt(REDIS_PORT),
});