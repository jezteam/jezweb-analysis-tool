export type DNSRecordType = 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CNAME' | 'SOA';

export interface DNSRecord {
  name: string;
  type: DNSRecordType;
  TTL: number;
  data: string;
}

export interface DNSLookupResult {
  domain: string;
  recordType: DNSRecordType;
  records: DNSRecord[];
  timestamp: string;
}

export interface DNSLookupRequest {
  domain: string;
  recordType: DNSRecordType;
}
