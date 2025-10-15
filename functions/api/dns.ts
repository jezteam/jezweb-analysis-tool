import type { Env } from '../types/cloudflare';

interface DNSResponse {
  Status: number;
  Answer?: Array<{
    name: string;
    type: number;
    TTL: number;
    data: string;
  }>;
}

const DNS_TYPE_MAP: Record<string, number> = {
  'A': 1,
  'AAAA': 28,
  'MX': 15,
  'TXT': 16,
  'NS': 2,
  'CNAME': 5,
  'SOA': 6,
};

const DNS_TYPE_REVERSE: Record<number, string> = {
  1: 'A',
  28: 'AAAA',
  15: 'MX',
  16: 'TXT',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
};

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const domain = url.searchParams.get('domain');
  const recordType = url.searchParams.get('type') || 'A';

  // Validation
  if (!domain) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Domain parameter is required' }
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check cache
  const cacheKey = `dns:${domain}:${recordType}`;
  const cached = await env.CACHE.get(cacheKey);

  if (cached) {
    return new Response(cached, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT'
      },
    });
  }

  try {
    // Use Cloudflare's DNS over HTTPS API
    const dnsTypeNumber = DNS_TYPE_MAP[recordType];
    const dohUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${dnsTypeNumber}`;

    const response = await fetch(dohUrl, {
      headers: {
        'Accept': 'application/dns-json',
      },
    });

    if (!response.ok) {
      throw new Error('DNS lookup failed');
    }

    const dnsData: DNSResponse = await response.json();

    // Format response
    const records = (dnsData.Answer || []).map(record => ({
      name: record.name,
      type: DNS_TYPE_REVERSE[record.type] || 'UNKNOWN',
      TTL: record.TTL,
      data: record.data,
    }));

    const result = {
      success: true,
      data: {
        domain,
        recordType,
        records,
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        cached: false,
      },
    };

    const responseBody = JSON.stringify(result);

    // Cache for 1 hour
    await env.CACHE.put(cacheKey, responseBody, { expirationTtl: 3600 });

    return new Response(responseBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS'
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'DNS lookup failed',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
