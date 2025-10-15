import { useState } from 'react';
import { useWhoisLookup } from '../hooks/useWhoisLookup';
import { isValidDomain, normalizeDomain } from '../../../shared/lib/validators/domain';
import { ERROR_MESSAGES } from '../../../shared/constants/messages';

export function WhoisChecker() {
  const [domain, setDomain] = useState('');
  const [validationError, setValidationError] = useState('');

  const { status, result, error, lookup } = useWhoisLookup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const normalizedDomain = normalizeDomain(domain);

    if (!isValidDomain(normalizedDomain)) {
      setValidationError(ERROR_MESSAGES.INVALID_DOMAIN);
      return;
    }

    await lookup(normalizedDomain);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4">WHOIS Lookup</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Get domain registration information
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="whois-domain" className="block text-sm font-medium mb-2">
              Domain Name
            </label>
            <input
              id="whois-domain"
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
            {status === 'loading' ? 'Looking up...' : 'Lookup WHOIS'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">
              Registration Information for {result.domain}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">Registrar</p>
                <p className="font-medium">{result.registrar || 'N/A'}</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">Organization</p>
                <p className="font-medium">{result.registrantOrganization || 'N/A'}</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">Registration Date</p>
                <p className="font-medium">{formatDate(result.registrationDate)}</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">Expiration Date</p>
                <p className="font-medium">{formatDate(result.expirationDate)}</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">Updated Date</p>
                <p className="font-medium">{formatDate(result.updatedDate)}</p>
              </div>

              {result.status && result.status.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <div className="space-y-1 mt-1">
                    {result.status.slice(0, 3).map((s, i) => (
                      <p key={i} className="text-xs font-mono">{s}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {result.nameServers && result.nameServers.length > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Name Servers</p>
                <div className="space-y-1">
                  {result.nameServers.map((ns, i) => (
                    <p key={i} className="font-mono text-sm">{ns}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
