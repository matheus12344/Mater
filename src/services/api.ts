// services/api.ts
import axios from 'axios';
import { OSM_CONFIG } from 'src/config/config';

const api = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org',
  headers: {
    'User-Agent': OSM_CONFIG.userAgent,
  },
});

api.interceptors.response.use(
  response => response,
  error => {
    // Tratamento global de erros
    return Promise.reject(error);
  }
);