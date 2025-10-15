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
  const cacheKey = `performance:${targetUrl}`;
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
    const startTime = Date.now();

    const response = await fetch(targetUrl, {
      redirect: 'follow',
    });

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    const contentSize = parseInt(response.headers.get('content-length') || '0');

    // Count redirects by checking if final URL differs
    const finalUrl = response.url;
    const redirects = finalUrl !== targetUrl ? 1 : 0;

    const result = {
      success: true,
      data: {
        url: targetUrl,
        loadTime,
        responseTime: loadTime,
        contentSize,
        statusCode: response.status,
        redirects,
        metrics: {
          ttfb: loadTime, // Time to first byte approximation
        },
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
          message: error instanceof Error ? error.message : 'Performance check failed',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
