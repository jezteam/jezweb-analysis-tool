import { useState } from 'react';
import { useHeadersAnalysis } from '../hooks/useHeadersAnalysis';
import { isValidURL, normalizeURL } from '../../../shared/lib/validators/url';
import { ERROR_MESSAGES } from '../../../shared/constants/messages';

export function HeadersAnalyzer() {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  const { status, result, error, analyze } = useHeadersAnalysis();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const normalizedUrl = normalizeURL(url);

    if (!isValidURL(normalizedUrl)) {
      setValidationError(ERROR_MESSAGES.INVALID_URL);
      return;
    }

    await analyze(normalizedUrl);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4">HTTP Headers Analyzer</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Analyze security headers and configuration
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="headers-url" className="block text-sm font-medium mb-2">
              Website URL
            </label>
            <input
              id="headers-url"
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
            {status === 'loading' ? 'Analyzing...' : 'Analyze Headers'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Security Score</h3>
              <span className={`text-3xl font-bold ${getScoreColor(result.securityScore)}`}>
                {result.securityScore}%
              </span>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Security Headers</h4>
              <div className="space-y-2">
                {result.securityHeaders.map((header, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-md border ${
                      header.present
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{header.name}</p>
                        {header.value && (
                          <p className="text-sm font-mono mt-1 text-gray-600 dark:text-gray-400">
                            {header.value}
                          </p>
                        )}
                        {header.recommendation && (
                          <p className="text-sm mt-1 text-red-600 dark:text-red-400">
                            {header.recommendation}
                          </p>
                        )}
                      </div>
                      <span className={`ml-2 ${header.present ? 'text-green-600' : 'text-red-600'}`}>
                        {header.present ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">All Headers</h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 max-h-64 overflow-y-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                  {Object.entries(result.headers)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n')}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
