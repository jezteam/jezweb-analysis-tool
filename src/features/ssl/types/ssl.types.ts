export interface SSLResult {
  domain: string;
  valid: boolean;
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  protocol?: string;
  cipher?: string;
  certificateChain?: string[];
  timestamp: string;
}

export interface SSLRequest {
  domain: string;
}
