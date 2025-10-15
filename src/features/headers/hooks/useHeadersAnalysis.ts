import { useState } from 'react';
import type { HeadersResult } from '../types/headers.types';
import type { AnalysisStatus } from '../../../shared/types/common.types';
import { apiClient } from '../../../shared/lib/api/client';
import { API_ENDPOINTS } from '../../../shared/lib/api/endpoints';

export function useHeadersAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [result, setResult] = useState<HeadersResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (url: string) => {
    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.get<HeadersResult>(
        `${API_ENDPOINTS.HEADERS}?url=${encodeURIComponent(url)}`
      );

      if (response.success && response.data) {
        setResult(response.data);
        setStatus('success');
      } else {
        setError(response.error?.message || 'Headers analysis failed');
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

  return { status, result, error, analyze, reset };
}
