import { useState } from 'react';
import type { SecurityResult } from '../types/security.types';
import type { AnalysisStatus } from '../../../shared/types/common.types';
import { apiClient } from '../../../shared/lib/api/client';
import { API_ENDPOINTS } from '../../../shared/lib/api/endpoints';

export function useSecurityCheck() {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [result, setResult] = useState<SecurityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = async (url: string) => {
    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.get<SecurityResult>(
        `${API_ENDPOINTS.SECURITY}?url=${encodeURIComponent(url)}`
      );

      if (response.success && response.data) {
        setResult(response.data);
        setStatus('success');
      } else {
        setError(response.error?.message || 'Security check failed');
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

  return { status, result, error, check, reset };
}
