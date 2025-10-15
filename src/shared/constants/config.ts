export const APP_NAME = 'Jezweb Analysis Tool';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Comprehensive website analysis and security tool';

export const API_BASE_URL = '/api';

export const CACHE_DURATION = {
  DNS: 3600, // 1 hour
  WHOIS: 86400, // 24 hours
  SSL: 3600, // 1 hour
  SECURITY: 1800, // 30 minutes
  PERFORMANCE: 300, // 5 minutes
  HEADERS: 300, // 5 minutes
} as const;

export const RATE_LIMIT = {
  MAX_REQUESTS: 100,
  WINDOW_MS: 60000, // 1 minute
} as const;
