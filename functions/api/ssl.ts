import type { Env } from '../types/cloudflare';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const domain = url.searchParams.get('domain');

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
  const cacheKey = `ssl:${domain}`;
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
    // Make HTTPS request to get certificate info
    const testUrl = `https://${domain}`;
    const response = await fetch(testUrl, {
      method: 'HEAD',
      redirect: 'follow',
    });

    // In Cloudflare Workers, we can't directly access certificate details
    // We'll use SSL Labs API as an alternative
    const sslLabsUrl = `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(domain)}&fromCache=on&maxAge=24`;

    const sslLabsResponse = await fetch(sslLabsUrl);
    const sslLabsData: any = await sslLabsResponse.json();

    let result;

    if (sslLabsData.status === 'READY' && sslLabsData.endpoints?.[0]) {
      const endpoint = sslLabsData.endpoints[0];
      const cert = endpoint.details?.cert;

      const validTo = cert?.notAfter ? new Date(cert.notAfter) : null;
      const now = new Date();
      const daysRemaining = validTo ? Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

      result = {
        success: true,
        data: {
          domain,
          valid: response.ok,
          issuer: cert?.issuerLabel,
          subject: cert?.subject,
          validFrom: cert?.notBefore ? new Date(cert.notBefore).toISOString() : undefined,
          validTo: validTo?.toISOString(),
          daysRemaining,
          protocol: endpoint.details?.protocols?.[0]?.name,
          cipher: endpoint.details?.suites?.list?.[0]?.name,
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          cached: false,
        },
      };
    } else {
      // Fallback: basic check
      result = {
        success: true,
        data: {
          domain,
          valid: response.ok,
          issuer: 'Unable to retrieve (use SSL Labs for details)',
          timestamp: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          cached: false,
        },
      };
    }

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
          message: error instanceof Error ? error.message : 'SSL check failed',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
