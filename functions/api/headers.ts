import type { Env } from '../types/cloudflare';

const SECURITY_HEADERS = [
  {
    name: 'Strict-Transport-Security',
    recommendation: 'Enable HSTS to force HTTPS connections',
  },
  {
    name: 'Content-Security-Policy',
    recommendation: 'Implement CSP to prevent XSS attacks',
  },
  {
    name: 'X-Frame-Options',
    recommendation: 'Prevent clickjacking attacks',
  },
  {
    name: 'X-Content-Type-Options',
    recommendation: 'Prevent MIME-sniffing attacks',
  },
  {
    name: 'Referrer-Policy',
    recommendation: 'Control referrer information',
  },
  {
    name: 'Permissions-Policy',
    recommendation: 'Control browser features and APIs',
  },
];

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'URL parameter is required' }
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check cache
  const cacheKey = `headers:${targetUrl}`;
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
    const response = await fetch(targetUrl, {
      method: 'HEAD',
      redirect: 'follow',
    });

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const securityHeaders = SECURITY_HEADERS.map(header => {
      const value = response.headers.get(header.name);
      return {
        name: header.name,
        present: !!value,
        value: value || undefined,
        recommendation: !value ? header.recommendation : undefined,
      };
    });

    const presentCount = securityHeaders.filter(h => h.present).length;
    const securityScore = Math.round((presentCount / SECURITY_HEADERS.length) * 100);

    const result = {
      success: true,
      data: {
        url: targetUrl,
        headers,
        securityHeaders,
        securityScore,
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        cached: false,
      },
    };

    const responseBody = JSON.stringify(result);

    // Cache for 5 minutes
    await env.CACHE.put(cacheKey, responseBody, { expirationTtl: 300 });

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
          message: error instanceof Error ? error.message : 'Headers analysis failed',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
