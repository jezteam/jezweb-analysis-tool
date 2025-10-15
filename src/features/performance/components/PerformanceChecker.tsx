import { useState } from 'react';
import { usePerformanceCheck } from '../hooks/usePerformanceCheck';
import { isValidURL, normalizeURL } from '../../../shared/lib/validators/url';
import { ERROR_MESSAGES } from '../../../shared/constants/messages';

export function PerformanceChecker() {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  const { status, result, error, check } = usePerformanceCheck();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const normalizedUrl = normalizeURL(url);

    if (!isValidURL(normalizedUrl)) {
      setValidationError(ERROR_MESSAGES.INVALID_URL);
      return;
    }

    await check(normalizedUrl);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getPerformanceRating = (loadTime: number) => {
    if (loadTime < 1000) return { text: 'Excellent', color: 'text-green-600 dark:text-green-400' };
    if (loadTime < 2500) return { text: 'Good', color: 'text-blue-600 dark:text-blue-400' };
    if (loadTime < 4000) return { text: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' };
    return { text: 'Poor', color: 'text-red-600 dark:text-red-400' };
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Performance Checker</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Analyze page load time and performance metrics
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="perf-url" className="block text-sm font-medium mb-2">
              Website URL
            </label>
            <input
              id="perf-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={status === 'loading'}
            />
            {validationError && (
              <p className="text-sm text-red-600 mt-1">{validationError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {status === 'loading' ? 'Testing...' : 'Test Performance'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Performance Results</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceRating(result.loadTime).color}`}>
                {getPerformanceRating(result.loadTime).text}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">Load Time</p>
                <p className="text-2xl font-bold">{result.loadTime}ms</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                <p className="text-2xl font-bold">{result.responseTime}ms</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">Content Size</p>
                <p className="text-lg font-bold">{formatSize(result.contentSize)}</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">Status Code</p>
                <p className="text-lg font-bold">
                  {result.statusCode}
                  <span className="ml-2 text-sm font-normal">
                    {result.statusCode < 300 ? '✓' : '✗'}
                  </span>
                </p>
              </div>

              {result.metrics?.ttfb && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time to First Byte</p>
                  <p className="text-lg font-bold">{result.metrics.ttfb}ms</p>
                </div>
              )}

              {result.redirects > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Redirects</p>
                  <p className="text-lg font-bold">{result.redirects}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
