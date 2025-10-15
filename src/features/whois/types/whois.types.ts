export interface WhoisResult {
  domain: string;
  registrar?: string;
  registrantOrganization?: string;
  registrationDate?: string;
  expirationDate?: string;
  updatedDate?: string;
  nameServers?: string[];
  status?: string[];
  rawData: string;
  timestamp: string;
}

export interface WhoisRequest {
  domain: string;
}
