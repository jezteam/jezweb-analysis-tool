export interface SecurityResult {
  url: string;
  safeBrowsing?: {
    safe: boolean;
    threats?: string[];
  };
  https: boolean;
  mixedContent: boolean;
  securityScore: number;
  timestamp: string;
}

export interface SecurityRequest {
  url: string;
}
