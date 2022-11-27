export const settings = {
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  testMode: JSON.parse((process.env.TEST_MODE ?? 'false').toLowerCase()) as boolean,
  port: process.env.PORT ?? 3000,
  authenticationPath: process.env.AUTHENTICATION_PATH ?? './baileys_auth_info',
  secrets: {
    apiKey: process.env.API_KEY ?? 'fake-key',
    googleRecogApiKey: process.env.GOOGLE_RECOG_API_KEY ?? 'fake-key',
  }
};
