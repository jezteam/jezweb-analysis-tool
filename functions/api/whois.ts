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
  const cacheKey = `whois:${domain}`;
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
    // Use RDAP (Registration Data Access Protocol) as it's more standardized
    // Try different RDAP servers
    const rdapServers = [
      `https://rdap.org/domain/${domain}`,
      `https://rdap.verisign.com/com/v1/domain/${domain}`,
    ];

    let rdapData: any = null;

    for (const server of rdapServers) {
      try {
        const response = await fetch(server, {
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          rdapData = await response.json();
          break;
        }
      } catch {
        continue;
      }
    }

    if (!rdapData) {
      throw new Error('Unable to fetch WHOIS data');
    }

    // Parse RDAP response
    const result = {
      success: true,
      data: {
        domain: rdapData.ldhName || domain,
        registrar: rdapData.entities?.find((e: any) =>
          e.roles?.includes('registrar')
        )?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3],
        registrationDate: rdapData.events?.find((e: any) =>
          e.eventAction === 'registration'
        )?.eventDate,
        expirationDate: rdapData.events?.find((e: any) =>
          e.eventAction === 'expiration'
        )?.eventDate,
        updatedDate: rdapData.events?.find((e: any) =>
          e.eventAction === 'last changed'
        )?.eventDate,
        nameServers: rdapData.nameservers?.map((ns: any) => ns.ldhName),
        status: rdapData.status,
        rawData: JSON.stringify(rdapData, null, 2),
        timestamp: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        cached: false,
      },
    };

    const responseBody = JSON.stringify(result);

    // Cache for 24 hours
    await env.CACHE.put(cacheKey, responseBody, { expirationTtl: 86400 });

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
          message: error instanceof Error ? error.message : 'WHOIS lookup failed',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
