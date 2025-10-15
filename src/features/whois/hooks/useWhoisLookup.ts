import { useState } from 'react';
import type { WhoisResult } from '../types/whois.types';
import type { AnalysisStatus } from '../../../shared/types/common.types';
import { apiClient } from '../../../shared/lib/api/client';
import { API_ENDPOINTS } from '../../../shared/lib/api/endpoints';

export function useWhoisLookup() {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [result, setResult] = useState<WhoisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (domain: string) => {
    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.get<WhoisResult>(
        `${API_ENDPOINTS.WHOIS}?domain=${encodeURIComponent(domain)}`
      );

      if (response.success && response.data) {
        setResult(response.data);
        setStatus('success');
      } else {
        setError(response.error?.message || 'WHOIS lookup failed');
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
