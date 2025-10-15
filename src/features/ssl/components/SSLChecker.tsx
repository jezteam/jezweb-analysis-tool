import { useState } from 'react';
import { useSSLCheck } from '../hooks/useSSLCheck';
import { isValidDomain, normalizeDomain } from '../../../shared/lib/validators/domain';
import { ERROR_MESSAGES } from '../../../shared/constants/messages';

export function SSLChecker() {
  const [domain, setDomain] = useState('');
  const [validationError, setValidationError] = useState('');

  const { status, result, error, check } = useSSLCheck();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const normalizedDomain = normalizeDomain(domain);

    if (!isValidDomain(normalizedDomain)) {
      setValidationError(ERROR_MESSAGES.INVALID_DOMAIN);
      return;
    }

    await check(normalizedDomain);
  };

  const getStatusColor = () => {
    if (!result) return '';
    if (!result.valid) return 'text-red-600 dark:text-red-400';
    if (result.daysRemaining && result.daysRemaining < 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4">SSL/TLS Certificate Checker</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Verify SSL certificate validity and security
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ssl-domain" className="block text-sm font-medium mb-2">
              Domain Name
            </label>
            <input
              id="ssl-domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
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
            {status === 'loading' ? 'Checking...' : 'Check SSL Certificate'}
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
              <h3 className="text-lg font-semibold">
                Certificate for {result.domain}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()} bg-opacity-10`}>
                {result.valid ? '✓ Valid' : '✗ Invalid'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.issuer && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Issuer</p>
                  <p className="font-medium">{result.issuer}</p>
                </div>
              )}

              {result.subject && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Subject</p>
                  <p className="font-medium">{result.subject}</p>
                </div>
              )}

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">Valid From</p>
                <p className="font-medium">{formatDate(result.validFrom)}</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">Valid To</p>
                <p className="font-medium">{formatDate(result.validTo)}</p>
              </div>

              {result.daysRemaining !== undefined && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Days Remaining</p>
                  <p className={`font-bold text-lg ${getStatusColor()}`}>
                    {result.daysRemaining} days
                  </p>
                </div>
              )}

              {result.protocol && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Protocol</p>
                  <p className="font-medium">{result.protocol}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
