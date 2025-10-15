export const ERROR_MESSAGES = {
  INVALID_URL: 'Please enter a valid URL',
  INVALID_DOMAIN: 'Please enter a valid domain name',
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  GENERIC_ERROR: 'An error occurred. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  ANALYSIS_COMPLETE: 'Analysis completed successfully',
  DATA_CACHED: 'Results cached for faster future lookups',
} as const;
