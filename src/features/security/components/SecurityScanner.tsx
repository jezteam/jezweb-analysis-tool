import { useState } from 'react';
import { useSecurityCheck } from '../hooks/useSecurityCheck';
import { isValidURL, normalizeURL } from '../../../shared/lib/validators/url';
import { ERROR_MESSAGES } from '../../../shared/constants/messages';

export function SecurityScanner() {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  const { status, result, error, check } = useSecurityCheck();

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Security Scanner</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Check for security vulnerabilities and malware
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="sec-url" className="block text-sm font-medium mb-2">
              Website URL
            </label>
            <input
              id="sec-url"
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
            {status === 'loading' ? 'Scanning...' : 'Scan Security'}
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
              <h3 className="text-lg font-semibold">Security Score</h3>
              <span className={`text-3xl font-bold ${getScoreColor(result.securityScore)}`}>
                {result.securityScore}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-md ${result.https ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <p className="text-sm text-gray-600 dark:text-gray-400">HTTPS Enabled</p>
                <p className={`text-lg font-bold ${result.https ? 'text-green-600' : 'text-red-600'}`}>
                  {result.https ? '✓ Yes' : '✗ No'}
                </p>
              </div>

              <div className={`p-4 rounded-md ${!result.mixedContent ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mixed Content</p>
                <p className={`text-lg font-bold ${!result.mixedContent ? 'text-green-600' : 'text-yellow-600'}`}>
                  {!result.mixedContent ? '✓ None' : '⚠ Detected'}
                </p>
              </div>

              {result.safeBrowsing && (
                <div className={`p-4 rounded-md md:col-span-2 ${result.safeBrowsing.safe ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Safe Browsing Status</p>
                  <p className={`text-lg font-bold ${result.safeBrowsing.safe ? 'text-green-600' : 'text-red-600'}`}>
                    {result.safeBrowsing.safe ? '✓ Safe' : '✗ Threats Detected'}
                  </p>
                  {result.safeBrowsing.threats && result.safeBrowsing.threats.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.safeBrowsing.threats.map((threat, i) => (
                        <li key={i} className="text-sm text-red-600">{threat}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Security Tips:</strong> Always use HTTPS, avoid mixed content, keep software updated,
                and implement security headers like CSP, HSTS, and X-Frame-Options.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
