export const settings = {
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  TEST_MODE: JSON.parse((process.env.TEST_MODE || 'false').toLowerCase()) as boolean,
  PORT: process.env.PORT || 3000,
};
