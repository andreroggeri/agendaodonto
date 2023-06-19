export const settings = {
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  port: process.env.PORT ?? 3000,
  authenticationPath: process.env.AUTHENTICATION_PATH ?? './baileys_auth_info',
  scheduleApi: {
    url: process.env.API_URL ?? 'http://localhost:8000',
    clinicId: parseInt(process.env.CLINIC_ID ?? '1', 10),
  },
  secrets: {
    scheduleApiKey: process.env.SCHEDULE_API_KEY ?? 'fake-key',
    apiKey: process.env.API_KEY ?? 'fake-key',
    googleRecogApiKey: process.env.GOOGLE_RECOG_API_KEY ?? 'fake-key',
  },
};
