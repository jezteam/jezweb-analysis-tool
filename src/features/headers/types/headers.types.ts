export interface HeadersResult {
  url: string;
  headers: Record<string, string>;
  securityHeaders: {
    name: string;
    present: boolean;
    value?: string;
    recommendation?: string;
  }[];
  securityScore: number;
  timestamp: string;
}

export interface HeadersRequest {
  url: string;
}
