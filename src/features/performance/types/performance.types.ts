export interface PerformanceResult {
  url: string;
  loadTime: number;
  responseTime: number;
  contentSize: number;
  statusCode: number;
  redirects: number;
  metrics?: {
    ttfb?: number;
    fcp?: number;
    lcp?: number;
  };
  timestamp: string;
}

export interface PerformanceRequest {
  url: string;
}
