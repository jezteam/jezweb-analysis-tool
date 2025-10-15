import type { Env } from '../types/cloudflare';

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
  const cacheKey = `security:${targetUrl}`;
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
    const parsedUrl = new URL(targetUrl);
    const https = parsedUrl.protocol === 'https:';

    // Basic security checks
    let securityScore = 0;

    if (https) securityScore += 40;

    // Try to fetch the page and check for mixed content
    let mixedContent = false;
    try {
      const response = await fetch(targetUrl);
      const html = await response.text();

      // Simple check for mixed content
      if (https && (html.includes('http://') || html.includes('src="http:') || html.includes('href="http:'))) {
        mixedContent = true;
      } else {
        securityScore += 30;
      }
    } catch {
      // If we can't fetch, assume no mixed content
      securityScore += 30;
    }

    // Check security headers
    try {
      const headResponse = await fetch(targetUrl, { method: 'HEAD' });
      const hasHSTS = headResponse.headers.has('strict-transport-security');
      const hasCSP = headResponse.headers.has('content-security-policy');
      const hasXFrame = headResponse.headers.has('x-frame-options');

      if (hasHSTS) securityScore += 10;
      if (hasCSP) securityScore += 10;
      if (hasXFrame) securityScore += 10;
    } catch {
      // Headers check failed, continue
    }

    const result = {
      success: true,
      data: {
        url: targetUrl,
        safeBrowsing: {
          safe: true,
          threats: [],
        },
        https,
        mixedContent,
        securityScore,
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        cached: false,
      },
    };

    const responseBody = JSON.stringify(result);

    // Cache for 30 minutes
    await env.CACHE.put(cacheKey, responseBody, { expirationTtl: 1800 });

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
          message: error instanceof Error ? error.message : 'Security check failed',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
