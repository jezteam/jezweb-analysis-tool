import { useState } from 'react';
import { useDNSLookup } from '../hooks/useDNSLookup';
import type { DNSRecordType } from '../types/dns.types';
import { isValidDomain, normalizeDomain } from '../../../shared/lib/validators/domain';
import { ERROR_MESSAGES } from '../../../shared/constants/messages';

const RECORD_TYPES: DNSRecordType[] = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA'];

export function DNSChecker() {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState<DNSRecordType>('A');
  const [validationError, setValidationError] = useState('');

  const { status, result, error, lookup } = useDNSLookup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const normalizedDomain = normalizeDomain(domain);

    if (!isValidDomain(normalizedDomain)) {
      setValidationError(ERROR_MESSAGES.INVALID_DOMAIN);
      return;
    }

    await lookup(normalizedDomain, recordType);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
        <h2 className="text-2xl font-bold mb-4 text-foreground">DNS Lookup</h2>
        <p className="text-muted-foreground mb-6">
          Query DNS records for any domain
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="domain" className="block text-sm font-medium mb-2 text-foreground">
              Domain Name
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={status === 'loading'}
            />
            {validationError && (
              <p className="text-sm text-destructive mt-1">{validationError}</p>
            )}
          </div>

          <div>
            <label htmlFor="recordType" className="block text-sm font-medium mb-2 text-foreground">
              Record Type
            </label>
            <select
              id="recordType"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value as DNSRecordType)}
              className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={status === 'loading'}
            >
              {RECORD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {status === 'loading' ? 'Looking up...' : 'Lookup DNS'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {result && result.records.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              Results for {result.domain} ({result.recordType})
            </h3>
            <div className="space-y-2">
              {result.records.map((record, index) => (
                <div
                  key={index}
                  className="p-4 bg-muted rounded-md border border-border"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Type:</span>{' '}
                      <span className="text-foreground">{record.type}</span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">TTL:</span>{' '}
                      <span className="text-foreground">{record.TTL}s</span>
                    </div>
                    <div className="md:col-span-3">
                      <span className="font-medium text-muted-foreground">Data:</span>{' '}
                      <span className="text-foreground font-mono break-all">{record.data}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && result.records.length === 0 && (
          <div className="mt-6 p-4 bg-muted rounded-md border border-border">
            <p className="text-muted-foreground">No records found for this query</p>
          </div>
        )}
      </div>
    </div>
  );
}
