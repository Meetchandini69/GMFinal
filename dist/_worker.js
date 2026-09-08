// Bundled into dist/_worker.js by Vite for Cloudflare Pages.
const buildOrigin = "";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/uploads/')) {
      return env.ASSETS.fetch(request);
    }
    let upstream;
    try {
      upstream = new URL(env.API_ORIGIN || buildOrigin);
      if (upstream.protocol !== 'https:' || upstream.origin === url.origin || upstream.username || upstream.password) throw new Error();
    } catch {
      return Response.json({ error: 'API service is not configured.' }, { status: 503 });
    }
    // Restrict this proxy to the configured backend; never accept a target from the client.
    upstream.pathname = url.pathname;
    upstream.search = url.search;
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.set('X-Forwarded-Proto', 'https');
    const method = request.method;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const origin = headers.get('origin');
      if ((origin && origin !== url.origin) || headers.get('sec-fetch-site') === 'cross-site') {
        return Response.json({ error: 'Request origin is not allowed.' }, { status: 403 });
      }
    }
    try {
      const response = await fetch(upstream, {
        method, headers, body: ['GET', 'HEAD'].includes(method) ? undefined : request.body,
        redirect: 'manual',
      });
      const resultHeaders = new Headers(response.headers);
      resultHeaders.delete('set-cookie');
      for (const cookie of response.headers.getSetCookie()) {
        resultHeaders.append('Set-Cookie', cookie
          .replace(/;\s*Domain=[^;]*/gi, '')
          .replace(/;\s*SameSite=[^;]*/gi, '') + '; SameSite=Lax');
      }
      resultHeaders.set('Cache-Control', 'private, no-store');
      return new Response(response.body, { status: response.status, headers: resultHeaders });
    } catch {
      return Response.json({ error: 'Unable to reach the API. Please try again.' }, { status: 502 });
    }
  },
};
