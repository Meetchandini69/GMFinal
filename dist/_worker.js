const SEO_FIELDS = ['title','description','canonical','robots','og_title','og_description','og_image','twitter_title','twitter_description','twitter_image'];
function seoPath(path) {
  if (typeof path !== 'string' || !/^\/[a-zA-Z0-9/_-]*$/.test(path) || path.includes('//')) throw new Error('Use a page path such as /coimbatore.');
  return path.replace(/\/+$/, '') || '/';
}
function privateSeoPath(path) {
  return /^\/(admin|dashboard|login|member-profile|registration-thank-you)(\/|$)/.test(path);
}
function resolveSeo(path, page = null, overrides = {}, site = 'https://gigolomeet.in') {
  path = seoPath(path);
  const origin = new URL(site).origin;
  const builtins = { '/coimbatore': 'Coimbatore', '/hyderabad': 'Hyderabad', '/kolkata': 'Kolkata' };
  const city = page?.city || builtins[path];
  const labels = { '/': 'Gigolo Jobs in India', '/free-registration': 'Member Registration', '/login': 'Member Login', '/dashboard': 'Member Panel', '/registration-thank-you': 'Registration Complete' };
  const known = !!city || Object.hasOwn(labels, path) || privateSeoPath(path);
  const title = page?.title || `${city ? `Gigolo Services in ${city}` : labels[path] || (privateSeoPath(path) ? 'Private Member Area' : 'Page Not Found')} | GigoloMeet`;
  const description = page?.meta_description || (city
    ? `Explore GigoloMeet membership and companionship opportunities in ${city}${page?.state ? ', '+page.state : ''}. Choose a joining plan and register your profile. Joining fees apply.`
    : path === '/' ? 'Explore GigoloMeet membership and companionship opportunities across India. Choose a joining plan and create your profile. Joining fees apply.'
    : path === '/free-registration' ? 'Choose your GigoloMeet joining plan, create your login and complete your member profile. Joining fees are required for registration.'
    : privateSeoPath(path) ? 'Sign in to securely manage your GigoloMeet account and profile.' : 'The requested GigoloMeet page could not be found.');
  const seo = { title, description, canonical: origin + (path === '/' ? '/' : path), robots: known && !privateSeoPath(path) ? 'index, follow' : 'noindex, nofollow' };
  for (const field of SEO_FIELDS) if (typeof overrides[field] === 'string' && overrides[field].trim()) seo[field] = overrides[field].trim();
  if (privateSeoPath(path) || !known) seo.robots = 'noindex, nofollow';
  seo.og_title ||= seo.title; seo.og_description ||= seo.description; seo.og_image ||= '';
  seo.twitter_title ||= seo.og_title; seo.twitter_description ||= seo.og_description; seo.twitter_image ||= seo.og_image;
  return { ...seo, path, found: known };
}
function seoTags(seo) {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const meta = (key, value, property = false) => `<meta ${property ? 'property' : 'name'}="${key}" content="${escape(value)}" />`;
  return `<title>${escape(seo.title)}</title>\n` + [
    meta('description',seo.description), meta('robots',seo.robots),
    meta('og:title',seo.og_title,true),meta('og:description',seo.og_description,true),meta('og:url',seo.canonical,true),meta('og:type','website',true),
    ...(seo.og_image ? [meta('og:image',seo.og_image,true)] : []),
    meta('twitter:card',seo.twitter_image ? 'summary_large_image' : 'summary'),meta('twitter:title',seo.twitter_title),meta('twitter:description',seo.twitter_description),
    ...(seo.twitter_image ? [meta('twitter:image',seo.twitter_image)] : []),
    `<link rel="canonical" href="${escape(seo.canonical)}" />`,
  ].join('\n');
}
function renderSeoHtml(html, seo) {
  return html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b(?=[^>]*(?:name|property)\s*=\s*["'](?:description|robots|og:[^"']*|twitter:[^"']*)["'])[^>]*>/gi, '')
    .replace(/<link\b(?=[^>]*rel\s*=\s*["']canonical["'])[^>]*>/gi, '')
    .replace(/<\/head>/i, `${seoTags(seo)}\n</head>`);
}

// Bundled into dist/_worker.js by Vite for Cloudflare Pages.
const buildOrigin = "";
const siteOrigin = "https://gigolomeet.in";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/') && !url.pathname.startsWith('/uploads/')) {
      const asset = await env.ASSETS.fetch(request);
      if (!asset.headers.get('content-type')?.includes('text/html')) return asset;
      let metadata;
      let status = asset.status;
      try {
        const pathname = seoPath(url.pathname);
          const api = new URL(env.API_ORIGIN || buildOrigin);
          if (api.protocol !== 'https:' || api.origin === url.origin || api.username || api.password) throw new Error();
          api.pathname = '/api/page-seo'; api.search = ''; api.searchParams.set('path', pathname);
          const response = await fetch(api, { signal: AbortSignal.timeout(5000), headers: { Accept: 'application/json' } });
          if (!response.ok) throw new Error();
          metadata = await response.json();
          if (!metadata.found) status = 404;
      } catch {
        status = 503;
        metadata = resolveSeo('/', null, {}, env.SITE_URL || siteOrigin);
        metadata.title = 'Page temporarily unavailable | GigoloMeet';
        metadata.robots = 'noindex, nofollow';
      }
      const headers = new Headers(asset.headers);
      headers.delete('content-length'); headers.delete('etag'); headers.delete('content-encoding');
      headers.set('Cache-Control', 'no-store');
      if (status === 503) headers.set('Retry-After', '60');
      return new Response(request.method === 'HEAD' ? null : renderSeoHtml(await asset.text(), metadata), { status, headers });
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
