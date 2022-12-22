import axios from 'axios';
import { settings } from '../../settings';

const http = axios.create({
  baseURL: settings.scheduleApi.url,
  headers: {
    Authorization: `ApiKey ${settings.secrets.scheduleApiKey}`,
  },
});

export default http;
