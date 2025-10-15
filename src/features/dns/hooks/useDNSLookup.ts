import { useState } from 'react';
import type { DNSLookupResult, DNSRecordType } from '../types/dns.types';
import type { AnalysisStatus } from '../../../shared/types/common.types';
import { apiClient } from '../../../shared/lib/api/client';
import { API_ENDPOINTS } from '../../../shared/lib/api/endpoints';

export function useDNSLookup() {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [result, setResult] = useState<DNSLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (domain: string, recordType: DNSRecordType = 'A') => {
    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.get<DNSLookupResult>(
        `${API_ENDPOINTS.DNS}?domain=${encodeURIComponent(domain)}&type=${recordType}`
      );

      if (response.success && response.data) {
        setResult(response.data);
        setStatus('success');
      } else {
        setError(response.error?.message || 'DNS lookup failed');
        setStatus('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setError(null);
  };

  return { status, result, error, lookup, reset };
}
